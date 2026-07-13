'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import { RefreshCw, Lock, User, Eye, EyeOff, Mail, AtSign, CheckCircle } from 'lucide-react'
import { Modal, Spinner, toast } from '@heroui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import { getWechatQRCode, loginByEmail, registerUser, wechatExchange } from '@/lib/auth-api'
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
    const base64 = btoa(encodeURIComponent(url));
    return `/api/proxy-image/${base64}`
  }
  return url
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

/** 面板模式：邮箱登录 / 微信登录 / 注册 */
type PanelMode = 'email' | 'wechat' | 'register'

/**
 * 登录/注册弹窗组件
 * - 使用 HeroUI Modal / Spinner，其余为原生 HTML 元素
 * - 支持邮箱登录、微信扫码登录、账号注册三种模式
 * - 顶部 Tab 切换邮箱/微信，底部链接切换到注册
 * - 采用 Shadcn 风格卡片布局，紧凑排版
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [panel, setPanel] = useState<PanelMode>('email')
  const { login: authLogin } = useAuth()

  // ---- 邮箱登录状态 ----
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  // ---- 注册状态 ----
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regNickname, setRegNickname] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regShowPwd, setRegShowPwd] = useState(false)
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)

  // ---- 微信二维码状态 ----
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  /** 二维码当前状态：waiting=等待扫码 | scanned=已扫码 | logging=登录中 | expired=已过期 | error=异常 */
  const [qrStatus, setQrStatus] = useState<'waiting' | 'scanned' | 'logging' | 'expired' | 'error'>('waiting')
  /** 微信登录异常提示信息 */
  const [wechatMsg, setWechatMsg] = useState('')
  /** 二维码过期倒计时（秒） */
  const [expiryCount, setExpiryCount] = useState(0)

  /** WebSocket 连接管理 */
  const { lastMessage, connect: wsConnect, disconnect: wsDisconnect } = useWebSocket()
  /** 过期定时器 ref */
  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 打开弹窗时重置状态 */
  useEffect(() => {
    if (isOpen) {
      setLoginError('')
      setQrError('')
      setShowPassword(false)
      setRegError('')
      setRegSuccess(false)
      setWechatMsg('')
      if (panel === 'wechat') fetchWechatQR()
    } else {
      setUsernameInput('')
      setPasswordInput('')
      setQrCodeUrl('')
      setQrStatus('waiting')
      setExpiryCount(0)
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
      wsDisconnect()
      setRegUsername('')
      setRegPassword('')
      setRegNickname('')
      setRegEmail('')
    }
  }, [isOpen])

  /** 切换到微信模式时自动获取二维码 */
  useEffect(() => {
    if (panel === 'wechat' && isOpen) fetchWechatQR()
  }, [panel])

  /** 切换面板并重置错误 */
  const switchPanel = (target: PanelMode) => {
    setLoginError('')
    setRegError('')
    setRegSuccess(false)
    setPanel(target)
  }

  // ===================== API 调用 =====================

  /** 获取微信二维码并建立 WebSocket 连接 */
  const fetchWechatQR = useCallback(async () => {
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
      const { qrUrl, wsId } = await getWechatQRCode()
      setQrCodeUrl(qrUrl)
      // 建立 WebSocket 连接，监听扫码事件
      wsConnect(wsId)
      // 启动过期倒计时（110s，比 Redis 的 120s 提前 10s 过期）
      setExpiryCount(110)
      expiryTimerRef.current = setInterval(() => {
        setExpiryCount((prev) => {
          if (prev <= 1) {
            if (expiryTimerRef.current) clearInterval(expiryTimerRef.current)
            expiryTimerRef.current = null
            setQrStatus('expired')
            wsDisconnect()
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
      // Toast 全局通知（持久显示，需手动关闭）
      toast.danger(lastMessage.message || '登录异常，请重试', { timeout: 0 })
      return
    }

    // 扫码事件：用户已扫描二维码
    if (lastMessage.event === 'weixin' && lastMessage.code === 200 && lastMessage.message.includes('扫描')) {
      setQrStatus('scanned')
      // Toast 全局通知
      toast.info(lastMessage.message, { timeout: 3000 })
      // 清除过期倒计时（扫码后不再需要）
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
      return
    }

    // 登录成功事件（已有用户扫码登录）
    if (lastMessage.event === 'weixin' && lastMessage.code === 200 && lastMessage.message.includes('登录成功')) {
      // Toast 全局通知（持久显示，需手动关闭）
      toast.success(lastMessage.message, { timeout: 0 })
      handleWechatLoginSuccess(lastMessage.data)
      return
    }

    // 注册成功事件（新用户首次注册）
    if (lastMessage.event === 'login' && lastMessage.code === 200) {
      // Toast 全局通知（持久显示，需手动关闭）
      toast.success(lastMessage.message, { timeout: 0 })
      handleWechatLoginSuccess(lastMessage.data)
      return
    }
  }, [lastMessage])

  /**
   * 微信扫码登录/注册成功后，交换 Token 并完成登录
   * <p>流程：通过 WS 下发的 exchangeCode 调用 HTTP 接口换取 httpOnly Cookie + 用户信息</p>
   */
  const handleWechatLoginSuccess = async (data?: Record<string, unknown>) => {
    setQrStatus('logging')
    setWechatMsg('')
    try {
      const exchangeCode = data?.exchangeCode as string | undefined
      if (exchangeCode) {
        // 后端已实现 Token Exchange 接口
        const { user } = await wechatExchange(exchangeCode)
        authLogin({
          nickname: user.nickname || user.email || '用户',
          avatarUrl: user.avatarUrl || null,
          username: user.username || null,
          email: user.email || null,
        })
      } else {
        // 后端暂未实现 exchange 接口，尝试通过 /auth/check 恢复会话
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
      wsDisconnect()
      // 延迟关闭弹窗，等待 auth-change 事件传播完成后再卸载，避免 Transition Abort
      setTimeout(() => onClose(), 150)
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

  /** 邮箱登录 */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput) {
      setLoginError('请输入用户名和密码')
      return
    }
    setLoginSubmitting(true)
    setLoginError('')
    try {
      const { user } = await loginByEmail(usernameInput.trim(), passwordInput)
      // 通过全局认证状态管理登录（Token 已通过 httpOnly Cookie 自动设置）
      authLogin({
        nickname: user.nickname || '用户',
        avatarUrl: user.avatarUrl || null,
        username: user.username || null,
        email: user.email || null,
      })
      // 延迟关闭弹窗，等待 auth-change 事件传播完成后再卸载，避免 Transition Abort
      setTimeout(() => onClose(), 150)
    } catch (err) {
      setLoginError(err instanceof AppError ? err.message : '网络连接失败，请稍后重试')
    } finally {
      setLoginSubmitting(false)
    }
  }

  /** 注册账号 */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    // 前端基础校验
    if (!regUsername.trim() || !regPassword || !regNickname.trim()) {
      setRegError('请填写所有必填项')
      return
    }
    if (regUsername.trim().length < 3 || regUsername.trim().length > 30) {
      setRegError('用户名长度需在 3-30 个字符之间')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(regUsername.trim())) {
      setRegError('用户名只能包含字母、数字和下划线')
      return
    }
    if (regPassword.length < 6) {
      setRegError('密码长度不能少于 6 位')
      return
    }
    setRegSubmitting(true)
    setRegError('')
    try {
      await registerUser({
        username: regUsername.trim(),
        password: regPassword,
        nickname: regNickname.trim(),
        email: regEmail.trim() || undefined,
      })
      setRegSuccess(true)
    } catch (err) {
      setRegError(err instanceof AppError ? err.message : '网络连接失败，请稍后重试')
    } finally {
      setRegSubmitting(false)
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
          <Modal.Dialog className="sm:max-w-[420px] bg-gradient-to-b from-[#FAFBFF] to-[#F2F3FA] dark:from-[#181B2E] dark:to-[#141625] shadow-2xl shadow-[#727BBA]/10 dark:shadow-black/30 rounded-xl p-0 overflow-hidden border border-[#C4C8E6]/30 dark:border-[#727BBA]/15">
            <Modal.CloseTrigger />

            {/* ===== 标题区域 ===== */}
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#727BBA] to-[#9BADCF] bg-clip-text text-transparent tracking-tight leading-none">
                {panel === 'register' ? '创建账号' : panel === 'wechat' ? '微信扫码' : '邮箱登录'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {panel === 'register'
                  ? '注册您的可梵博客账号'
                  : panel === 'wechat'
                    ? '扫描下方二维码，已有账号自动登录，新用户自动注册。'
                    : '登录您的可梵博客账号'
                }
              </p>
            </div>

            {/* ===== 内容区域 ===== */}
            <div className="px-6 space-y-4">

              {/* ---- 登录方式 icon 按钮组（纯彩色 icon） ---- */}
              <div className="flex items-center gap-2.5">
                {/* 邮箱 icon */}
                <button
                  type="button"
                  onClick={() => switchPanel(panel === 'register' ? 'register' : 'email')}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    panel === 'email' || panel === 'register'
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
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">— 选择方式后填写表单</span>
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
                        <label htmlFor="login-username" className={labelCls}>用户名</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="login-username"
                            type="text"
                            placeholder="请输入登录用户名"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className={`${inputCls} pl-9 pr-3`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="login-password" className={labelCls}>密码</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="请输入登录密码"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className={`${inputCls} pl-9 pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#727BBA] dark:hover:text-[#9BADCF] transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="px-3 py-2 bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-lg">
                          <p className="text-xs text-red-500 dark:text-red-400 text-center">{loginError}</p>
                        </div>
                      )}

                      <button type="submit" disabled={loginSubmitting} className={primaryBtnCls}>
                        {loginSubmitting ? (
                          <><Spinner size="sm" className="text-white" /><span className="ml-2">登录中...</span></>
                        ) : '登录'}
                      </button>
                    </form>
                  )}

                  {/* ---- 微信扫码模式 ---- */}
                  {panel === 'wechat' && (
                    <div className="flex flex-col items-center py-2">
                      {qrLoading ? (
                        /* 加载态 */
                        <div className="w-[200px] h-[200px] bg-[#F5F6FB] dark:bg-[#1E2035] rounded-xl flex items-center justify-center border border-[#C4C8E6]/40 dark:border-[#727BBA]/20">
                          <Spinner size="lg" />
                        </div>
                      ) : qrError ? (
                        /* 错误态 */
                        <div className="w-[200px] h-[200px] bg-[#F5F6FB] dark:bg-[#1E2035] rounded-xl flex flex-col items-center justify-center gap-3 border border-[#C4C8E6]/40 dark:border-[#727BBA]/20">
                          <p className="text-xs text-red-500 text-center px-4">{qrError}</p>
                          <button
                            type="button"
                            onClick={fetchWechatQR}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#727BBA] hover:text-[#5f68a3] hover:underline cursor-pointer transition-colors"
                          >
                            <RefreshCw size={12} />
                            重新加载
                          </button>
                        </div>
                      ) : qrCodeUrl ? (
                        /* 二维码展示（含扫码/过期覆盖层） */
                        <div className="relative group">
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
                                onClick={fetchWechatQR}
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
                                onClick={fetchWechatQR}
                                className="text-[11px] text-[#727BBA] hover:text-[#5f68a3] hover:underline font-medium cursor-pointer transition-colors"
                              >
                                点击刷新
                              </button>
                            </div>
                          )}

                          {/* 刷新按钮（仅 waiting 态 hover 可见） */}
                          {qrStatus === 'waiting' && (
                            <button
                              type="button"
                              onClick={fetchWechatQR}
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

              {/* ---- 注册模式：注册表单 ---- */}
              {panel === 'register' && (
                <>
                  {regSuccess ? (
                    /* 注册成功 */
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9AC8A0]/30 to-[#727BBA]/15 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#07C160]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">注册成功！</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">请使用您的账号密码登录。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchPanel('email')}
                        className={primaryBtnCls}
                      >
                        前往登录
                      </button>
                    </div>
                  ) : (
                    /* 注册表单 */
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* 用户名 */}
                      <div className="space-y-2">
                        <label htmlFor="reg-username" className={labelCls}>
                          用户名 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="reg-username"
                            type="text"
                            placeholder="3-30位字母、数字或下划线"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            className={`${inputCls} pl-9 pr-3`}
                          />
                        </div>
                      </div>

                      {/* 昵称 */}
                      <div className="space-y-2">
                        <label htmlFor="reg-nickname" className={labelCls}>
                          昵称 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="reg-nickname"
                            type="text"
                            placeholder="展示给其他用户的昵称"
                            value={regNickname}
                            onChange={(e) => setRegNickname(e.target.value)}
                            className={`${inputCls} pl-9 pr-3`}
                          />
                        </div>
                      </div>

                      {/* 邮箱（可选） */}
                      <div className="space-y-2">
                        <label htmlFor="reg-email" className={labelCls}>
                          邮箱 <span className="text-xs text-zinc-400 font-normal">（选填）</span>
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="reg-email"
                            type="email"
                            placeholder="example@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={`${inputCls} pl-9 pr-3`}
                          />
                        </div>
                      </div>

                      {/* 密码 */}
                      <div className="space-y-2">
                        <label htmlFor="reg-password" className={labelCls}>
                          密码 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727BBA]/50 pointer-events-none" />
                          <input
                            id="reg-password"
                            type={regShowPwd ? 'text' : 'password'}
                            placeholder="至少 6 位密码"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className={`${inputCls} pl-9 pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setRegShowPwd(!regShowPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#727BBA] dark:hover:text-[#9BADCF] transition-colors cursor-pointer"
                          >
                            {regShowPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* 错误提示 */}
                      {regError && (
                        <div className="px-3 py-2 bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-lg">
                          <p className="text-xs text-red-500 dark:text-red-400 text-center">{regError}</p>
                        </div>
                      )}

                      {/* 注册按钮 */}
                      <button type="submit" disabled={regSubmitting} className={primaryBtnCls}>
                        {regSubmitting ? (
                          <><Spinner size="sm" className="text-white" /><span className="ml-2">注册中...</span></>
                        ) : '注册'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* ===== 底部 CardFooter ===== */}
            <div className="flex flex-col items-center space-y-3 p-6 pt-4">
              {/* 登录 / 注册 切换链接 */}
              {panel !== 'register' ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  还没有账号？{' '}
                  <button
                    type="button"
                    onClick={() => switchPanel('register')}
                    className="font-medium text-[#727BBA] hover:text-[#5f68a3] hover:underline transition-colors cursor-pointer"
                  >
                    立即注册
                  </button>
                </p>
              ) : !regSuccess ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  已有账号？{' '}
                  <button
                    type="button"
                    onClick={() => switchPanel('email')}
                    className="font-medium text-[#727BBA] hover:text-[#5f68a3] hover:underline transition-colors cursor-pointer"
                  >
                    返回登录
                  </button>
                </p>
              ) : null}

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
