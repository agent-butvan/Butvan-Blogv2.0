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
    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 max-w-4xl w-full justify-center py-10 text-left font-body">
      
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
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-[24px] border border-black/5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.08)] bg-white overflow-hidden p-2 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.nickname || 'Avatar'}
              className="w-full h-full object-cover rounded-[16px]"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full rounded-[16px] bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold font-heading text-primary select-none">
                {initials}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== 2. 右侧信息区 (左对齐) ===== */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2">
        {/* Hi! 👋 */}
        <motion.div
          className="text-[#09B38A] italic text-2xl font-heading font-medium mb-1.5 flex items-center gap-1.5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span>Hi!</span>
          <span className="animate-wave">👋</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-3xl sm:text-4xl font-heading font-bold text-zinc-850 tracking-tight mb-4.5"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          I'm {profile?.nickname || 'BUTVAN'}
        </motion.h1>

        {/* Bio / Tech Stack */}
        <motion.div
          className="text-xs sm:text-sm text-zinc-500 font-mono tracking-normal leading-relaxed mb-6 font-medium"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {profile?.bio || 'Java/Kotlin + JavaScript/Typescript 全栈开发者'}
        </motion.div>

        {/* Detailed Intro Lines */}
        <motion.div
          className="flex flex-col gap-2.5 text-zinc-700 font-body text-xs sm:text-sm max-w-xl mb-7 leading-relaxed font-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="font-semibold text-zinc-800">{introLine1}</p>
          <p className="text-zinc-650">{introLine2}</p>
        </motion.div>

        {/* Links */}
        <motion.div
          className="flex items-center gap-5 flex-wrap justify-center md:justify-start"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* GitHub Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 text-xs font-heading font-medium tracking-wide transition-colors group"
          >
            <GitFork className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
            GitHub
          </a>

          {/* Email Link */}
          <a
            href={emailUrl}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 text-xs font-heading font-medium tracking-wide transition-colors group"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
            Email
          </a>

          {/* RSS Link */}
          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-850 text-xs font-heading font-medium tracking-wide transition-colors group"
          >
            <Rss className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
            RSS
          </a>
        </motion.div>
      </div>

    </div>
  )
}
