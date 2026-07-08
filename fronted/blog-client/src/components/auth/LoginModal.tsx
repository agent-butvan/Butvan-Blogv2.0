'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Lock, User, Eye, EyeOff, MessageCircle } from 'lucide-react'
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
          <Modal.Dialog className="sm:max-w-[420px] bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl rounded-2xl">
            <Modal.CloseTrigger />

            {/* 标题区域 */}
            <div className="px-6 pt-7 pb-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                登录账号
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                登录您的可梵博客账号，开始您的创作之旅。
              </p>
            </div>

            {/* 内容区域 */}
            <div className="px-6 pb-4 space-y-4">
              {/* 微信快捷登录按钮 */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  快捷登录
                </label>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => setMode(mode === 'wechat' ? 'email' : 'wechat')}
                  className="justify-start gap-3 h-10 rounded-lg border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <MessageCircle size={18} className="text-green-500" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">微信扫码登录</span>
                </Button>
              </div>

              {/* 分隔线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400 dark:text-zinc-500">
                    或使用邮箱
                  </span>
                </div>
              </div>

              {/* 邮箱登录表单 */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* 用户名 */}
                <div className="space-y-2">
                  <label htmlFor="login-username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                      className="w-full pl-10 pr-3 h-10 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:border-[#727BBA] focus:ring-1 focus:ring-[#727BBA]/30 transition-colors"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      密码
                    </label>
                    <button type="button" className="text-xs font-medium text-[#727BBA] hover:underline">
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入登录密码"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 h-10 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:border-[#727BBA] focus:ring-1 focus:ring-[#727BBA]/30 transition-colors"
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
                <Button
                  type="submit"
                  isDisabled={submitting}
                  className="w-full h-10 bg-[#727BBA] hover:bg-[#5c649c] text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>登录中...</span>
                    </>
                  ) : (
                    '登录'
                  )}
                </Button>
              </form>
            </div>

            {/* 微信扫码区域（展开时显示） */}
            {mode === 'wechat' && (
              <div className="px-6 pb-4">
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

            {/* 底部协议 */}
            <div className="px-6 pb-5 pt-1">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
                登录即表示您同意我们的{' '}
                <a href="#" className="text-[#727BBA] hover:underline">服务条款</a>
                {' '}&{' '}
                <a href="#" className="text-[#727BBA] hover:underline">隐私政策</a>
              </p>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
