'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { HelpCircle, User } from 'lucide-react'
import { Button, Tooltip, Avatar, Separator } from '@heroui/react'
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
 * - 使用 HeroUI Tooltip 实现 hover 滑出提示
 * - 底部集成登录图标（HeroUI Avatar/Button + Separator 分隔）
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
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={handleLogout}
                >
                  <Avatar size="sm">
                    {user.avatarUrl ? (
                      <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                    ) : null}
                    <Avatar.Fallback>{user.nickname.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                点击退出登录
              </Tooltip.Content>
            </Tooltip>
          ) : (
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={() => setLoginModalOpen(true)}
            >
              <User size={15} />
            </Button>
          )}
        </div>
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      {/* 左侧菜单栏容器（包含菜单项 + 分隔线 + 登录图标） */}
      <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none">
        {/* 动态菜单项 */}
        {items.map((item) => {
          const IconComp = getIconComponent(item.icon)
          return (
            <Tooltip key={item.id} delay={0}>
              <Tooltip.Trigger>
                <Link href={item.linkUrl || '#'}>
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                  >
                    <IconComp size={15} />
                  </Button>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                {item.title}
              </Tooltip.Content>
            </Tooltip>
          )
        })}

        {/* 分隔线 - 将菜单与登录图标隔开 */}
        <Separator className="my-0.5" />

        {/* 登录图标 / 用户头像 */}
        {user ? (
          <Tooltip delay={0}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={handleLogout}
              >
                <Avatar size="sm">
                  {user.avatarUrl ? (
                    <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                  ) : null}
                  <Avatar.Fallback>{user.nickname.charAt(0).toUpperCase()}</Avatar.Fallback>
                </Avatar>
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              点击退出登录
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => setLoginModalOpen(true)}
          >
            <User size={15} />
          </Button>
        )}
      </div>

      {/* 登录弹窗 */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
