'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
    <main className="relative w-full min-h-screen overflow-x-hidden bg-[#f6f6f6] dark:bg-zinc-950 font-body selection:bg-primary/20 text-zinc-900 dark:text-zinc-50 bg-grid-pattern transition-colors">
      {/* 隐藏夜店流体动画背景以匹配图片极简灰白风格 */}
      {/* <FluidBackground /> */}

      {/* Layer 2: 首屏 — 个人信息（左右分栏极简布局，带有精致网格纹理与柔和渐变晕染） */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6 md:px-16 lg:px-24 py-16 md:py-24">
        {/* 背景微弱渐变光晕，中和留白空旷感 */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#09B38A]/3 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#727BBA]/3 blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2" />

        <HeroSection profile={profile} loading={loading} />
      </section>

      {/* Layer 3: 第二屏 — 技能/兴趣卡片（页脚） */}
      <FeaturesSection profile={profile} />
    </main>
  )
}
