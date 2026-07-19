'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Menu, X, ChevronDown, ArrowUpRight, HelpCircle } from 'lucide-react'
import { fetchNavigations } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from '@/components/auth/LoginModal'
import type { ProfileVO } from '@/types/profile'

interface NavigationItem {
  id: number
  title: string
  linkUrl?: string
  icon?: string
  children?: NavigationItem[]
}

/** 动态匹配 Lucide 图标 */
const getIconComponent = (iconName?: string): Icons.LucideIcon => {
  if (!iconName) return HelpCircle
  const IconComponent = (Icons as Record<string, unknown>)[iconName] as Icons.LucideIcon
  return IconComponent || HelpCircle
}

interface NavbarProps {
  profile: ProfileVO | null
}

const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  return resolveImageUrl(avatarUrl || "");
};

/**
  * 客户端顶部主导航栏
  * - 从后端动态拉取 'HEADER' 类型菜单树形结构并渲染
  * - PC 端支持二级下拉磨砂玻璃菜单悬浮展现
  * - 移动端支持自适应汉堡包折叠抽屉
  * - 内置沉浸空间快捷跳转入口与前台读者登录态管理
  */
export default function Navbar({ profile }: NavbarProps) {
  const [navItems, setNavItems] = useState<NavigationItem[] | null>(null)
  const [sidebarItems, setSidebarItems] = useState<NavigationItem[] | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // 全局认证状态
  const { user, logout } = useAuth()

  // 拉取顶部导航和侧边栏快捷导航菜单
  useEffect(() => {
    fetchNavigations('HEADER').then((data) => {
      setNavItems(data || [])
    })
    fetchNavigations('SIDEBAR').then((data) => {
      setSidebarItems(data || [])
    })
  }, [])

  // 若尚未加载完成或后台未配置任何顶部导航，则完全不渲染组件，保持极致极简
  if (navItems === null || navItems.length === 0) return null

  const nickname = profile?.nickname || '可梵'

  return (
    <header className="sticky top-0 w-full h-16 border-b border-zinc-200/50 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-40 px-6 md:px-16 lg:px-24 flex items-center justify-between transition-colors">
      {/* 左侧 Logo / 昵称 */}
      <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-base tracking-wider text-zinc-900 dark:text-zinc-50 hover:opacity-90">
        <span className="bg-[#727BBA] text-white w-5.5 h-5.5 rounded-md flex items-center justify-center text-[11px] font-heading tracking-tighter">VB</span>
        <span>{nickname}</span>
      </Link>

      {/* 中间：PC 端导航栏 */}
      <nav className="hidden md:flex items-center gap-7">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          return (
            <div key={item.id} className="relative group py-2">
              {hasChildren ? (
                <button className="flex items-center gap-1 text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer">
                  <span>{item.title}</span>
                  <ChevronDown size={11} className="text-zinc-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
              ) : (
                <Link
                  href={item.linkUrl || '#'}
                  className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer"
                >
                  {item.title}
                </Link>
              )}

              {/* 二级悬浮菜单 (PC端) */}
              {hasChildren && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  {item.children!.map((child) => (
                    <Link
                      key={child.id}
                      href={child.linkUrl || '#'}
                      className="block px-4 py-2 text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-all"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 右侧：PC 端沉浸空间入口与登录管理 */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 select-none">
              {user.avatarUrl ? (
                <img 
                  src={resolveAvatarUrl(user.avatarUrl)} 
                  className="w-5.5 h-5.5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 object-cover" 
                  alt="" 
                />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-550 flex items-center justify-center uppercase">
                  {(user.nickname || '?').charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-zinc-650 dark:text-zinc-300">{user.nickname || '用户'}</span>
            </div>
            <button 
              onClick={logout}
              className="text-[10px] px-2.5 py-1.25 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 font-semibold cursor-pointer transition-colors"
            >
              注销
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setLoginModalOpen(true)}
            className="text-xs font-semibold text-[#727BBA] hover:text-[#5f68a3] cursor-pointer transition-colors"
          >
            登录
          </button>
        )}

        <Link
          href="/article"
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-[#09B38A]/20 bg-[#09B38A]/5 hover:bg-[#09B38A]/10 text-[#09B38A] font-heading text-xs font-bold transition-all duration-200"
        >
          <span>📚 文章列表</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* 移动端汉堡包菜单与状态 */}
      <div className="flex md:hidden items-center gap-2.5">
        {user && (
          <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-200/60">
            {user.avatarUrl ? (
              <img src={resolveAvatarUrl(user.avatarUrl)} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-zinc-100 text-[9px] font-bold text-zinc-500 flex items-center justify-center">{(user.nickname || '?').charAt(0)}</div>
            )}
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 移动端全屏折叠遮罩菜单 */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-4 px-6 flex flex-col gap-4.5 z-40 md:hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              return (
                <div key={item.id} className="flex flex-col gap-2">
                  {!hasChildren ? (
                    <Link
                      href={item.linkUrl || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-1"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {item.title}
                      </span>
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-zinc-150 dark:border-zinc-850">
                        {item.children!.map((child) => (
                          <Link
                            key={child.id}
                            href={child.linkUrl || '#'}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 py-1"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 移动端额外的侧边栏快捷导航 (从 SIDEBAR 菜单合并过来) */}
          {sidebarItems && sidebarItems.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-900/60 pt-3.5">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2.5">
                快捷功能
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sidebarItems.map((item) => {
                  const IconComp = getIconComponent(item.icon)
                  return (
                    <Link
                      key={item.id}
                      href={item.linkUrl || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-350"
                    >
                      <IconComp size={14} className="text-[#727BBA]" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* 移动端登录/注销入口 */}
          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3.5 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">已登录: {user.nickname || '用户'}</span>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-[10px] text-zinc-400 active:text-rose-500"
                >
                  注销
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}
                className="text-xs font-bold text-[#727BBA] cursor-pointer"
              >
                点此登录账户
              </button>
            )}
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3 flex flex-col">
            <Link
              href="/article"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-[#09B38A]/10 border border-[#09B38A]/20 text-[#09B38A] text-xs font-bold"
            >
              <span>� 进入文章列表</span>
            </Link>
          </div>
        </div>
      )}

      {/* 登录弹窗（统一使用 LoginModal 组件） */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </header>
  )
}
