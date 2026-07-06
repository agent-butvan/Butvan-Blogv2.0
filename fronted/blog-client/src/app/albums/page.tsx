'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import AlbumGrid from '@/components/album/AlbumGrid'
import { AlbumGridSkeleton } from '@/components/album/AlbumSkeleton'
import { fetchPublicAlbums } from '@/lib/album-api'
import { fetchProfile } from '@/lib/profile'
import { handleError } from '@/lib/error-handler'
import type { ProfileVO } from '@/types/profile'
import type { AlbumItem } from '@/types/album'

/**
 * 「暗夜画廊」相册列表页
 *
 * 设计理念：
 * - 走进暗夜画廊，每个相册是一扇通往记忆空间的「门」
 * - 超大分类水印作为视觉锚点
 * - 非对称编辑式网格，不规则宽高比混合
 * - IntersectionObserver 滚动入场揭示 + hover 金色光晕微交互
 *
 * 无卡片、无模块化布局 —— 一切由排版、间距和比例定义。
 */
export default function AlbumsPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [albums, setAlbums] = useState<AlbumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, albumsData] = await Promise.all([
          fetchProfile('butvan'),
          fetchPublicAlbums(),
        ])
        setProfile(profileData)
        setAlbums(albumsData)
      } catch (err) {
        handleError(err, { silent: true, fallbackMessage: '加载相册列表失败' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 入场渐变
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 页头 —— 编辑式刊头排版 */}
      <header
        className="w-full max-w-6xl mx-auto px-4 pt-16 pb-3 text-center transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center justify-center gap-3">
          <Camera size={18} className="text-[#D4AF37]/70" />
          <h1 className="text-xl md:text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            暗夜画廊
          </h1>
          <span className="text-sm font-heading text-zinc-400 dark:text-zinc-500 font-medium">
            ·
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-heading">
            相册
          </span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-px">
            {albums.length}
          </span>
        </div>

        {/* 金色装饰线 */}
        <div className="mt-3 mx-auto w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </header>

      {/* 主内容区 */}
      <section
        className="flex-1 flex flex-col w-full pt-6 pb-16"
        aria-label="相册列表"
      >
        {loading ? (
          /* 加载态 — 骨架屏 */
          <AlbumGridSkeleton />
        ) : albums.length === 0 ? (
          /* 空状态 — 毛玻璃占位符 + 柔和呼吸光晕 */
          <div className="flex-1 min-h-[24rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-12 rounded-2xl backdrop-blur-md bg-white/5 dark:bg-zinc-900/10 border border-zinc-200/30 dark:border-zinc-800/30">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Camera size={24} className="text-zinc-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <p className="text-sm font-heading text-zinc-400 dark:text-zinc-500">
                暂无相册，敬请期待
              </p>
              <Link
                href="/article"
                className="flex items-center gap-1.5 text-xs text-[#727BBA] hover:text-[#5f68a3] transition-colors font-medium"
              >
                <ArrowLeft size={12} />
                返回文章列表
              </Link>
            </div>
          </div>
        ) : (
          /* 相册网格 */
          <AlbumGrid albums={albums} />
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-zinc-200/40 dark:border-zinc-900/50">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          2026 Butvan Blog
        </span>
      </footer>
    </div>
  )
}
