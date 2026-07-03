'use client'

import React, { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import LoginModal from './LoginModal'

/**
 * 侧边栏登录图标组件
 * - 显示在左侧边栏底部的小人图标
 * - 未登录时点击弹出登录框
 * - 已登录时显示用户头像
 */
export default function SidebarLoginIcon() {
  const [user, setUser] = useState<{ nickname: string; avatarUrl?: string | null } | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  /**
   * 获取登录状态
   */
  const initAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const infoStr = localStorage.getItem('user_info')
      if (token && infoStr) {
        try {
          setUser(JSON.parse(infoStr))
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user_info')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
  }

  // 初始化登录状态
  useEffect(() => {
    initAuth()
    
    // 监听全局授权变更事件
    window.addEventListener('auth-change', initAuth)
    return () => {
      window.removeEventListener('auth-change', initAuth)
    }
  }, [])

  /**
   * 处理登出
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  /**
   * 解析头像 URL
   */
  const resolveAvatarUrl = (avatarUrl?: string | null): string => {
    if (!avatarUrl) return ""
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      return avatarUrl;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const host = apiBase.replace(/\/api$/, "");
    return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
  };

  return (
    <>
      {/* 小人图标 / 用户头像 */}
      <div className="fixed left-5 bottom-5 z-40 flex flex-col gap-3.5 select-none">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 hover:ring-[#727BBA] transition-all cursor-pointer"
            title="点击退出登录"
          >
            {user.avatarUrl ? (
              <img 
                src={resolveAvatarUrl(user.avatarUrl)} 
                alt="User avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-9 h-9 rounded-full bg-white/70 dark:bg-zinc-950/70 border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs flex items-center justify-center text-zinc-550 dark:text-zinc-400 hover:text-[#727BBA] dark:hover:text-[#727BBA] hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer"
            title="登录"
          >
            <User size={15} className="shrink-0" />
          </button>
        )}
      </div>

      {/* 登录弹窗 */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
