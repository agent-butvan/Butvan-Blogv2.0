'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Users, Plus } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import { fetchFriendLinks } from '@/lib/friend-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import type { ProfileVO } from '@/types/profile'
import type { FriendLink } from '@/types/friend'
import { FRIEND_CATEGORIES } from '@/types/friend'
import gsap from 'gsap'

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
 * 为每个友链气泡计算公告板上的位置与旋转角度
 * 采用稀疏网格 + 大幅随机偏移的策略，确保自然散布且避免重叠
 */
function computeBubbleLayout(index: number, id: number, total: number) {
  const rng = seededRandom(id * 31 + index * 17)

  // 降低列数，增加间距，让分布更稀疏
  const cols = Math.max(3, Math.ceil(Math.sqrt(total * 0.8)))
  const col = index % cols
  const row = Math.floor(index / cols)
  const totalRows = Math.ceil(total / cols)

  // 基础网格位置（百分比），加入更大范围的随机偏移
  const baseX = totalRows <= 1 ? 50 : (col / Math.max(cols - 1, 1)) * 100
  const baseY = totalRows <= 1 ? 50 : (row / Math.max(totalRows - 1, 1)) * 100

  // 更大的抖动范围：±35%，确保充分分散
  const jitterX = (rng() - 0.5) * 70
  const jitterY = (rng() - 0.5) * 70

  // 旋转角度：-4° ~ 4°，增加视觉变化
  const rotation = (rng() - 0.5) * 8

  // 确保不超出容器边界，留出安全边距
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  return {
    xPercent: clamp(baseX + jitterX, 12, 88),
    yPercent: clamp(baseY + jitterY, 10, 90),
    rotation,
    // 为漂浮动画生成唯一相位和速度
    floatPhase: rng() * Math.PI * 2, // 0 ~ 2π
    floatSpeed: 0.6 + rng() * 0.8,   // 0.6 ~ 1.4s 周期
    floatAmplitude: 4 + rng() * 6,   // 4 ~ 10px 振幅
  }
}

/**
 * 友链页面 —— 公告板式浮动气泡
 *
 * 灵感来源：xiami.dev/friends
 * 每个友链为 rounded-full 药丸气泡，散布于圆角公告板容器中，
 * 带有微小的随机旋转角度，形成有机、随性的视觉韵律。
 * 移动端自动降级为简洁列表。
 */
export default function FriendPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

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
        console.error('加载数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedCategory])

  // 页面入场动画
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.friend-header-item',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
      )
      gsap.fromTo('.friend-filter-item',
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 },
      )
    })
    return () => ctx.revert()
  }, [])

  // 气泡入场动画 —— 从中心绽放
  useEffect(() => {
    if (loading || friends.length === 0) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.friend-bubble',
        { scale: 0.3, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power4.out',
          delay: 0.15,
        },
      )
    })
    return () => ctx.revert()
  }, [loading, friends])

  // 计算每个气泡的布局（仅在 friends 变化时重新计算）
  const bubbleLayouts = useMemo(() => {
    return friends.map((friend, index) => ({
      ...computeBubbleLayout(index, friend.id, friends.length),
      friend,
    }))
  }, [friends])

  // 启动持续漂浮动画（CSS animation）
  useEffect(() => {
    if (loading || friends.length === 0) return
    
    // 为每个气泡注入 CSS 变量，控制漂浮参数
    const bubbles = document.querySelectorAll('.friend-bubble')
    bubbles.forEach((bubble, idx) => {
      const layout = bubbleLayouts[idx]
      if (!layout) return
      
      const el = bubble as HTMLElement
      el.style.setProperty('--float-phase', `${layout.floatPhase}rad`)
      el.style.setProperty('--float-speed', `${layout.floatSpeed}s`)
      el.style.setProperty('--float-amplitude', `${layout.floatAmplitude}px`)
      el.classList.add('animate-float')
    })
  }, [loading, friends, bubbleLayouts])

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

      {/* 页头 */}
      <header className="w-full max-w-3xl mx-auto px-4 pt-16 pb-6 text-center">
        <span className="friend-header-item opacity-0 inline-block text-[9px] font-heading font-bold text-[#727BBA]/50 dark:text-[#727BBA]/40 uppercase tracking-[0.28em] mb-4">
          FRIENDS
        </span>

        <div className="friend-header-item opacity-0 flex items-center justify-center gap-3 mb-2">
          <Users size={18} className="text-[#727BBA]/60" />
          <h1 className="text-xl md:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-[0.06em]">
            友链
          </h1>
          <span className="text-sm font-serif text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-serif italic">
            朋友们
          </span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-0.5">
            {friends.length}
          </span>
        </div>
      </header>

      {/* 分类筛选 */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`friend-filter-item opacity-0 transition-all duration-200 cursor-pointer ${
              selectedCategory === null
                ? 'text-[#727BBA] font-bold underline underline-offset-4'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
            }`}
          >
            全部
          </button>
          {FRIEND_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`friend-filter-item opacity-0 transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.value
                  ? 'text-[#727BBA] font-bold underline underline-offset-4'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 公告板 + 列表 */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-10" aria-label="友链列表">
        {loading ? (
          /* 骨架屏 */
          <div className="min-h-[28rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#727BBA] border-t-transparent" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">加载中...</span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          /* 空状态 */
          <div className="min-h-[28rem] flex items-center justify-center">
            <p className="text-sm font-serif italic text-zinc-400 dark:text-zinc-500">
              暂无友链
            </p>
          </div>
        ) : (
          <>
            {/* ===== 桌面端：浮动气泡（无容器边框） ===== */}
            <div
              ref={boardRef}
              className="hidden sm:block relative min-h-[34rem] overflow-hidden"
            >
              {bubbleLayouts.map(({ xPercent, yPercent, rotation, friend, floatPhase, floatSpeed, floatAmplitude }) => {
                const avatarUrl = resolveImageUrl(friend.avatarUrl || '')
                const isHovered = hoveredId === friend.id

                return (
                  <a
                    key={friend.id}
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`friend-bubble group absolute inline-flex items-center gap-2.5 w-auto max-w-[calc(100%-2rem)] rounded-full pl-0 pr-4 py-0 cursor-pointer transition-all duration-300 ease-out ${
                      isHovered
                        ? 'z-20 scale-[1.06] shadow-lg shadow-zinc-300/50 dark:shadow-black/40 bg-white dark:bg-zinc-800 animate-none'
                        : 'z-10 bg-white/85 dark:bg-zinc-900/75 hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: `translate(-50%, -50%) rotate(${isHovered ? 0 : rotation}deg)`,
                      '--float-phase': `${floatPhase}rad`,
                      '--float-speed': `${floatSpeed}s`,
                      '--float-amplitude': `${floatAmplitude}px`,
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredId(friend.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* 头像 */}
                    <div className="shrink-0 h-12 w-12 rounded-full overflow-hidden ring-1 ring-zinc-200/60 dark:ring-white/10">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
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
                      <h2 className="break-words text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {friend.name}
                      </h2>
                      <p className="mt-0.5 line-clamp-1 break-words text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                        {friend.description || extractDomain(friend.url)}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* ===== 移动端：简洁列表（无容器边框） ===== */}
            <div className="sm:hidden divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
              {friends.map((friend) => {
                const avatarUrl = resolveImageUrl(friend.avatarUrl || '')
                const domain = extractDomain(friend.url)

                return (
                  <a
                    key={friend.id}
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="friend-bubble group flex items-center gap-3 py-3.5 px-5 hover:bg-[#E9EEE8]/40 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-200/60 dark:ring-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-sm font-bold text-zinc-400 uppercase select-none">
                          {friend.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#727BBA] transition-colors">
                        {friend.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {friend.description || domain}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-[#727BBA] transition-colors" />
                  </a>
                )
              })}
            </div>
          </>
        )}

        {/* 申请入口 */}
        <div className="mt-8">
          <Link
            href="/friend/apply"
            className="friend-bubble group flex items-center justify-between px-5 py-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/25 hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer"
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
