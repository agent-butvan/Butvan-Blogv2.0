'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowLeft,
  Users,
  ArrowUpRight
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import FriendLinks from '@/components/friend/FriendLinks'
import { fetchFriendLinks } from '@/lib/friend-api'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'
import type { FriendLink } from '@/types/friend'
import { FRIEND_CATEGORIES } from '@/types/friend'
import gsap from 'gsap'

/**
 * 友链页面
 * 编辑式目录布局：按分类纵向分组的紧凑友链列表
 * 替代旧版 SVG 大树可视化，提升可读性与信息密度
 */
export default function FriendPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, friendsData] = await Promise.all([
          fetchProfile('butvan'),
          fetchFriendLinks(selectedCategory || undefined)
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
      gsap.fromTo('.friend-hero',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )

      gsap.fromTo('.friend-filter',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power2.out' }
      )

      gsap.fromTo('.friend-list-container',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.25, ease: 'power2.out' }
      )

      gsap.fromTo('.friend-cta',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' }
      )
    })

    return () => ctx.revert()
  }, [])

  // 点击友链跳转
  const handleFriendClick = (friend: FriendLink) => {
    window.open(friend.url, '_blank', 'noopener,noreferrer')
  }

  // 分类筛选
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-zinc-950 font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* Hero 区域 */}
      <section className="friend-hero pt-16 md:pt-20 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#727BBA]/10 text-[#727BBA]">
              <Users size={15} />
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
              友链
            </h1>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-0.5">
              {friends.length.toString().padStart(2, '0')} links
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            朋友们各自精彩的角落，按分类整理于此。每一行都是一个值得去逛逛的地方。
          </p>
        </div>
      </section>

      {/* 分类筛选 */}
      <nav className="friend-filter py-3 px-4 sticky top-16 z-20 bg-[#f6f6f6]/85 dark:bg-zinc-950/85 backdrop-blur-md border-y border-zinc-200/50 dark:border-zinc-900/60" aria-label="友链分类筛选">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === null
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800/70'
              }`}
              aria-pressed={selectedCategory === null}
            >
              全部
            </button>
            {FRIEND_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                    active
                      ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 border-transparent'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200/70 dark:border-zinc-800/70'
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: active ? 'currentColor' : cat.color }}
                    aria-hidden="true"
                  />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* 友链目录 */}
      <section className="friend-list-container relative py-6 px-0" aria-label="友链目录">
        {loading ? (
          <div className="flex items-center justify-center py-16" role="status" aria-label="加载中">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#727BBA] border-t-transparent" />
            <span className="sr-only">加载中...</span>
          </div>
        ) : (
          <FriendLinks friends={friends} onFriendClick={handleFriendClick} />
        )}
      </section>

      {/* 申请友链 CTA */}
      <section className="friend-cta py-8 px-4" aria-label="申请友链">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/friend/apply"
            className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 hover:border-[#727BBA]/40 dark:hover:border-[#727BBA]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#09B38A]/10 text-[#09B38A] shrink-0">
                <Sparkles size={16} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-heading font-semibold text-zinc-900 dark:text-zinc-50">
                  申请加入友链
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  审核通过后，你的站点将出现在这里
                </div>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:border-[#727BBA] group-hover:text-[#727BBA] group-hover:bg-[#727BBA]/5 transition-all">
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-zinc-200/50 dark:border-zinc-900/60">
        <div className="flex items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-xs">
          <ArrowLeft size={10} />
          <span>2026 Butvan Blog. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
