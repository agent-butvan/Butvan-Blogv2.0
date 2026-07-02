'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Users, Plus } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import { Spinner } from '@heroui/react'
import { fetchFriendLinks } from '@/lib/friend-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import { handleError } from '@/lib/error-handler'
import type { ProfileVO } from '@/types/profile'
import type { FriendLink } from '@/types/friend'
import { FRIEND_CATEGORIES } from '@/types/friend'

/**
 * 简易确定性伪随机数生成器（基于 index + id）
 * 保证同一条友链每次渲染位置一致，不随重渲染跳动
 */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/**
 * 为每个友链气泡计算有机流式布局的微偏移与旋转角度
 * 采用稀疏网格 + 小幅度抖动，营造深海星轨般的自然韵律
 */
function computeBubbleLayout(index: number, id: number, total: number) {
  const rng = seededRandom(id * 31 + index * 17)

  const cols = Math.max(3, Math.ceil(Math.sqrt(total * 0.8)))
  const col = index % cols
  const row = Math.floor(index / cols)
  const totalRows = Math.ceil(total / cols)

  const baseX = totalRows <= 1 ? 50 : (col / Math.max(cols - 1, 1)) * 100
  const baseY = totalRows <= 1 ? 50 : (row / Math.max(totalRows - 1, 1)) * 100

  // 控制抖动范围：±28%，减少重叠、保持可扫描
  const jitterX = (rng() - 0.5) * 56
  const jitterY = (rng() - 0.5) * 56

  // 旋转角度：-2.5° ~ 2.5°，更微妙
  const rotation = (rng() - 0.5) * 5

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  return {
    xPercent: clamp(baseX + jitterX, 10, 90),
    yPercent: clamp(baseY + jitterY, 8, 92),
    rotation,
  }
}

/**
 * 友链页面 —— 深海星轨
 *
 * 设计语言：静谧深海（Quiet Deep Sea）
 * 友链以 rounded-full 药丸气泡散布于容器中，
 * 确定性伪随机定位 + 微妙旋转，形成有机但可扫描的视觉韵律。
 * hover 时归正旋转并亮起深海辉光，移动端降级为简洁列表。
 */
export default function FriendPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
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

  // 简化入场：仅 opacity 过渡，无编排式序列动画
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // 计算每个气泡的布局（仅在 friends 变化时重新计算）
  const bubbleLayouts = useMemo(() => {
    return friends.map((friend, index) => ({
      ...computeBubbleLayout(index, friend.id, friends.length),
      friend,
    }))
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
    setHoveredId(null)
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-zinc-950 font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* 页头 —— 简洁排版，无 eyebrow */}
      <header
        className="w-full max-w-3xl mx-auto px-4 pt-16 pb-8 text-center transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-1.5">
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

      {/* 分类筛选 —— 更紧凑的 pill 导航 */}
      <nav
        className="w-full max-w-3xl mx-auto px-4 pb-6 transition-opacity duration-500 delay-100"
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

      {/* 气泡区域 + 列表 */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-10" aria-label="友链列表">
        {loading ? (
          /* 骨架屏 */
          <div className="min-h-[28rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">加载中...</span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          /* 空状态 */
          <div className="min-h-[28rem] flex items-center justify-center">
            <p className="text-sm font-heading text-zinc-400 dark:text-zinc-500">
              暂无友链
            </p>
          </div>
        ) : (
          <>
            {/* ===== 桌面端：浮动气泡（无容器边框） ===== */}
            <div
              className="hidden sm:block relative min-h-[34rem] overflow-hidden"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 500ms ease-out' }}
            >
              {/* 深海氛围层 */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(114,123,186,0.12) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              {bubbleLayouts.map(({ xPercent, yPercent, rotation, friend }) => {
                const avatarUrl = resolveImageUrl(friend.avatarUrl || '')
                const isHovered = hoveredId === friend.id

                return (
                  <div
                    key={friend.id}
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: `translate(-50%, -50%) scale(${isHovered ? 1.04 : 1})`,
                      zIndex: isHovered ? 20 : 10,
                      transitionProperty: 'transform, z-index',
                      transitionDuration: isHovered ? '200ms' : '350ms',
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    onMouseEnter={() => setHoveredId(friend.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="transition-transform duration-200 ease-out"
                      style={{
                        transform: `rotate(${isHovered ? 0 : rotation}deg)`,
                      }}
                    >
                      <a
                        href={friend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group inline-flex items-center gap-2.5 w-auto max-w-[calc(100%-2rem)] rounded-full pl-0 pr-4 py-0 cursor-pointer transition-all duration-200 ${
                          isHovered
                            ? 'bg-white dark:bg-zinc-800 shadow-[0_0_20px_rgba(114,123,186,0.15)] dark:shadow-[0_0_20px_rgba(114,123,186,0.2)]'
                            : 'bg-white/85 dark:bg-zinc-900/75 hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                      >
                        {/* 头像 */}
                        <div
                          className={`shrink-0 h-12 w-12 rounded-full overflow-hidden ring-1 transition-all duration-200 ${
                            isHovered
                              ? 'ring-[#727BBA]/40'
                              : 'ring-zinc-200/60 dark:ring-white/10'
                          }`}
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`${friend.name} 的头像`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-sm font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 uppercase select-none">
                              {friend.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* 信息 */}
                        <div className="min-w-0 max-w-[10rem] sm:max-w-[13rem] lg:max-w-[16rem]">
                          <h2 className="break-words text-sm font-heading font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {friend.name}
                          </h2>
                          <p className="mt-0.5 line-clamp-1 break-words text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            {friend.description || extractDomain(friend.url)}
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ===== 移动端：简洁列表（无容器边框） ===== */}
            <div
              className="sm:hidden divide-y divide-zinc-200/40 dark:divide-zinc-800/40"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 500ms ease-out' }}
            >
              {friends.map((friend) => {
                const avatarUrl = resolveImageUrl(friend.avatarUrl || '')
                const domain = extractDomain(friend.url)

                return (
                  <a
                    key={friend.id}
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 py-3.5 px-5 hover:bg-[#E9EEE8]/40 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors duration-200"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-200/60 dark:ring-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={`${friend.name} 的头像`} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-sm font-bold text-zinc-400 uppercase select-none">
                          {friend.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-heading font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#727BBA] transition-colors duration-200">
                        {friend.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {friend.description || domain}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-[#727BBA] transition-colors duration-200" />
                  </a>
                )
              })}
            </div>
          </>
        )}

        {/* 申请入口 —— 修复 ghost-card，纯色底替代 */}
        <div className="mt-8">
          <Link
            href="/friend/apply"
            className="group flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-[#727BBA]/25 dark:hover:border-[#727BBA]/20 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#09B38A]/10 flex items-center justify-center">
                <Plus size={18} className="text-[#09B38A]" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-heading font-semibold text-zinc-900 dark:text-zinc-50">
                  申请加入友链
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 hidden sm:inline">
                  审核通过后展示在此处
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-[#727BBA] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-zinc-200/40 dark:border-zinc-900/50">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          2026 Butvan Blog
        </span>
      </footer>
    </div>
  )
}
