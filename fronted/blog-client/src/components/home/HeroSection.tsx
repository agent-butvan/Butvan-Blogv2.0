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
    <div className="relative z-10 max-w-4xl w-full py-10 text-left font-body">
      
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
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 mb-10 w-full">
        {/* 左侧头像区 (方形微圆角) */}
        <motion.div
          className="relative shrink-0"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-44 h-44 rounded-xl border border-black/5 dark:border-white/5 shadow-xs bg-white dark:bg-zinc-900 overflow-hidden p-1 flex items-center justify-center transition-all duration-300 hover:scale-[1.01]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile?.nickname || 'Avatar'}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold font-heading text-primary select-none">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 右侧基本信息区 */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2">
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
            className="text-4xl sm:text-5xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-5 leading-none"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            I'm {profile?.nickname || 'grtsinry43'}
          </motion.h1>

          {/* Bio / Tech Stack */}
          <motion.div
            className="text-sm sm:text-base text-zinc-400 dark:text-zinc-500 font-mono tracking-wide leading-relaxed font-normal"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {profile?.bio || 'Java/Kotlin + JavaScript/Typescript 全栈开发者 // 正在努力学习前端基建和架构设计'}
          </motion.div>
        </div>
      </div>

      {/* ===== 下半部分：详细介绍与社交链接 ===== */}
      <div className="w-full flex flex-col gap-6 text-zinc-700 dark:text-zinc-300 font-body text-base md:text-[17px] leading-relaxed">
        {/* Detailed Intro Lines */}
        <motion.div
          className="flex flex-col gap-3.5 max-w-3xl font-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="font-semibold text-zinc-800 dark:text-zinc-100">{introLine1}</p>
          <p className="text-zinc-650 dark:text-zinc-400">{introLine2}</p>
        </motion.div>

        {/* Links */}
        <motion.div
          className="flex items-center gap-6 mt-2 flex-wrap justify-center md:justify-start"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* GitHub Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <GitFork className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            GitHub
          </a>

          {/* Email Link */}
          <a
            href={emailUrl}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            Email
          </a>

          {/* RSS Link */}
          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-sm font-heading font-medium tracking-wide transition-colors group"
          >
            <Rss className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            RSS
          </a>
        </motion.div>
      </div>

      {/* ===== 右侧固定悬浮功能按钮 ===== */}
      {!loading && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 select-none">
          {/* 沉浸式房间入口 */}
          <Link
            href="/room"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-400 dark:text-rose-500 transition-all shadow-xs border border-rose-100/50 dark:border-rose-950/30 hover:scale-105 active:scale-95 group"
            title="沉浸式虚拟房间"
          >
            <LayoutGrid className="w-4.5 h-4.5" />
          </Link>
          
          {/* 管理后台入口 */}
          <a
            href="http://localhost:3000"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-400 dark:text-rose-500 transition-all shadow-xs border border-rose-100/50 dark:border-rose-950/30 hover:scale-105 active:scale-95 group"
            title="管理后台入口"
          >
            <Wand2 className="w-4.5 h-4.5" />
          </a>
        </div>
      )}

    </div>
  )
}
