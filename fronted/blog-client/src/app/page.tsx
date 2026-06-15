'use client'

import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchProfile('butvan').then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      // 1. 场景入口链接的入场弹性淡入
      gsap.fromTo(".room-link-wrap",
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.7)", delay: 1.2 }
      )

      // 2. 文字内字符的分开动态绑定
      const textEl = document.querySelector(".room-link-text")
      if (textEl) {
        const text = textEl.textContent || ''
        textEl.innerHTML = text.split("").map(char => 
          `<span class="room-char inline-block origin-center transition-colors duration-200">${char === " " ? "&nbsp;" : char}</span>`
        ).join("")

        // 鼠标进入时的 GSAP stagger 波浪琴键跳跃动画
        textEl.addEventListener("mouseenter", () => {
          gsap.killTweensOf(".room-char")
          gsap.to(".room-char", {
            y: -6,
            color: "#09B38A",
            duration: 0.15,
            stagger: 0.03,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
          })
        })
      }

      // 3. 链接图标及箭头的 Hover 3D 旋转和推拉
      const linkEl = document.querySelector(".room-link")
      if (linkEl) {
        linkEl.addEventListener("mouseenter", () => {
          gsap.to(".room-icon", {
            rotationY: 360,
            scale: 1.25,
            duration: 0.6,
            ease: "power2.out"
          })
          gsap.to(".room-arrow", {
            x: 6,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        linkEl.addEventListener("mouseleave", () => {
          gsap.to(".room-icon", {
            rotationY: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out"
          })
          gsap.to(".room-arrow", {
            x: 0,
            duration: 0.4,
            ease: "elastic.out(1.2, 0.5)"
          })
        })
      }
    })

    return () => ctx.revert()
  }, [loading])

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-[#f6f6f6] dark:bg-zinc-950 font-body selection:bg-primary/20 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* 隐藏夜店流体动画背景以匹配图片极简灰白风格 */}
      {/* <FluidBackground /> */}

      {/* Layer 2: 首屏 — 个人信息（完美契合参考图的极简左右+上下组合排版） */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24">
        <HeroSection profile={profile} loading={loading} />

        {!loading && (
          <div className="room-link-wrap absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-0">
            <Link
              href="/room"
              className="room-link group flex items-center gap-1 text-sm font-heading font-extrabold tracking-widest text-zinc-650 dark:text-zinc-350 cursor-pointer"
            >
              <span className="room-icon inline-block origin-center mr-1">🚪</span>
              <span className="room-link-text text-shine-effect">探索可梵的 3D 沉浸式场景空间</span>
              <span className="room-arrow inline-block font-mono ml-1.5">&rarr;</span>
            </Link>
            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-light select-none animate-bounce mt-3" title="向下滚动查看博文">↓ 向下滚动查看博文</span>
          </div>
        )}
      </section>

      {/* Layer 3: 第二屏 — 技能/兴趣卡片（页脚） */}
      <FeaturesSection profile={profile} />
    </main>
  )
}
