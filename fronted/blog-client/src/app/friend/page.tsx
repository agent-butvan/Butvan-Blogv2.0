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

  // 提取域名
  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

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
    <div className="min-h-[calc(100vh+200px)] flex flex-col justify-between bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
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
            朋友们
          </span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-px">
            {friends.length}
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

      {/* 主内容区 */}
      <section className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 pb-10" aria-label="友链列表">
        {loading ? (
          /* 加载态 */
          <div className="min-h-[24rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">加载中...</span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          /* 空状态 */
          <div className="flex-1 min-h-[24rem] flex items-center justify-center">
            <p className="text-sm font-heading text-zinc-400 dark:text-zinc-500">
              暂无友链
            </p>
          </div>
        ) : (
          <div
            className="friend-page-enter"
            style={{ opacity: visible ? undefined : 0 }}
          >
            {orderedCategories.map((catKey) => {
              const catFriends = groupedFriends[catKey]
              if (!catFriends?.length) return null
              const catLabel = CATEGORY_LABEL_MAP[catKey] || catKey

              return (
                <section key={catKey} className="mb-16 last:mb-0">
                  {/* 分类水印 —— 超大字号、极低透明度品牌色，作为章节视觉锚点 */}
                  <h2
                    className="text-[clamp(2rem,5vw,3.5rem)] font-heading font-bold leading-none tracking-[-0.02em] text-[#727BBA]/[0.06] dark:text-[#727BBA]/[0.08] mb-8 select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    {catLabel}
                  </h2>

                  {/* 友链卡片网格 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catFriends.map((friend) => {
                      const avatarUrl = resolveImageUrl(friend.avatarUrl || '')
                      const domain = extractDomain(friend.url)

                      return (
                        <a
                          key={friend.id}
                          href={friend.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col p-5 rounded-xl border border-zinc-200/60 bg-white/40 dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 hover:border-[#727BBA]/40 hover:shadow-[8px_8px_0px_rgba(114,123,186,0.08)] dark:hover:shadow-[8px_8px_0px_rgba(114,123,186,0.03)] overflow-hidden cursor-pointer"
                        >
                          {/* 右上角渐变光晕 */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#727BBA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                          {/* 右上角外链图标 */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-[#727BBA]">
                            <ArrowUpRight size={14} />
                          </div>

                          {/* 头像 + 信息 */}
                          <div className="flex items-center gap-4 mb-4 relative z-10">
                            {/* 圆形头像 */}
                            <div className="w-13 h-13 rounded-full bg-zinc-50 dark:bg-zinc-950 flex-shrink-0 border border-zinc-200/80 dark:border-zinc-700/80 group-hover:border-[#727BBA]/40 transition-all duration-500 overflow-hidden ring-4 ring-transparent group-hover:ring-[#727BBA]/5">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={`${friend.name} 的头像`}
                                  className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400 uppercase select-none">
                                  {friend.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* 名称 + 分类标签 */}
                            <div className="min-w-0">
                              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide truncate group-hover:text-[#727BBA] transition-colors">
                                {friend.name}
                              </h3>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-widest">
                                  {catLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 描述 */}
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 h-10 relative z-10">
                            {friend.description || domain}
                          </p>
                        </a>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* 友链说明 + 申请入口 —— 高质感透明黑金风格 */}
        <div className="mt-auto pt-16">
          <div className="p-8 rounded-2xl border border-dashed border-zinc-200/70 bg-zinc-50/40 dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-md max-w-2xl mx-auto w-full shadow-lg">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-[#09B38A] dark:hover:bg-[#09B38A] dark:hover:text-white transition-all duration-300 font-bold text-xs shadow-md group"
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
