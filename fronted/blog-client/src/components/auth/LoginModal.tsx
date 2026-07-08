'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Lock, User, Eye, EyeOff, MessageCircle, Sparkles } from 'lucide-react'
import { Modal, Button, Spinner } from '@heroui/react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type LoginMode = 'email' | 'wechat'

/**
 * 登录弹窗组件
 * - 使用 HeroUI Modal / Input / Tabs / Button 组件
 * - 支持邮箱登录和微信扫码登录两种模式
 * - 采用 Shadcn 风格卡片布局：清晰标签、图标输入框、密码可见切换
 * - 主色 #727BBA，紧凑排版
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<LoginMode>('email')

  // 邮箱登录状态
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  // 微信二维码状态
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  // 打开弹窗时重置状态
  useEffect(() => {
    if (isOpen) {
      setLoginError('')
      setQrError('')
      setShowPassword(false)
      if (mode === 'wechat') {
        fetchWechatQRCode()
      }
    } else {
      setUsernameInput('')
      setPasswordInput('')
      setQrCodeUrl('')
    }
  }, [isOpen])

  // 切换模式时重新获取二维码
  useEffect(() => {
    if (mode === 'wechat' && isOpen) {
      fetchWechatQRCode()
    }
  }, [mode])

  /**
   * 获取微信二维码
   */
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
        if (json.data) {
          setQrCodeUrl(json.data)
        } else {
          setQrError('获取二维码失败')
        }
      } else {
        setQrError(json.msg || '获取二维码失败')
      }
    } catch (err) {
      console.error(err)
      setQrError('网络连接失败，请稍后重试')
    } finally {
      setQrLoading(false)
    }
  }

  /** 刷新微信二维码 */
  const refreshQRCode = () => fetchWechatQRCode()

  /**
   * 邮箱登录处理
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput) {
      setLoginError('请输入用户名和密码')
      return
    }
    setSubmitting(true)
    setLoginError('')
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput
        })
      })
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        if (json.data && json.data.token) {
          localStorage.setItem('token', json.data.token)
          const userInfo = {
            nickname: json.data.nickname,
            avatarUrl: json.data.avatarUrl
          }
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          window.dispatchEvent(new Event('auth-change'))
          onClose()
        } else {
          setLoginError('登录异常，未获得访问令牌')
        }
      } else {
        setLoginError(json.msg || '用户名或密码错误')
      }
    } catch (err) {
      console.error(err)
      setLoginError('网络连接失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose() }}
      >
        <Modal.Container className="items-center">
          <Modal.Dialog className="sm:max-w-[420px] bg-white dark:bg-zinc-950 shadow-2xl rounded-xl p-0">
            <Modal.CloseTrigger />

            {/* 标题区域 —— CardHeader 风格 */}
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                使用邮箱登录
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                登录您的可梵博客账号，将您的文字、数据与团队汇聚一处。完全免费。
              </p>
            </div>

            {/* 内容区域 —— CardContent 风格 */}
            <div className="px-6 space-y-4">
              {/* 社交快捷登录 —— grid 按钮组 */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  快捷登录
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* 微信扫码按钮 */}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'wechat' ? 'email' : 'wechat')}
                    className="inline-flex items-center justify-center h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <MessageCircle size={18} className="text-green-500" />
                  </button>
                  {/* QQ 按钮（预留） */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-400 cursor-not-allowed opacity-50"
                    disabled
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M21.395 15.035a39.548 39.548 0 0 0-1.258-2.7c.212-.859.332-1.79.332-2.775C20.47 4.984 16.585 1 12 1 7.415 1 3.53 4.984 3.53 9.56c0 .985.12 1.916.332 2.775a39.548 39.548 0 0 0-1.258 2.7c-.57 1.476-.877 2.91-.877 3.715 0 .627.17.837.434.837.545 0 1.67-1.555 2.366-3.057.39.685.852 1.308 1.382 1.862-.762.29-1.563.703-2.073 1.267-.635.7-.63 1.393-.108 1.854.523.46 1.59.598 2.86.285a9.537 9.537 0 0 0 1.603-.548c.56.277 1.158.496 1.782.645.89.212 1.83.327 2.797.327s1.907-.115 2.797-.327a8.86 8.86 0 0 0 1.782-.645c.517.236 1.065.42 1.603.548 1.27.313 2.337.175 2.86-.285.522-.46.527-1.154-.108-1.854-.51-.564-1.311-.977-2.073-1.267.53-.554.992-1.177 1.382-1.862.696 1.502 1.821 3.057 2.366 3.057.264 0 .434-.21.434-.837 0-.805-.307-2.239-.877-3.715z" />
                    </svg>
                  </button>
                  {/* GitHub 按钮（预留） */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-400 cursor-not-allowed opacity-50"
                    disabled
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 dark:text-zinc-400">
                    或
                  </span>
                </div>
              </div>

              {/* 邮箱登录表单 */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* 用户名 */}
                <div className="space-y-2">
                  <label htmlFor="login-username" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                    用户名
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="login-username"
                      type="text"
                      placeholder="请输入登录用户名"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="flex h-9 w-full pl-9 pr-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#727BBA]"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                      密码
                    </label>
                    <a href="#" className="text-sm font-medium text-[#727BBA] hover:underline">
                      忘记密码？
                    </a>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入登录密码"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="flex h-9 w-full pl-9 pr-10 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#727BBA]"
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

                {/* 错误提示 */}
                {loginError && (
                  <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">{loginError}</p>
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center w-full h-9 rounded-lg text-sm font-medium text-white shadow bg-[#1a1f36] hover:bg-[#2a2f46] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span className="ml-2">登录中...</span>
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </form>
            </div>

            {/* 微信扫码区域（展开时显示） */}
            {mode === 'wechat' && (
              <div className="px-6 pb-4 pt-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col items-center gap-3">
                    {qrLoading ? (
                      <div className="w-44 h-44 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <Spinner size="lg" />
                      </div>
                    ) : qrError ? (
                      <div className="w-44 h-44 bg-white dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-700">
                        <p className="text-xs text-red-500 text-center px-3">{qrError}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={refreshQRCode}
                          className="text-[#727BBA] hover:bg-[#727BBA]/10"
                        >
                          <RefreshCw size={12} />
                          <span className="text-xs">重试</span>
                        </Button>
                      </div>
                    ) : qrCodeUrl ? (
                      <div className="relative group">
                        <img
                          src={qrCodeUrl}
                          alt="微信登录二维码"
                          className="w-44 h-44 rounded-lg object-contain border border-zinc-200 dark:border-zinc-700"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          className="absolute -top-2 -right-2 bg-white dark:bg-zinc-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          onPress={refreshQRCode}
                        >
                          <RefreshCw size={12} />
                        </Button>
                      </div>
                    ) : null}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      请使用微信扫描二维码登录
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 底部 —— CardFooter 风格 */}
            <div className="flex flex-col items-start space-y-4 p-6 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-full h-9 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <Sparkles size={16} className="mr-2 text-orange-400" />
                或发送登录链接到我的邮箱
              </button>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center w-full px-4 leading-relaxed">
                登录即表示您同意我们的{' '}
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
