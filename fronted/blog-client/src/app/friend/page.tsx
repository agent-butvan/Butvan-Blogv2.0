'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Users, Plus } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import { Spinner } from '@heroui/react'
import { fetchFriendLinks } from '@/lib/friend-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import { handleError } from '@/lib/error-handler'
import type { ProfileVO } from '@/types/profile'
import type { FriendLink } from '@/types/friend'
import { FRIEND_CATEGORIES } from '@/types/friend'

/** 分类 value → label 映射 */
const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  FRIEND_CATEGORIES.map((c) => [c.value, c.label])
)

/**
 * 友链页面 —— 编辑式刊头
 *
 * 设计语言：Swiss Editorial Grid（瑞士编辑式网格）
 * 以超大分类水印作为章节锚点，友链条目排列于非对称双栏网格中。
 * 每一行是纯粹的排版单元：头像 → 名称 → 描述 → 外链箭头。
 * hover 时左侧浮现品牌色强调线 + 微幅右移，克制且精准。
 *
 * 无卡片、无模块化布局 —— 一切由排版、间距和横线定义。
 */
export default function FriendPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, friendsData] = await Promise.all([
          fetchProfile('butvan'),
          fetchFriendLinks(selectedCategory || undefined),
        ])
        setProfile(profileData)
        setFriends(friendsData)
      } catch (err) {
        handleError(err, { silent: true, fallbackMessage: '加载友链失败' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedCategory])

  // 入场渐变
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // 按分类分组
  const groupedFriends = useMemo(() => {
    const groups: Record<string, FriendLink[]> = {}
    for (const f of friends) {
      if (!groups[f.category]) groups[f.category] = []
      groups[f.category].push(f)
    }
    return groups
  }, [friends])

  // 分类筛选
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  // 分类展示顺序（筛选模式下仅展示选中分类）
  const categoryOrder = FRIEND_CATEGORIES.map((c) => c.value)
  const orderedCategories = selectedCategory
    ? [selectedCategory]
    : categoryOrder.filter((c) => groupedFriends[c]?.length > 0)

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 页头 —— 简洁居中排版 */}
      <header
        className="w-full max-w-3xl mx-auto px-4 pt-16 pb-6 text-center transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center justify-center gap-3">
          <Users size={17} className="text-[#727BBA]/70" />
          <h1 className="text-xl md:text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            友链
          </h1>
          <span className="text-sm font-heading text-zinc-400 dark:text-zinc-500 font-medium">
            ·
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-heading">
            朋友们 {friends.length}
          </span>
        </div>
      </header>

      {/* 分类筛选 —— 极简文字导航 */}
      <nav
        className="w-full max-w-3xl mx-auto px-4 pb-8 transition-opacity duration-500 delay-100"
        style={{ opacity: visible ? 1 : 0 }}
        aria-label="友链分类筛选"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`transition-colors duration-200 cursor-pointer ${
              selectedCategory === null
                ? 'text-[#727BBA] font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
            }`}
          >
            全部
          </button>
          {FRIEND_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`transition-colors duration-200 cursor-pointer ${
                selectedCategory === cat.value
                  ? 'text-[#727BBA] font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 主体友链区与规则说明 (底部留出 pb-40 充足空隙，确保 Footer 不挤在首屏) */}
      <section
        className="w-full max-w-5xl mx-auto px-6 pb-40 flex-1 flex flex-col transition-opacity duration-500 delay-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* 加载态 */}
        {loading && (
          <div className="py-20 flex items-center justify-center">
            <Spinner size="lg" color="accent" />
          </div>
        )}

        {/* 空状态 */}
        {!loading && friends.length === 0 && (
          <div className="py-20 text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            暂无相关友链
          </div>
        )}

        {/* 友链分类展示 */}
        {!loading && friends.length > 0 && (
          <div className="space-y-12">
            {orderedCategories.map((catKey) => {
              const catFriends = groupedFriends[catKey] || []
              if (catFriends.length === 0) return null
              const catMeta = FRIEND_CATEGORIES.find((c) => c.value === catKey)

              return (
                <section key={catKey} aria-labelledby={`cat-${catKey}`}>
                  <h2
                    id={`cat-${catKey}`}
                    className="text-2xl font-bold text-zinc-200/40 dark:text-zinc-800/80 mb-6 font-heading select-none"
                  >
                    {catMeta?.label || catKey}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catFriends.map((friend) => {
                      const linkProps = friend.url.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {}
                      const avatarUrl = resolveImageUrl(friend.avatarUrl || '')

                      return (
                        <a
                          key={friend.id}
                          href={friend.url}
                          {...linkProps}
                          className="group relative p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/80 dark:hover:bg-zinc-900/60 transition-all duration-300 flex items-start gap-3.5"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-200/40 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={friend.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-xs font-bold text-zinc-400">
                                {friend.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[#727BBA] transition-colors">
                                {friend.name}
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                              {friend.description || '暂无描述'}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* 友链说明 + 申请入口 —— 极简硬朗无圆角无阴影风格 */}
        <div className="mt-20">
          <div className="p-8 rounded-none border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40 max-w-2xl mx-auto w-full">
            {/* 标题 */}
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-widest mb-6 font-mono text-center">
              友链说明
            </h2>

            {/* 规则列表 */}
            <ul className="text-xs text-zinc-700 dark:text-zinc-200 font-medium space-y-3.5">
              <li className="flex gap-2">
                <span className="text-[#727BBA] shrink-0">•</span>
                <span>优先考虑经常更新、内容优质的技术博客或生活记录。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#727BBA] shrink-0">•</span>
                <span>站点需支持 HTTPS，排版整洁，无大量广告或误导性内容。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#727BBA] shrink-0">•</span>
                <span>申请前请先在贵站添加本站链接，这将视作一种友好的相互确认。</span>
              </li>
            </ul>

            {/* 申请按钮 */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/friend/apply"
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-none hover:bg-[#09B38A] dark:hover:bg-[#09B38A] dark:hover:text-white transition-all duration-300 font-bold text-xs group"
              >
                <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                申请加入
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 放置于 100vh 视口之外的底部统一页脚 */}
      <Footer />
    </div>
  )
}
