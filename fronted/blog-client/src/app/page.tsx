'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FluidBackground from '@/components/home/FluidBackground'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'
import gsap from 'gsap'

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
  const router = useRouter()

  useEffect(() => {
    fetchProfile('butvan').then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  // 监听向下滚动动作，触发平滑切入主场景空间
  useEffect(() => {
    if (loading) return

    let redirected = false
    const triggerRedirect = () => {
      if (redirected) return
      redirected = true
      router.push('/room')
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        triggerRedirect()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 5) {
        triggerRedirect()
      }
    }

    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY
      if (touchStartY - touchEndY > 20) { // 手势向上滑动
        triggerRedirect()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    // 指示器的 GSAP 渐显入场
    const ctx = gsap.context(() => {
      gsap.fromTo(".scroll-indicator",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 1.2 }
      )
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      ctx.revert()
    }
  }, [loading, router])

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-[#f6f6f6] dark:bg-zinc-950 font-body selection:bg-primary/20 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* 隐藏夜店流体动画背景以匹配图片极简灰白风格 */}
      {/* <FluidBackground /> */}

      {/* Layer 2: 首屏 — 个人信息（完美契合参考图的极简左右+上下组合排版） */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24">
        <HeroSection profile={profile} loading={loading} />

        {!loading && (
          <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-0 text-zinc-400 dark:text-zinc-500 select-none">
            <span className="text-[9px] font-heading font-semibold tracking-widest text-zinc-400 dark:text-zinc-600 uppercase">
              SCROLL DOWN TO ENTER ROOM
            </span>
            <span className="text-xs font-light animate-bounce mt-1.5">↓</span>
          </div>
        )}
      </section>

      {/* Layer 3: 第二屏 — 技能/兴趣卡片（页脚） */}
      <FeaturesSection profile={profile} />
    </main>
  )
}
