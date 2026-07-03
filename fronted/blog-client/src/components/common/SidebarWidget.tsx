'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { HelpCircle, User } from 'lucide-react'
import { fetchNavigations } from '@/lib/profile'
import Link from 'next/link'
import LoginModal from '@/components/auth/LoginModal'

interface NavigationItem {
  id: number
  title: string
  linkUrl?: string
  icon?: string
}

/** 动态匹配 Lucide 图标 */
const getIconComponent = (iconName?: string): Icons.LucideIcon => {
  if (!iconName) return HelpCircle
  const IconComponent = (Icons as Record<string, unknown>)[iconName] as Icons.LucideIcon
  return IconComponent || HelpCircle
}

/**
 * 客户端左侧中部固定悬浮快捷侧挂栏 (SidebarWidget)
 * - 动态拉取后台中展示位置为 'SIDEBAR' 的菜单导航
 * - 纯文字滑出特效，配合 Lucide 图标的微变色 Hover
 * - 底部集成登录图标（与菜单间隔一段距离）
 * - 若后台未配置任何侧边栏目，仅显示登录图标
 */
export default function SidebarWidget() {
  const [items, setItems] = useState<NavigationItem[]>([])
  // 登录状态
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

  useEffect(() => {
    fetchNavigations('SIDEBAR').then((data) => {
      setItems(data || [])
    })
  }, [])

  // 始终显示登录图标，即使没有菜单项
  if (items.length === 0) {
    return (
      <>
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-550 hover:text-[#727BBA] hover:bg-zinc-150/40 dark:text-zinc-400 dark:hover:text-[#727BBA] dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer"
              title="登录"
            >
              <User size={15} className="shrink-0" />
            </button>
          )}
        </div>
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      {/* 左侧菜单栏容器（包含菜单项 + 分隔线 + 登录图标） */}
      <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none">
        {/* 动态菜单项 */}
        {items.map((item) => {
          const IconComp = getIconComponent(item.icon)
          return (
            <Link
              key={item.id}
              href={item.linkUrl || '#'}
              className="group relative w-9 h-9 rounded-full flex items-center justify-center text-zinc-550 hover:text-[#727BBA] hover:bg-zinc-150/40 dark:text-zinc-400 dark:hover:text-[#727BBA] dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer"
            >
              <IconComp size={15} className="shrink-0" />
              
              {/* 右侧滑出提示标签 (PC 端大厂感) */}
              <span className="absolute left-11 px-3 py-1.5 rounded-lg bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-950 text-[10px] font-heading font-bold uppercase tracking-wider whitespace-nowrap opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xs">
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* 分隔线 - 将菜单与登录图标隔开 */}
        <div className="w-full h-px bg-zinc-200/60 dark:bg-zinc-700/60 my-1"></div>

        {/* 登录图标 / 用户头像 */}
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
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-550 hover:text-[#727BBA] hover:bg-zinc-150/40 dark:text-zinc-400 dark:hover:text-[#727BBA] dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer"
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
