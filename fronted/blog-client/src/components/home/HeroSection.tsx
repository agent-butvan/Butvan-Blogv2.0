'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GitFork, Mail, Rss, LayoutGrid, Wand2 } from 'lucide-react'
import Link from 'next/link'
import type { ProfileVO } from '@/types/profile'

/** HeroSection Props */
interface HeroSectionProps {
  profile: ProfileVO | null
  loading: boolean
}

/**
 * 极简左右分栏风格的个人介绍核心区
 * 完美还原图片设计：
 * - 灰白背景大理石质感
 * - 左侧：带柔和阴影的方形二次元头像
 * - 右侧：左对齐的信息排版，斜体 Hi! 招手手势，大昵称，等宽签名，两行介绍与极简超链接
 * - 右侧固定悬浮两个粉色功能圆形按钮（沉浸式房间 / 登录后台入口）
 */
export default function HeroSection({ profile, loading }: HeroSectionProps) {
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

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-4xl w-full justify-center">
        {/* 头像占位 */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-zinc-200 animate-pulse shrink-0" />
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
    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 lg:gap-20 max-w-5xl w-full justify-center py-12 md:py-16 text-left font-body">
      
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

      {/* ===== 1. 左侧头像区 ===== */}
      <motion.div
        className="relative shrink-0"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-[32px] border border-black/5 dark:border-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] bg-white dark:bg-zinc-900 overflow-hidden p-2.5 flex items-center justify-center transition-all duration-300 hover:shadow-[0_25px_60px_-12px_rgba(9,179,138,0.2)] hover:scale-[1.02]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.nickname || 'Avatar'}
              className="w-full h-full object-cover rounded-[24px]"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full rounded-[24px] bg-primary/10 flex items-center justify-center">
              <span className="text-5xl font-bold font-heading text-primary select-none">
                {initials}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== 2. 右侧信息区 (左对齐) ===== */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
        {/* 实时状态呼吸灯挂件 */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09B38A]/5 dark:bg-[#09B38A]/10 border border-[#09B38A]/15 text-[#09B38A] text-[11px] font-mono mb-4 w-fit shadow-xs select-none"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#09B38A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#09B38A]"></span>
          </span>
          <span className="font-semibold tracking-wide">{profile?.socialLinks?.liveStatus || 'LIVE: 探索 AI 代理与全栈开发中...'}</span>
        </motion.div>

        {/* Hi! 👋 */}
        <motion.div
          className="text-[#09B38A] italic text-3xl font-heading font-medium mb-2 flex items-center gap-1.5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span>Hi!</span>
          <span className="animate-wave">👋</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-5 leading-none"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          I'm {profile?.nickname || 'BUTVAN'}
        </motion.h1>

        {/* Bio / Tech Stack */}
        <motion.div
          className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-mono tracking-normal leading-relaxed mb-6 font-medium"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {profile?.bio || 'Java/Kotlin + JavaScript/Typescript 全栈开发者'}
        </motion.div>

        {/* Detailed Intro Lines */}
        <motion.div
          className="flex flex-col gap-3.5 text-zinc-700 dark:text-zinc-300 font-body text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="font-semibold text-zinc-800 dark:text-zinc-100 text-[15px] sm:text-[17px] md:text-[19px]">{introLine1}</p>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm sm:text-base md:text-[17px]">{introLine2}</p>
        </motion.div>

        {/* CTA 核心入口区 */}
        <motion.div
          className="flex flex-wrap items-center gap-4 mb-8"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Link
            href="/room"
            className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#09B38A] hover:bg-[#09B38A]/90 text-white text-sm sm:text-base font-semibold tracking-wide shadow-[0_10px_25px_-5px_rgba(9,179,138,0.3)] hover:shadow-[0_12px_30px_-5px_rgba(9,179,138,0.55)] hover:scale-[1.02] transition-all duration-300 group"
          >
            <span>🚪 进入我的 3D 虚拟空间</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">&gt;</span>
          </Link>
          
          <a
            href="http://localhost:3000"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-100 text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02]"
          >
            <span>⚡ 管理后台入口</span>
          </a>
        </motion.div>

        {/* Links */}
        <motion.div
          className="flex items-center gap-6 flex-wrap justify-center md:justify-start"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* GitHub Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <GitFork className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
            GitHub
          </a>

          {/* Email Link */}
          <a
            href={emailUrl}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <Mail className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
            Email
          </a>

          {/* RSS Link */}
          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <Rss className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
            RSS
          </a>
        </motion.div>
      </div>

    </div>
  )
}
