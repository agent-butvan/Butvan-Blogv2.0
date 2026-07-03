'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
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
    <Modal.Backdrop 
      isOpen={isOpen} 
      onOpenChange={(open) => { if (!open) onClose() }}
      variant="blur"
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[360px]">
          <Modal.CloseTrigger />
          
          <Modal.Header className="flex flex-col items-center text-center">
            <Modal.Heading className="text-base">欢迎回来</Modal.Heading>
            <p className="text-xs text-default-500 mt-0.5">登录您的可梵博客账号</p>
          </Modal.Header>

          <Modal.Body>
            {/* 登录方式切换 */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'email' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1"
                onPress={() => setMode('email')}
              >
                邮箱登录
              </Button>
              <Button
                variant={mode === 'wechat' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1"
                onPress={() => setMode('wechat')}
              >
                微信扫码
              </Button>
            </div>

            {/* 邮箱登录表单 */}
            {mode === 'email' && (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-default-600 pl-1">用户名</label>
                  <input
                    type="text"
                    placeholder="请输入登录用户名"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-default-200 bg-default-50 text-foreground placeholder:text-default-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-default-600 pl-1">密码</label>
                  <input
                    type="password"
                    placeholder="请输入登录密码"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-default-200 bg-default-50 text-foreground placeholder:text-default-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-danger text-center font-medium">{loginError}</p>
                )}

                <Button
                  type="submit"
                  isPending={submitting}
                  className="w-full"
                >
                  {submitting ? '安全登录中...' : '提交登录'}
                </Button>
              </form>
            )}

            {/* 微信扫码登录 */}
            {mode === 'wechat' && (
              <div className="flex flex-col items-center gap-4">
                {qrLoading ? (
                  <div className="w-48 h-48 bg-default-100 rounded-xl flex items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : qrError ? (
                  <div className="w-48 h-48 bg-default-100 rounded-xl flex flex-col items-center justify-center gap-2">
                    <p className="text-xs text-danger text-center px-2">{qrError}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={refreshQRCode}
                    >
                      <RefreshCw size={12} />
                      <span>重试</span>
                    </Button>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="relative">
                    <img 
                      src={qrCodeUrl} 
                      alt="微信登录二维码" 
                      className="w-48 h-48 rounded-xl object-contain border border-default-200"
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2"
                      onPress={refreshQRCode}
                    >
                      <RefreshCw size={12} />
                    </Button>
                  </div>
                ) : null}
                
                <p className="text-xs text-default-500 text-center">
                  请使用微信扫一扫登录
                </p>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="ghost" slot="close" className="w-full">
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
