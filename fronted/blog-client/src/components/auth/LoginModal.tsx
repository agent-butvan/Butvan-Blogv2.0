'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw, Lock, Mail, CheckCircle } from 'lucide-react'
import { Modal, Spinner, toast } from '@heroui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import { getWechatQRCode, loginByEmailCode, sendEmailCode, wechatExchange } from '@/lib/auth-api'
import { AppError } from '@/lib/error-handler'

/** 后端 API 基地址 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

/** 邮箱彩色 SVG 图标 */
const EmailIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="3" fill="#4F6EF7" opacity="0.15" />
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#4F6EF7" strokeWidth="1.5" />
    <path d="M2 7l8.5 5.5a3 3 0 003 0L22 7" stroke="#4F6EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** 微信官方彩色 SVG 图标 */
const WechatIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.084 6.084 0 01-.248-1.727c0-3.572 3.218-6.467 7.188-6.467.256 0 .507.018.755.04C16.452 4.858 12.891 2.188 8.691 2.188zm-2.35 4.09c.606 0 1.098.494 1.098 1.1 0 .609-.492 1.1-1.099 1.1-.606 0-1.098-.491-1.098-1.1 0-.606.492-1.1 1.098-1.1zm4.703 0c.606 0 1.098.494 1.098 1.1 0 .609-.492 1.1-1.098 1.1-.607 0-1.099-.491-1.099-1.1 0-.606.492-1.1 1.099-1.1zM16.442 9.18c-3.5 0-6.342 2.533-6.342 5.66 0 3.128 2.842 5.66 6.342 5.66.652 0 1.28-.084 1.878-.24a.723.723 0 01.6.082l1.26.738a.272.272 0 00.14.045c.133 0 .241-.11.241-.245 0-.06-.024-.12-.04-.178l-.258-.983a.49.49 0 01.177-.554C21.913 18.19 22.784 16.502 22.784 14.84c0-3.127-2.84-5.66-6.342-5.66zm-2.145 3.356c.504 0 .913.41.913.915 0 .507-.41.915-.913.915a.916.916 0 01-.913-.915c0-.506.41-.915.913-.915zm4.29 0c.505 0 .913.41.913.915 0 .507-.408.915-.913.915a.916.916 0 01-.913-.915c0-.506.41-.915.913-.915z" fill="#07C160" />
  </svg>
)

/**
 * 将可能引发 Mixed Content 报错的 HTTP 图片请求转换为本地 HTTPS 代理转发
 */
const getSafeImageUrl = (url: string) => {
  if (!url) return ''
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return `/image-proxy?url=${encodeURIComponent(url)}`
  }
  return url
}

interface CachedWechatQR {
  qrUrl: string
  wsId: string
  expiryTimestamp: number
}

let wechatQRCache: CachedWechatQR | null = null

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

/** 面板模式：邮箱登录 / 微信登录 */
type PanelMode = 'email' | 'wechat'

/**
 * 登录/注册弹窗组件
 * - 使用 HeroUI Modal / Spinner，其余为原生 HTML 元素
 * - 支持邮箱登录（一键验证码登录注册）、微信扫码登录两种模式
 * - 采用 Shadcn 风格卡片布局，紧凑排版
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [panel, setPanel] = useState<PanelMode>('email')
  const { login: authLogin } = useAuth()

  // ---- 邮箱验证码登录/注册状态 ----
  const [emailInput, setEmailInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  // ---- 验证码发送倒计时状态 ----
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [codeSending, setCodeSending] = useState(false)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // ---- 验证码有效期倒计时状态（5分钟 = 300秒） ----
  const [codeExpiryCountdown, setCodeExpiryCountdown] = useState(0)
  const codeExpiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---- 微信二维码状态 ----
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  /** 二维码当前状态：waiting=等待扫码 | scanned=已扫码 | logging=登录中 | expired=已过期 | error=异常 */
  const [qrStatus, setQrStatus] = useState<'waiting' | 'scanned' | 'logging' | 'expired' | 'error'>('waiting')
  // ---- 微信协议同意与政策展示状态 ----
  const [wechatAgreed, setWechatAgreed] = useState(false)
  const [showWechatPolicy, setShowWechatPolicy] = useState(false)
  /** 微信登录异常提示信息 */
  const [wechatMsg, setWechatMsg] = useState('')
  /** 二维码过期倒计时（秒） */
  const [expiryCount, setExpiryCount] = useState(0)

  /** WebSocket 连接管理 */
  const { lastMessage, connect: wsConnect, disconnect: wsDisconnect, send: wsSend } = useWebSocket()
  /** 过期定时器 ref */
  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 打开弹窗时重置状态 */
  useEffect(() => {
    if (isOpen) {
      setLoginError('')
      setQrError('')
      setWechatMsg('')
      if (panel === 'wechat') fetchWechatQR(false)
    } else {
      setEmailInput('')
      setCodeInput('')
      setQrCodeUrl('')
      setQrStatus('waiting')
      setExpiryCount(0)
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
      wsDisconnect()
      // 清理验证码发送倒计时
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
      setCodeCountdown(0)
      setCodeSending(false)
      // 清理验证码有效期倒计时
      if (codeExpiryTimerRef.current) {
        clearInterval(codeExpiryTimerRef.current)
        codeExpiryTimerRef.current = null
      }
      setCodeExpiryCountdown(0)
    }
  }, [isOpen])

  /** 切换到微信模式时自动获取二维码 */
  useEffect(() => {
    if (panel === 'wechat' && isOpen) fetchWechatQR(false)
  }, [panel])

  /** 切换面板并重置错误 */
  const switchPanel = (target: PanelMode) => {
    setLoginError('')
    setPanel(target)
  }

  // ===================== API 调用 =====================

  /** 获取微信二维码并建立 WebSocket 连接 */
  const fetchWechatQR = useCallback(async (forceRefresh = false) => {
    setQrLoading(true)
    setQrError('')
    setQrStatus('waiting')
    setExpiryCount(0)
    // 断开旧的 WS 连接并清除过期定时器
    wsDisconnect()
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
    try {
      let qrUrl = ''
      let wsId = ''
      let remainingSeconds = 110

      const now = Date.now()
      if (!forceRefresh && wechatQRCache && wechatQRCache.expiryTimestamp > now + 5000) {
        // 复用未过期的缓存（保留至少5秒余量）
        qrUrl = wechatQRCache.qrUrl
        wsId = wechatQRCache.wsId
        remainingSeconds = Math.floor((wechatQRCache.expiryTimestamp - now) / 1000)
      } else {
        // 请求新二维码
        const data = await getWechatQRCode()
        qrUrl = data.qrUrl
        wsId = data.wsId
        remainingSeconds = 110
        wechatQRCache = {
          qrUrl,
          wsId,
          expiryTimestamp: now + 110 * 1000
        }
      }

      setQrCodeUrl(qrUrl)
      // 建立 WebSocket 连接，监听扫码事件
      wsConnect(wsId)
      
      setExpiryCount(remainingSeconds)
      expiryTimerRef.current = setInterval(() => {
        setExpiryCount((prev) => {
          if (prev <= 1) {
            if (expiryTimerRef.current) clearInterval(expiryTimerRef.current)
            expiryTimerRef.current = null
            setQrStatus('expired')
            wsDisconnect()
            wechatQRCache = null // 过期时清除缓存
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setQrError(err instanceof AppError ? err.message : '获取二维码失败')
    } finally {
      setQrLoading(false)
    }
  }, [wsConnect, wsDisconnect])

  /** 监听 WebSocket 推送消息（扫码、登录成功、注册成功、异常等事件） */
  useEffect(() => {
    if (!lastMessage) return
    console.log('[微信WS] 收到消息:', lastMessage)

    // 异常事件（邮箱信息异常等）
    if (lastMessage.code === 500) {
      setQrStatus('error')
      setWechatMsg(lastMessage.message || '登录异常，请重试')
      toast.danger(lastMessage.message || '登录异常，请重试', { timeout: 0 })
      return
    }

    // 扫码事件：用户已扫描二维码
    if (lastMessage.event === 'weixin' && lastMessage.code === 200 && lastMessage.message.includes('扫描')) {
      setQrStatus('scanned')
      toast.info(lastMessage.message, { timeout: 3000 })
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
      wechatQRCache = null // 扫码成功，清除缓存避免重复利用
      return
    }

    // 登录成功事件（已有用户扫码登录）
    if (lastMessage.event === 'weixin' && lastMessage.code === 200 && lastMessage.message.includes('登录成功')) {
      toast.success(lastMessage.message, { timeout: 0 })
      wechatQRCache = null // 登录成功，清除缓存
      handleWechatLoginSuccess(lastMessage.data)
      return
    }

    // 注册成功事件（新用户首次注册）
    if (lastMessage.event === 'login' && lastMessage.code === 200) {
      toast.success(lastMessage.message, { timeout: 0 })
      wechatQRCache = null // 注册成功，清除缓存
      handleWechatLoginSuccess(lastMessage.data)
      return
    }
  }, [lastMessage])

  /**
   * 微信扫码登录/注册成功后，交换 Token 并完成登录
   */
  const handleWechatLoginSuccess = async (data?: Record<string, unknown>) => {
    setQrStatus('logging')
    setWechatMsg('')
    try {
      const exchangeCode = data?.exchangeCode as string | undefined
      if (exchangeCode) {
        const { user } = await wechatExchange(exchangeCode)
        authLogin({
          nickname: user.nickname || user.email || '用户',
          avatarUrl: user.avatarUrl || null,
          username: user.username || null,
          email: user.email || null,
        })
      } else {
        const res = await fetch(`${API_BASE}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          const json = await res.json()
          if (json?.code === 200 && json.data) {
            const d = json.data
            authLogin({
              nickname: d.nickname || d.email || '用户',
              avatarUrl: d.avatarUrl || null,
              username: d.username || null,
              email: d.email || null,
            })
          }
        }
      }
      wsSend('close')
      setTimeout(() => wsDisconnect(), 300)
      // 使用 requestAnimationFrame 延迟关闭，避免 Modal transition abort
      requestAnimationFrame(() => {
        setTimeout(() => onClose(), 50)
      })
    } catch (err) {
      console.error('[微信登录] Token 交换失败:', err)
      setQrStatus('error')
      setWechatMsg('登录凭证交换失败，请重试')
    }
  }

  /** 面板切换或弹窗关闭时清理 WS 连接和定时器 */
  useEffect(() => {
    if (panel !== 'wechat' || !isOpen) {
      setQrStatus('waiting')
      setExpiryCount(0)
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
      wsDisconnect()
    }
  }, [panel, isOpen, wsDisconnect])

  /** 获取邮箱验证码 */
  const handleGetEmailCode = async () => {
    if (!emailInput.trim()) {
      setLoginError('请输入邮箱地址')
      return
    }
    // 简单正则校验邮箱
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setLoginError('请输入正确的邮箱格式')
      return
    }
    setLoginError('')
    setCodeSending(true)
    try {
      await sendEmailCode(emailInput.trim())
      toast.success('验证码已发送至您的邮箱，请查收', { timeout: 3000 })
      // 开启 60 秒重发倒计时
      setCodeCountdown(60)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = setInterval(() => {
        setCodeCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
      // 开启 300 秒（5分钟）验证码有效期倒计时
      setCodeExpiryCountdown(300)
      if (codeExpiryTimerRef.current) clearInterval(codeExpiryTimerRef.current)
      codeExpiryTimerRef.current = setInterval(() => {
        setCodeExpiryCountdown((prev) => {
          if (prev <= 1) {
            if (codeExpiryTimerRef.current) clearInterval(codeExpiryTimerRef.current)
            codeExpiryTimerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setLoginError(err instanceof AppError ? err.message : '发送验证码失败，请重试')
    } finally {
      setCodeSending(false)
    }
  }

  /** 邮箱登录 / 注册 */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim() || !codeInput.trim()) {
      setLoginError('请输入邮箱和验证码')
      return
    }
    setLoginSubmitting(true)
    setLoginError('')
    try {
      const { user } = await loginByEmailCode(emailInput.trim(), codeInput.trim())
      authLogin({
        nickname: user.nickname || user.email || '用户',
        avatarUrl: user.avatarUrl || null,
        username: user.username || null,
        email: user.email || null,
      })
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
      if (codeExpiryTimerRef.current) {
        clearInterval(codeExpiryTimerRef.current)
        codeExpiryTimerRef.current = null
      }
      // 使用 requestAnimationFrame 延迟关闭，避免 Modal transition abort
      requestAnimationFrame(() => {
        setTimeout(() => onClose(), 50)
      })
    } catch (err) {
      setLoginError(err instanceof AppError ? err.message : '网络连接失败，请稍后重试')
    } finally {
      setLoginSubmitting(false)
    }
  }

  // ===================== 样式常量 =====================

  /** 输入框统一柔和主题色 */
  const inputCls = 'flex h-9 w-full text-sm rounded-lg border border-[#C4C8E6]/60 dark:border-[#727BBA]/30 bg-[#F5F6FB] dark:bg-[#1E2035] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#727BBA]/40 focus:border-[#727BBA]'
  /** 主按钮柔和渐变 */
  const primaryBtnCls = 'inline-flex items-center justify-center w-full h-9 rounded-lg text-sm font-medium bg-gradient-to-r from-[#727BBA] to-[#8B93CC] text-white shadow-md shadow-[#727BBA]/20 hover:shadow-lg hover:shadow-[#727BBA]/30 hover:from-[#6870AD] hover:to-[#7D85BF] transition-all disabled:opacity-50 disabled:pointer-events-none'
  /** label 柔和样式 */
  const labelCls = 'text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-none'

  // ===================== 渲染 =====================

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose() }}
      >
        <Modal.Container className="items-center">
          <Modal.Dialog className="relative sm:max-w-[420px] bg-gradient-to-b from-[#FAFBFF] to-[#F2F3FA] dark:from-[#181B2E] dark:to-[#141625] shadow-2xl shadow-[#727BBA]/10 dark:shadow-black/30 rounded-xl p-0 overflow-hidden border border-[#C4C8E6]/30 dark:border-[#727BBA]/15">
            <Modal.CloseTrigger />

            {/* ===== 微信登录服务与隐私协议详情遮罩卡片 ===== */}
            {showWechatPolicy && (
              <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#141625]/95 backdrop-blur-sm p-6 flex flex-col justify-between transition-all duration-300">
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-3 border-b border-[#C4C8E6]/30 dark:border-[#727BBA]/15">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#07C160]">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      微信登录服务与隐私协议
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowWechatPolicy(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-4 space-y-3.5 leading-relaxed">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">欢迎使用微信扫码登录服务。在您扫码绑定前，请仔细阅读以下须知：</p>
                    
                    <div>
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#07C160]" />
                        1. 微信测试公众号说明
                      </h4>
                      <p className="pl-2.5">
                        本站目前使用微信提供的<strong>“接口测试帐号”</strong>提供扫码服务，以进行登录与注册的对接。
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#07C160]" />
                        2. 关注用户配额上限（名额20人）
                      </h4>
                      <p className="pl-2.5">
                        由于微信官方对测试公众号的配额限制，该测试号的<strong>关注用户配额上限仅为 20 个</strong>。本登录注册渠道名额有限，采取<strong>先到先得</strong>原则。名额配满后微信官方将拒绝新用户关注与登录。
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#07C160]" />
                        3. 服务通知与文章提醒推送
                      </h4>
                      <p className="pl-2.5">
                        您扫码并关注此测试公众号，即表示同意与授权：<strong>后期本博客平台发布新文章、精选内容或系统重大调整时，系统将通过该微信测试公众号自动向您推送服务消息提醒与通知。</strong>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#07C160]" />
                        4. 隐私安全保障
                      </h4>
                      <p className="pl-2.5">
                        我们仅读取微信派发的安全标识映射码（OpenID/UnionID）用于博客账号匹配，绝不会向外界透露您的微信账户信息或将名额移作它用。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#C4C8E6]/30 dark:border-[#727BBA]/15 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowWechatPolicy(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 bg-[#F5F6FB] dark:bg-[#1E2035] hover:bg-[#EAEBF4] dark:hover:bg-[#252840] transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWechatAgreed(true)
                      setShowWechatPolicy(false)
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#07C160] hover:bg-[#06ad56] text-white transition-colors cursor-pointer shadow-sm"
                  >
                    同意并勾选
                  </button>
                </div>
              </div>
            )}

            {/* ===== 标题区域 ===== */}
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#727BBA] to-[#9BADCF] bg-clip-text text-transparent tracking-tight leading-none">
                {panel === 'wechat' ? '微信扫码' : '邮箱登录 / 注册'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {panel === 'wechat'
                  ? '扫描下方二维码，已有账号自动登录，新用户自动注册。'
                  : '使用邮箱验证码一键登录，新邮箱将自动创建账号。'}
              </p>
            </div>

            {/* ===== 内容区域 ===== */}
            <div className="px-6 space-y-4">

              {/* ---- 登录方式 icon 按钮组（纯彩色 icon） ---- */}
              <div className="flex items-center gap-2.5">
                {/* 邮箱 icon */}
                <button
                  type="button"
                  onClick={() => switchPanel('email')}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    panel === 'email'
                      ? 'bg-gradient-to-br from-[#4F6EF7]/15 to-[#727BBA]/10 dark:from-[#4F6EF7]/25 dark:to-[#727BBA]/15 ring-2 ring-[#727BBA]/30 shadow-md shadow-[#727BBA]/10'
                      : 'bg-white dark:bg-[#1E2035] hover:bg-[#F5F6FB] dark:hover:bg-[#252840] shadow-sm border border-[#C4C8E6]/40 dark:border-[#727BBA]/20'
                  }`}
                >
                  <EmailIcon size={22} />
                </button>
                {/* 微信 icon */}
                <button
                  type="button"
                  onClick={() => switchPanel('wechat')}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    panel === 'wechat'
                      ? 'bg-gradient-to-br from-[#07C160]/15 to-[#2AAE67]/10 dark:from-[#07C160]/25 dark:to-[#2AAE67]/15 ring-2 ring-[#07C160]/30 shadow-md shadow-[#07C160]/10'
                      : 'bg-white dark:bg-[#1E2035] hover:bg-[#F5F6FB] dark:hover:bg-[#252840] shadow-sm border border-[#C4C8E6]/40 dark:border-[#727BBA]/20'
                  }`}
                >
                  <WechatIcon size={22} />
                </button>
                {/* 右侧分隔文字 */}
                {panel !== 'wechat' && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">— 输入邮箱一键验证登录</span>
                )}
              </div>

              {/* 分隔线 */}
              {panel !== 'wechat' && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#C4C8E6]/50 dark:border-[#727BBA]/15" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#FAFBFF] dark:bg-[#181B2E] px-2 text-[#727BBA]/60 dark:text-[#9BADCF]/50">✦</span>
                  </div>
                </div>
              )}

              {/* ---- 邮箱登录表单 ---- */}
              {panel === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className={labelCls}>邮箱地址</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="请输入接收验证码的邮箱"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className={`${inputCls} pl-9 pr-3`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="login-code" className={labelCls}>验证码</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                        <input
                          id="login-code"
                          type="text"
                          maxLength={6}
                          placeholder="请输入 6 位验证码"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          className={`${inputCls} pl-9 pr-3`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGetEmailCode}
                        disabled={codeCountdown > 0 || codeSending}
                        className="px-3 h-9 text-xs font-medium rounded-lg border border-[#C4C8E6]/60 dark:border-[#727BBA]/30 bg-white dark:bg-[#1E2035] text-[#727BBA] hover:bg-[#F5F6FB] dark:hover:bg-[#252840] hover:text-[#5f68a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 min-w-[95px]"
                      >
                        {codeCountdown > 0
                          ? `${codeCountdown}s 重试`
                          : codeSending
                            ? '发送中...'
                            : '获取验证码'}
                      </button>
                    </div>
                    {/* 验证码有效期倒计时提示 */}
                    {codeExpiryCountdown > 0 && (
                      <p className="text-[11px] text-[#727BBA]/70 dark:text-[#9BADCF]/60 mt-1 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        验证码有效期剩余
                        <span className="font-mono font-medium text-[#727BBA] dark:text-[#9BADCF]">
                          {Math.floor(codeExpiryCountdown / 60)}:{String(codeExpiryCountdown % 60).padStart(2, '0')}
                        </span>
                      </p>
                    )}
                    {codeExpiryCountdown === 0 && codeCountdown === 0 && codeInput === '' && (
                      <p className="text-[11px] text-zinc-400/70 dark:text-zinc-500/60 mt-1">验证码发送后 5 分钟内有效</p>
                    )}
                  </div>

                  {loginError && (
                    <div className="px-3 py-2 bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-lg">
                      <p className="text-xs text-red-500 dark:text-red-400 text-center">{loginError}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loginSubmitting} className={primaryBtnCls}>
                    {loginSubmitting ? (
                      <><Spinner size="sm" className="text-white" /><span className="ml-2">登录中...</span></>
                    ) : '登录 / 注册'}
                  </button>
                </form>
              )}

              {/* ---- 微信扫码模式 ---- */}
              {panel === 'wechat' && (
                <div className="flex flex-col items-center py-2">
                  
                  {/* 隐私勾选提示 */}
                  <div className="w-full mb-3 px-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-zinc-500 dark:text-zinc-400 py-2 px-2.5 bg-zinc-100/50 dark:bg-zinc-850/30 rounded-lg border border-zinc-200/50 dark:border-zinc-700/20">
                      <input
                        type="checkbox"
                        checked={wechatAgreed}
                        onChange={(e) => setWechatAgreed(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-700 text-[#07C160] focus:ring-[#07C160]/20 cursor-pointer accent-[#07C160]"
                      />
                      <span className="leading-tight">
                        我已阅读并同意
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowWechatPolicy(true)
                          }}
                          className="text-[#07C160] hover:underline mx-0.5 inline-block font-semibold cursor-pointer"
                        >
                          《微信登录服务与隐私协议》
                        </button>
                      </span>
                    </label>
                  </div>

                  {qrLoading ? (
                    <div className="w-[200px] h-[200px] bg-[#F5F6FB] dark:bg-[#1E2035] rounded-xl flex items-center justify-center border border-[#C4C8E6]/40 dark:border-[#727BBA]/20">
                      <Spinner size="lg" />
                    </div>
                  ) : qrError ? (
                    <div className="w-[200px] h-[200px] bg-[#F5F6FB] dark:bg-[#1E2035] rounded-xl flex flex-col items-center justify-center gap-3 border border-[#C4C8E6]/40 dark:border-[#727BBA]/20">
                      <p className="text-xs text-red-500 text-center px-4">{qrError}</p>
                      <button
                        type="button"
                        onClick={() => fetchWechatQR(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#727BBA] hover:text-[#5f68a3] hover:underline cursor-pointer transition-colors"
                      >
                        <RefreshCw size={12} />
                        重新加载
                      </button>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="relative group">
                      
                      {/* 如果未同意，显示模糊加锁覆盖层 */}
                      {!wechatAgreed && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 bg-white/95 dark:bg-[#181B2E]/95 backdrop-blur-[2px] rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 w-[200px] h-[200px]">
                          <svg className="w-8 h-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center px-4 font-medium leading-relaxed">
                            请先勾选上方协议以显示登录二维码
                          </p>
                          <button
                            type="button"
                            onClick={() => setWechatAgreed(true)}
                            className="mt-1 px-3 py-1 rounded bg-[#07C160] hover:bg-[#06ad56] text-white text-[10px] font-medium transition-colors cursor-pointer shadow-sm"
                          >
                            同意协议并展示
                          </button>
                        </div>
                      )}

                      <img
                        src={getSafeImageUrl(qrCodeUrl)}
                        alt="微信登录二维码"
                        className={`w-[200px] h-[200px] rounded-xl object-contain border shadow-md transition-all duration-300 ${
                          qrStatus === 'expired'
                            ? 'blur-sm opacity-40 border-zinc-300 dark:border-zinc-700 shadow-none'
                            : qrStatus === 'logging' || qrStatus === 'error'
                              ? 'blur-sm opacity-40 border-zinc-300 dark:border-zinc-700 shadow-none'
                              : qrStatus === 'scanned'
                                ? 'border-[#07C160]/40 dark:border-[#07C160]/30 shadow-[#07C160]/10'
                                : 'border-[#C4C8E6]/40 dark:border-[#727BBA]/20 shadow-[#727BBA]/5'
                        }`}
                      />

                      {/* 已扫码覆盖层 */}
                      {qrStatus === 'scanned' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 dark:bg-[#181B2E]/70 backdrop-blur-sm rounded-xl">
                          <CheckCircle size={32} className="text-[#07C160]" />
                          <p className="text-xs font-medium text-[#07C160]">已扫码</p>
                          <p className="text-[10px] text-zinc-400">请在手机上确认登录</p>
                        </div>
                      )}

                      {/* 登录中覆盖层 */}
                      {qrStatus === 'logging' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 dark:bg-[#181B2E]/80 backdrop-blur-sm rounded-xl">
                          <Spinner size="md" className="text-[#727BBA]" />
                          <p className="text-xs font-medium text-[#727BBA]">登录中...</p>
                        </div>
                      )}

                      {/* 异常覆盖层 */}
                      {qrStatus === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 dark:bg-[#181B2E]/80 backdrop-blur-sm rounded-xl">
                          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs font-medium text-red-500 text-center px-2">{wechatMsg || '登录异常'}</p>
                          <button
                            type="button"
                            onClick={() => fetchWechatQR(true)}
                            className="text-[11px] text-[#727BBA] hover:text-[#5f68a3] hover:underline font-medium cursor-pointer transition-colors"
                          >
                            重新获取二维码
                          </button>
                        </div>
                      )}

                      {/* 过期覆盖层 */}
                      {qrStatus === 'expired' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white/80 dark:bg-[#181B2E]/80 backdrop-blur-sm rounded-xl">
                          <RefreshCw size={24} className="text-[#727BBA]/60" />
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">二维码已过期</p>
                          <button
                            type="button"
                            onClick={() => fetchWechatQR(true)}
                            className="text-[11px] text-[#727BBA] hover:text-[#5f68a3] hover:underline font-medium cursor-pointer transition-colors"
                          >
                            点击刷新
                          </button>
                        </div>
                      )}

                      {/* 刷新按钮 */}
                      {qrStatus === 'waiting' && (
                        <button
                          type="button"
                          onClick={() => fetchWechatQR(true)}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#1E2035] border border-[#C4C8E6]/40 dark:border-[#727BBA]/20 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F5F6FB] dark:hover:bg-[#252840] cursor-pointer"
                        >
                          <RefreshCw size={12} className="text-[#727BBA]/60" />
                        </button>
                      )}
                    </div>
                  ) : null}

                  {/* 底部状态提示 */}
                  {qrStatus === 'waiting' && qrCodeUrl && expiryCount > 0 && (
                    <p className="text-xs text-[#727BBA]/60 dark:text-[#9BADCF]/50 mt-3 text-center">
                      打开微信 → 扫一扫 → 扫码登录
                      <span className="block mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        {Math.floor(expiryCount / 60)}:{String(expiryCount % 60).padStart(2, '0')} 后过期
                      </span>
                    </p>
                  )}
                  {qrStatus === 'scanned' && (
                    <p className="text-xs text-[#07C160] mt-3 font-medium">扫码成功，等待确认...</p>
                  )}
                  {qrStatus === 'logging' && (
                    <p className="text-xs text-[#727BBA] mt-3 font-medium">正在完成登录，请稍候...</p>
                  )}
                  {qrStatus === 'error' && (
                    <p className="text-xs text-red-400 mt-3">{wechatMsg || '登录异常，请重试'}</p>
                  )}
                  {qrStatus === 'expired' && !qrCodeUrl && (
                    <p className="text-xs text-zinc-400 mt-3">请刷新获取新的二维码</p>
                  )}
                </div>
              )}
            </div>

            {/* ===== 底部 CardFooter ===== */}
            <div className="flex flex-col items-center space-y-3 p-6 pt-4">
              {/* 协议 */}
              <p className="text-[10px] text-zinc-400/80 dark:text-zinc-500/80 text-center leading-relaxed">
                登录或注册即表示您同意我们的{' '}
                <a href="#" className="underline">服务条款</a>
                {' '}&{' '}
                <a href="#" className="underline">隐私政策</a>
              </p>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
