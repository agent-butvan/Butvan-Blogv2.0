'use client'

import React, { useState, useEffect } from 'react'
import FluidBackground from '@/components/home/FluidBackground'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'

/**
 * 博客首页
 *
 * 层次结构（底→顶）：
 * 1. FluidBackground  — 流动渐变 Blob 球背景
 * 2. HeroSection      — 个人信息核心区（头像、打字机简介、社交链接、CTA）
 * 3. FeaturesSection  — 技能卡片（第二屏，向下滚动可见）
 *
 * 场景房间入口：HeroSection 中的「🚪 进入我的房间」按钮 → /room
 */
export default function HomePage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile('butvan').then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-[#f6f6f6] font-body selection:bg-primary/20 text-zinc-900">
      {/* 隐藏夜店流体动画背景以匹配图片极简灰白风格 */}
      {/* <FluidBackground /> */}

      {/* Layer 2: 首屏 — 个人信息（左右分栏极简布局） */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-16 lg:px-24">
        <HeroSection profile={profile} loading={loading} />
      </section>

      {/* Layer 3: 第二屏 — 技能/兴趣卡片（页脚） */}
      <FeaturesSection profile={profile} />
    </main>
  )
}
