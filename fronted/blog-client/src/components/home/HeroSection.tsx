'use client'

import React, { useRef, useEffect } from 'react'
import { GitFork, Mail, Rss, LayoutGrid, Wand2 } from 'lucide-react'
import Link from 'next/link'
import type { ProfileVO } from '@/types/profile'
import gsap from 'gsap'

/** HeroSection Props */
interface HeroSectionProps {
  profile: ProfileVO | null
  loading: boolean
}

/**
 * 极简左右分栏风格的个人介绍核心区 - GSAP 物理动画版
 * - 移除了 Framer Motion，采用更强悍的 GSAP 动画引擎接管动效
 * - 头像在入场时带有 3D 旋转及缩放，登场后进入无限柔和的上下阻尼悬浮 loop 状态
 * - 招呼语和 Bio 签名滑位登场
 * - 昵称大标题采用字符切割，每一个单字/字母均配合 GSAP 3D stagger 翻转入场，产生极其丝滑的涟漪效果
 * - 社交链接和右侧粉色悬浮圆形功能按钮均伴有 elastic 弹性动画弹入
 */
export default function HeroSection({ profile, loading }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 解析图片 URL
  const resolveUrl = (url?: string) => {
    if (!url) return null
    return url.startsWith('/') ? `http://localhost:8080${url}` : url
  }

  // 默认头像 initials
  const initials = (profile?.nickname || 'B').charAt(0).toUpperCase()
  const avatarUrl = resolveUrl(profile?.avatarUrl)

  // 社交链接
  const githubUrl = profile?.socialLinks?.github || 'https://github.com'
  const emailUrl = profile?.socialLinks?.email ? `mailto:${profile.socialLinks.email}` : 'mailto:contact@example.com'
  const rssUrl = profile?.socialLinks?.rss || '/rss.xml'

  // 自定义介绍文案
  const introLine1 = profile?.socialLinks?.introLine1 || '🔥 大三前端探索者 | 写代码也写生活 | 开源项目复盘 ✨'
  const introLine2 = profile?.socialLinks?.introLine2 || '欢迎来我的博客交流学习，一起成长进步，用代码碰撞灵感，一起走更远~'

  // GSAP 动画生命周期
  useEffect(() => {
    if (loading || !profile) return

    // 建立 context 隔离动画，防止 React 18+ 双挂载导致的冲突
    const ctx = gsap.context(() => {
      
      // 1. 头像卡片 3D 旋转缩放并渐入
      gsap.fromTo(".avatar-card", 
        { scale: 0.8, opacity: 0, rotationY: -45, transformPerspective: 1000 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1.4, ease: "power4.out" }
      )
      
      // 头像卡片无限周期漂浮，中和死板网页留白
      gsap.to(".avatar-card", {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

      // 2. Hi! 👋 招呼语入场
      gsap.fromTo(".hi-text",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 }
      )

      // 3. 昵称大标题：3D stagger 单字符波浪空降
      const nameEl = document.querySelector(".nickname-title")
      if (nameEl) {
        const text = nameEl.textContent || ''
        nameEl.innerHTML = text.split("").map(char => 
          `<span class="char-letter inline-block transform origin-bottom opacity-0">${char === " " ? "&nbsp;" : char}</span>`
        ).join("")
        
        // 移去父容器的 opacity-0 类，防止子元素因父级隐藏而不显示
        nameEl.classList.remove("opacity-0")

        gsap.fromTo(".char-letter",
          { y: 50, opacity: 0, rotationX: -90, transformPerspective: 600 },
          { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.05, ease: "back.out(1.8)", delay: 0.15 }
        )
      }

      // 4. Bio 双斜杠签名渐显
      gsap.fromTo(".bio-signature",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.45 }
      )

      // 5. 下半部分详情段落交错滑起
      gsap.fromTo(".intro-item",
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: 0.6 }
      )

      // 6. 底部社交超链接微弹入场
      gsap.fromTo(".social-link-item",
        { scale: 0.7, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)", delay: 0.95 }
      )

      // 7. 右侧悬浮圆形交互按钮从屏幕右侧弹性弹入
      gsap.fromTo(".float-btn-item",
        { x: 70, opacity: 0, scale: 0.5 },
        { x: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.15, ease: "elastic.out(1.1, 0.7)", delay: 1.1 }
      )

    }, containerRef)

    return () => ctx.revert()
  }, [loading, profile])

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-4xl w-full justify-center">
        {/* 头像占位 */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-zinc-200 animate-pulse shrink-0" />
        {/* 文字占位 */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div className="w-16 h-6 bg-zinc-200 animate-pulse rounded" />
          <div className="w-48 h-10 bg-zinc-200 animate-pulse rounded" />
          <div className="w-full h-5 bg-zinc-200 animate-pulse rounded" />
          <div className="w-3/4 h-5 bg-zinc-200 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative z-10 max-w-4xl w-full py-10 text-left font-body">
      
      {/* 注入招手动画样式 */}
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1.8s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>

      {/* ===== 上半部分：左右分栏基本信息 ===== */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 mb-12 w-full">
        {/* 左侧头像区 (方形微圆角) */}
        <div className="avatar-card relative shrink-0">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs bg-white dark:bg-zinc-900 overflow-hidden p-1.5 flex items-center justify-center transition-all duration-300 hover:scale-[1.01]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile?.nickname || 'Avatar'}
                className="w-full h-full object-cover rounded-xl"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-5xl font-bold font-heading text-primary select-none">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧基本信息区 */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
          {/* Hi! 👋 */}
          <div className="hi-text text-[#09B38A] italic text-4xl md:text-5xl font-heading font-medium mb-3 flex items-center gap-1.5 opacity-0">
            <span>Hi!</span>
            <span className="animate-wave">👋</span>
          </div>

          {/* Name */}
          <h1 className="nickname-title text-5xl sm:text-6xl md:text-[68px] lg:text-[76px] font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-6 leading-none opacity-0">
            I'm {profile?.nickname || 'grtsinry43'}
          </h1>

          {/* Bio / Tech Stack */}
          <div className="bio-signature text-base sm:text-lg md:text-xl text-zinc-400 dark:text-zinc-500 font-mono tracking-wide leading-relaxed font-normal opacity-0">
            {profile?.bio || 'Java/Kotlin + JavaScript/Typescript 全栈开发者 // 正在努力学习前端基建和架构设计'}
          </div>
        </div>
      </div>

      {/* ===== 下半部分：详细介绍与社交链接 ===== */}
      <div className="w-full flex flex-col gap-8 text-zinc-700 dark:text-zinc-300 font-body text-lg sm:text-xl md:text-[22px] leading-relaxed">
        {/* Detailed Intro Lines */}
        <div className="flex flex-col gap-5 max-w-4xl font-normal">
          <p className="intro-item font-semibold text-zinc-800 dark:text-zinc-100 opacity-0">{introLine1}</p>
          <p className="intro-item text-zinc-650 dark:text-zinc-450 opacity-0">{introLine2}</p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-7 mt-3 flex-wrap justify-center md:justify-start">
          {/* GitHub Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-item flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-base md:text-[17px] font-heading font-medium tracking-wide transition-colors group opacity-0"
          >
            <GitFork className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            GitHub
          </a>

          {/* Email Link */}
          <a
            href={emailUrl}
            className="social-link-item flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-base md:text-[17px] font-heading font-medium tracking-wide transition-colors group opacity-0"
          >
            <Mail className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            Email
          </a>

          {/* RSS Link */}
          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-item flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-base md:text-[17px] font-heading font-medium tracking-wide transition-colors group opacity-0"
          >
            <Rss className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            RSS
          </a>
        </div>
      </div>

      {/* ===== 右侧固定悬浮功能按钮 ===== */}
      {!loading && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 select-none">
          {/* 沉浸式房间入口 */}
          <Link
            href="/room"
            className="float-btn-item w-10 h-10 rounded-full flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-400 dark:text-rose-500 transition-all shadow-xs border border-rose-100/50 dark:border-rose-950/30 hover:scale-105 active:scale-95 group opacity-0"
            title="沉浸式虚拟房间"
          >
            <LayoutGrid className="w-4.5 h-4.5" />
          </Link>
          
          {/* 管理后台入口 */}
          <a
            href="http://localhost:3000"
            className="float-btn-item w-10 h-10 rounded-full flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-400 dark:text-rose-500 transition-all shadow-xs border border-rose-100/50 dark:border-rose-950/30 hover:scale-105 active:scale-95 group opacity-0"
            title="管理后台入口"
          >
            <Wand2 className="w-4.5 h-4.5" />
          </a>
        </div>
      )}

    </div>
  )
}
