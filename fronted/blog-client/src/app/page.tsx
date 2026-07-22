'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FluidBackground from '@/components/home/FluidBackground'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
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
 * 文章列表入口：HeroSection 中的「🚪 进入我的房间」按钮 → /article
 * 向下滚动也会自动跳转到文章列表页面
 */
export default function HomePage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 滚轮累积量和防抖计时器
  const wheelAccumulated = useRef(0)
  const wheelTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchProfile('butvan').then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  // 监听向下滚动动作，触发沉浸式黑洞穿梭转场并切入主场景空间
  useEffect(() => {
    if (loading) return

    let redirected = false
    const triggerRedirect = () => {
      if (redirected) return
      redirected = true

      // 禁用页面所有点击，防止二次触发
      document.body.style.pointerEvents = 'none'

      const tl = gsap.timeline({
        onComplete: () => {
          router.push('/article')
          // 跳转后 1.2 秒恢复 body 交互
          setTimeout(() => {
            document.body.style.pointerEvents = 'auto'
          }, 1200)
        }
      })

      // 1. 首屏各个组件向屏幕中心深处飞逝模糊收缩（穿梭吸入效果）
      tl.to(".avatar-card", { scale: 0.15, y: -80, rotation: 12, opacity: 0, filter: "blur(10px)", duration: 0.8, ease: "power2.in" }, 0)
      tl.to(".hi-text", { scale: 0.2, y: -40, opacity: 0, filter: "blur(6px)", duration: 0.7, ease: "power2.in" }, 0.04)
      tl.to(".nickname-title", { scale: 0.15, y: -60, opacity: 0, filter: "blur(8px)", duration: 0.75, ease: "power2.in" }, 0.06)
      tl.to(".bio-signature", { scale: 0.2, y: -30, opacity: 0, filter: "blur(6px)", duration: 0.7, ease: "power2.in" }, 0.08)
      tl.to(".intro-item", { scale: 0.2, y: 80, opacity: 0, filter: "blur(8px)", duration: 0.75, ease: "power2.in" }, 0.1)
      tl.to(".social-link-item", { scale: 0.2, y: 40, opacity: 0, filter: "blur(6px)", duration: 0.65, ease: "power2.in" }, 0.12)
      tl.to(".scroll-indicator", { scale: 0.2, opacity: 0, filter: "blur(4px)", duration: 0.4 }, 0)

      // 2. 屏幕中心的转场时空孔洞瞬间膨胀并吞噬全屏
      tl.to(".transition-portal", {
        scale: 140,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.85,
        ease: "power3.in"
      }, 0.08)
    }

    // A. 页面实际滚动距离需大于首屏高度的 25%
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.25
      if (window.scrollY > threshold) {
        triggerRedirect()
      }
    }

    // B. 滚轮事件：累积 deltaY，需在短时间内向下猛力滚动超过 300 阈值
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return // 忽略向上滚动
      
      wheelAccumulated.current += e.deltaY

      if (wheelAccumulated.current > 300) {
        triggerRedirect()
        return
      }

      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => {
        wheelAccumulated.current = 0
      }, 300)
    }

    // C. 触屏滑动：上滑滑行距离需大于 120px
    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY
      const distance = touchStartY - touchEndY
      if (distance > 120) {
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
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      ctx.revert()
    }
  }, [loading, router])

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-transparent font-body selection:bg-primary/20 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* 顶部动态主导航栏 */}
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 隐藏夜店流体动画背景以匹配图片极简灰白风格 */}
      {/* <FluidBackground /> */}

      {/* Layer 2: 首屏 — 个人信息（独立占满 100vh 视口空间，确保 Footer 不置于首屏） */}
      <section className="relative w-full min-h-screen flex flex-col justify-between items-center px-6 md:px-16 lg:px-24 pt-20 pb-10">
        <div className="w-full flex-1 flex items-center justify-center">
          <HeroSection profile={profile} loading={loading} />
        </div>

        {!loading && (
          <div className="scroll-indicator pb-4 flex flex-col items-center gap-1 opacity-0 text-zinc-400 dark:text-zinc-500 select-none">
            <span className="text-[9px] font-heading font-medium tracking-widest text-zinc-400 dark:text-zinc-600 uppercase">
              SCROLL DOWN TO VIEW ARTICLES
            </span>
            <span className="text-xs font-light animate-bounce mt-1.5">↓</span>
          </div>
        )}
      </section>

      {/* 沉浸式转场时空孔洞遮罩 (用于转场动画，高质感) */}
      <div className="transition-overlay fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-transparent">
        <div className="transition-portal w-12 h-12 rounded-full bg-zinc-950 dark:bg-[#09B38A] scale-0 opacity-0 filter blur-md" />
      </div>

      {/* Layer 3: 第二屏 — 技能/兴趣卡片（页脚） */}
      <FeaturesSection profile={profile} />
    </main>
  )
}
