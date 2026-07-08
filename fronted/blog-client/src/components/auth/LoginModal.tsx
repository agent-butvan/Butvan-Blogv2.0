'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Lock, User, Eye, EyeOff, MessageCircle, Mail, AtSign } from 'lucide-react'
import { Modal, Spinner } from '@heroui/react'

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

  /** 打开弹窗时重置状态 */
  useEffect(() => {
    if (isOpen) {
      setLoginError('')
      setQrError('')
      setShowPassword(false)
      setRegError('')
      setRegSuccess(false)
      if (panel === 'wechat') fetchWechatQRCode()
    } else {
      setUsernameInput('')
      setPasswordInput('')
      setQrCodeUrl('')
      setRegUsername('')
      setRegPassword('')
      setRegNickname('')
      setRegEmail('')
    }
  }, [isOpen])

  /** 切换到微信模式时自动获取二维码 */
  useEffect(() => {
    if (panel === 'wechat' && isOpen) fetchWechatQRCode()
  }, [panel])

  /** 切换面板并重置错误 */
  const switchPanel = (target: PanelMode) => {
    setLoginError('')
    setRegError('')
    setRegSuccess(false)
    setPanel(target)
  }

  // ===================== API 调用 =====================

  /** 获取微信二维码 */
  const fetchWechatQRCode = async () => {
    setQrLoading(true)
    setQrError('')
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiBase}/weixin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        setQrCodeUrl(json.data || '')
        if (!json.data) setQrError('获取二维码失败')
      } else {
        setQrError(json.msg || '获取二维码失败')
      }
    } catch {
      setQrError('网络连接失败，请稍后重试')
    } finally {
      setQrLoading(false)
    }
  }

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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.trim(), password: passwordInput })
      })
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        if (json.data?.token) {
          localStorage.setItem('token', json.data.token)
          localStorage.setItem('user_info', JSON.stringify({
            nickname: json.data.nickname,
            avatarUrl: json.data.avatarUrl
          }))
          window.dispatchEvent(new Event('auth-change'))
          onClose()
        } else {
          setLoginError('登录异常，未获得访问令牌')
        }
      } else {
        setLoginError(json.msg || '用户名或密码错误')
      }
    } catch {
      setLoginError('网络连接失败，请稍后重试')
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          password: regPassword,
          nickname: regNickname.trim(),
          email: regEmail.trim() || undefined
        })
      })
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        setRegSuccess(true)
      } else {
        setRegError(json.msg || '注册失败，请稍后再试')
      }
    } catch {
      setRegError('网络连接失败，请稍后重试')
    } finally {
      setRegSubmitting(false)
    }
  }

  // ===================== 样式常量 =====================

  /** 输入框统一样式 */
  const inputCls = 'flex h-9 w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300'
  /** 主按钮样式 */
  const primaryBtnCls = 'inline-flex items-center justify-center w-full h-9 rounded-lg text-sm font-medium bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 transition-colors disabled:opacity-50 disabled:pointer-events-none'
  /** label 样式 */
  const labelCls = 'text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none'

  // ===================== 渲染 =====================

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose() }}
      >
        <Modal.Container className="items-center">
          <Modal.Dialog className="sm:max-w-[420px] bg-white dark:bg-zinc-950 shadow-2xl rounded-xl p-0 overflow-hidden">
            <Modal.CloseTrigger />

            {/* ===== 标题区域 ===== */}
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                {panel === 'register' ? '创建账号' : panel === 'wechat' ? '微信扫码登录' : '使用邮箱登录'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {panel === 'register'
                  ? '注册您的可梵博客账号，开始创作之旅。'
                  : panel === 'wechat'
                    ? '使用微信扫描下方二维码完成登录。'
                    : '登录您的可梵博客账号，将文字、数据与团队汇聚一处。'
                }
              </p>
            </div>

            {/* ===== 内容区域 ===== */}
            <div className="px-6 space-y-4">

              {/* ---- 登录模式：显示邮箱/微信 Tab ---- */}
              {panel !== 'register' && (
                <>
                  {/* Tab 切换 */}
                  <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <button
                      type="button"
                      onClick={() => switchPanel('email')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-all ${
                        panel === 'email'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Mail size={14} />
                      邮箱登录
                    </button>
                    <button
                      type="button"
                      onClick={() => switchPanel('wechat')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-all ${
                        panel === 'wechat'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <MessageCircle size={14} />
                      微信登录
                    </button>
                  </div>

                  {/* ---- 邮箱登录表单 ---- */}
                  {panel === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="login-username" className={labelCls}>用户名</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                        <div className="flex items-center justify-between">
                          <label htmlFor="login-password" className={labelCls}>密码</label>
                          <a href="#" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline">忘记密码？</a>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400 text-center">{loginError}</p>
                        </div>
                      )}

                      <button type="submit" disabled={loginSubmitting} className={primaryBtnCls}>
                        {loginSubmitting ? (
                          <><Spinner size="sm" className="text-zinc-50 dark:text-zinc-900" /><span className="ml-2">登录中...</span></>
                        ) : '登录'}
                      </button>
                    </form>
                  )}

                  {/* ---- 微信扫码模式 ---- */}
                  {panel === 'wechat' && (
                    <div className="flex flex-col items-center py-2">
                      {qrLoading ? (
                        <div className="w-[200px] h-[200px] bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                          <Spinner size="lg" />
                        </div>
                      ) : qrError ? (
                        <div className="w-[200px] h-[200px] bg-zinc-50 dark:bg-zinc-900 rounded-lg flex flex-col items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-700">
                          <p className="text-xs text-red-500 text-center px-4">{qrError}</p>
                          <button
                            type="button"
                            onClick={() => fetchWechatQRCode()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:underline"
                          >
                            <RefreshCw size={12} />
                            重新加载
                          </button>
                        </div>
                      ) : qrCodeUrl ? (
                        <div className="relative group">
                          <img
                            src={qrCodeUrl}
                            alt="微信登录二维码"
                            className="w-[200px] h-[200px] rounded-lg object-contain border border-zinc-200 dark:border-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={() => fetchWechatQRCode()}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            <RefreshCw size={12} className="text-zinc-500" />
                          </button>
                        </div>
                      ) : null}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                        打开微信 → 扫一扫 → 扫描上方二维码登录
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ---- 注册模式：注册表单 ---- */}
              {panel === 'register' && (
                <>
                  {regSuccess ? (
                    /* 注册成功 */
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">注册成功！</p>
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
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                          <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                          >
                            {regShowPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* 错误提示 */}
                      {regError && (
                        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400 text-center">{regError}</p>
                        </div>
                      )}

                      {/* 注册按钮 */}
                      <button type="submit" disabled={regSubmitting} className={primaryBtnCls}>
                        {regSubmitting ? (
                          <><Spinner size="sm" className="text-zinc-50 dark:text-zinc-900" /><span className="ml-2">注册中...</span></>
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
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
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
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    返回登录
                  </button>
                </p>
              ) : null}

              {/* 协议 */}
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
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
