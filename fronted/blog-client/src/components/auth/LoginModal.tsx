'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, RefreshCw } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type LoginMode = 'email' | 'wechat'

/**
 * 登录弹窗组件
 * - 支持邮箱登录和微信扫码登录两种模式
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl w-full max-w-sm p-6 relative flex flex-col gap-4.5 shadow-xl select-none mx-4">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4.5 right-4.5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
        
        {/* 标题 */}
        <div className="flex flex-col items-center text-center mt-2.5">
          <h3 className="text-sm font-serif font-bold text-zinc-900 dark:text-white mb-1">欢迎回来</h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-serif italic">登录您的可梵博客账号</p>
        </div>
        
        {/* 登录方式切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'email'
                ? 'bg-[#727BBA] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            邮箱登录
          </button>
          <button
            onClick={() => setMode('wechat')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'wechat'
                ? 'bg-[#727BBA] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            微信扫码
          </button>
        </div>

        {/* 邮箱登录表单 */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">用户名</label>
              <input
                type="text"
                placeholder="请输入登录用户名"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.25 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:border-[#727BBA] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">密码</label>
              <input
                type="password"
                placeholder="请输入登录密码"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.25 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:border-[#727BBA] transition-colors"
              />
            </div>

            {loginError && (
              <p className="text-[10px] text-rose-500 text-center font-semibold animate-pulse">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.25 bg-[#727BBA] hover:bg-[#5f68a3] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer select-none mt-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? '安全登录中...' : '提交登录'}</span>
            </button>
          </form>
        )}

        {/* 微信扫码登录 */}
        {mode === 'wechat' && (
          <div className="flex flex-col items-center gap-4">
            {qrLoading ? (
              <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            ) : qrError ? (
              <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-rose-500 text-center">{qrError}</p>
                <button
                  onClick={refreshQRCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>重试</span>
                </button>
              </div>
            ) : qrCodeUrl ? (
              <div className="relative">
                <img 
                  src={qrCodeUrl} 
                  alt="微信登录二维码" 
                  className="w-48 h-48 rounded-xl object-contain border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  onClick={refreshQRCode}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  title="刷新二维码"
                >
                  <RefreshCw size={12} className="text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>
            ) : null}
            
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
              请使用微信扫一扫登录
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
