'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { HelpCircle } from 'lucide-react'
import { fetchNavigations } from '@/lib/profile'

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
 * - 若后台未配置任何侧边栏目，组件自适应返回 null，保持首页简洁无负担
 */
export default function SidebarWidget() {
  const [items, setItems] = useState<NavigationItem[]>([])

  useEffect(() => {
    fetchNavigations('SIDEBAR').then((data) => {
      setItems(data || [])
    })
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none">
      {items.map((item) => {
        const IconComp = getIconComponent(item.icon)
        return (
          <a
            key={item.id}
            href={item.linkUrl || '#'}
            className="group relative w-9 h-9 rounded-full flex items-center justify-center text-zinc-550 hover:text-[#727BBA] hover:bg-zinc-150/40 dark:text-zinc-400 dark:hover:text-[#727BBA] dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer"
          >
            <IconComp size={15} className="shrink-0" />
            
            {/* 右侧滑出提示标签 (PC 端大厂感) */}
            <span className="absolute left-11 px-3 py-1.5 rounded-lg bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-950 text-[10px] font-heading font-bold uppercase tracking-wider whitespace-nowrap opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xs">
              {item.title}
            </span>
          </a>
        )
      })}
    </div>
  )
}
