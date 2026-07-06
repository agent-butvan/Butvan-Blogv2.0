'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Mail, Lock, User } from 'lucide-react'
import { Modal, Button, Spinner } from '@heroui/react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type LoginMode = 'email' | 'wechat'

/**
 * 登录弹窗组件
 * - 使用 HeroUI Modal 组件，支持邮箱登录和微信扫码登录两种模式
 * - 默认显示邮箱登录，可切换到微信扫码
 * - 采用博客整体设计语言：紧凑布局、主色 #727BBA、简洁排版
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<LoginMode>('email')
  
  // 邮箱登录状态
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
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
      if (mode === 'wechat') {
        fetchWechatQRCode()
      }
    } else {
      // 关闭时清空数据
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
        headers: {
          'Content-Type': 'application/json'
        }
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

  /**
   * 刷新微信二维码
   */
  const refreshQRCode = () => {
    fetchWechatQRCode()
  }

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
        headers: {
          'Content-Type': 'application/json'
        },
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
          
          // 广播通知
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
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px] bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
            <Modal.CloseTrigger />
            
            {/* 标题区域 —— 紧凑居中 */}
            <div className="px-6 pt-6 pb-4 text-center">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">欢迎回来</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">登录您的可梵博客账号</p>
            </div>

            {/* 内容区域 */}
            <div className="px-6 pb-6 space-y-4">
              {/* 登录方式切换 —— 简洁 Tab */}
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                <button
                  onClick={() => setMode('email')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                    mode === 'email'
                      ? 'bg-white dark:bg-zinc-800 text-[#727BBA] shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  邮箱登录
                </button>
                <button
                  onClick={() => setMode('wechat')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                    mode === 'wechat'
                      ? 'bg-white dark:bg-zinc-800 text-[#727BBA] shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  微信扫码
                </button>
              </div>

              {/* 邮箱登录表单 */}
              {mode === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">用户名</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="请输入登录用户名"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#727BBA] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">密码</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="password"
                        placeholder="请输入登录密码"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#727BBA] transition-colors"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-400 text-center">{loginError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    isDisabled={submitting}
                    className="w-full bg-[#727BBA] hover:bg-[#5c649c] text-white font-medium disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" />
                        安全登录中...
                      </>
                    ) : (
                      '提交登录'
                    )}
                  </Button>
                </form>
              )}

              {/* 微信扫码登录 */}
              {mode === 'wechat' && (
                <div className="flex flex-col items-center gap-4">
                  {qrLoading ? (
                    <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
                      <Spinner size="lg" />
                    </div>
                  ) : qrError ? (
                    <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex flex-col items-center justify-center gap-3">
                      <p className="text-xs text-red-600 dark:text-red-400 text-center px-3">{qrError}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={refreshQRCode}
                        className="text-[#727BBA]"
                      >
                        <RefreshCw size={12} />
                        <span>重试</span>
                      </Button>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="relative group">
                      <img 
                        src={qrCodeUrl} 
                        alt="微信登录二维码" 
                        className="w-48 h-48 rounded-xl object-contain border border-zinc-200 dark:border-zinc-700"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={refreshQRCode}
                      >
                        <RefreshCw size={12} />
                      </Button>
                    </div>
                  ) : null}
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    请使用微信扫一扫登录
                  </p>
                </div>
              )}
            </div>

            {/* 底部取消按钮 */}
            <div className="px-6 pb-6">
              <Button 
                variant="ghost" 
                onPress={onClose}
                className="w-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                取消
              </Button>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
