'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import PhotoLightbox from '@/components/album/PhotoLightbox'
import { fetchPublicPhotos } from '@/lib/album-api'
import { fetchProfile } from '@/lib/profile'
import { handleError } from '@/lib/error-handler'
import { resolveImageUrl } from '@/lib/image-url'
import type { ProfileVO } from '@/types/profile'
import type { PhotoWallItem } from '@/types/album'

/**
 * 「暗夜画廊 · 时光墙」照片时间线页
 *
 * 设计理念：
 * - 摈弃相册分类，所有已发布相册中的照片直接按时间倒序排列
 * - 瀑布流/非对称网格，视觉紧凑、信息密度高
 * - 按月份分组，金色时间戳分隔线
 * - 悬停揭示说明文字 + 所属相册标签
 * - IntersectionObserver 无限滚动分页
 * - 点击触发弹性灯箱
 *
 * 无卡片、无模块化布局 —— 一切由照片本身主导版面。
 */
export default function AlbumsPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [photos, setPhotos] = useState<PhotoWallItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [visible, setVisible] = useState(false)

  // 灯箱状态
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // IntersectionObserver sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)

  /** 加载首页数据 */
  const loadInitial = async () => {
    setLoading(true)
    try {
      const [profileData, photoData] = await Promise.all([
        fetchProfile('butvan'),
        fetchPublicPhotos(1, 20),
      ])
      setProfile(profileData)
      setPhotos(photoData.records || [])
      setTotal(photoData.total || 0)
      setHasMore((photoData.records || []).length < (photoData.total || 0))
    } catch (err) {
      handleError(err, { silent: true, fallbackMessage: '加载照片失败' })
    } finally {
      setLoading(false)
    }
  }

  /** 加载更多 */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await fetchPublicPhotos(nextPage, 20)
      setPhotos(prev => [...prev, ...(data.records || [])])
      setPage(nextPage)
      setHasMore((data.records || []).length >= 20)
    } catch (err) {
      handleError(err, { silent: true })
    } finally {
      setLoadingMore(false)
    }
  }, [page, loadingMore, hasMore])

  // 初始化
  useEffect(() => { loadInitial() }, [])

  // 入场渐现
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // 无限滚动
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || loading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelRef.current, hasMore, loadingMore, loading, loadMore])

  /** 按月份分组 */
  const monthGroups = groupByMonth(photos)

  /** 灯箱照片列表（适配 PhotoLightbox 的 AlbumPhoto 格式） */
  const lightboxPhotos = photos.map(p => ({
    id: p.id,
    mediaId: 0,
    fileName: p.caption || '照片',
    fileUrl: p.fileUrl,
    mimeType: 'image/jpeg',
    fileSize: 0,
    width: p.width,
    height: p.height,
    altText: p.caption,
    caption: p.caption,
    sortOrder: 0,
    createdAt: p.createdAt,
  }))

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 页头 — 编辑式刊头排版 */}
      <header
        className="w-full max-w-6xl mx-auto px-4 pt-16 pb-2 text-center transition-opacity duration-500 select-none"
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
            时光墙
          </span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-px">
            {total}
          </span>
        </div>

        {/* 金色装饰线 */}
        <div className="mt-3 mx-auto w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-heading">
          所有瞬间，按时间排列
        </p>
      </header>

      {/* 主内容区 */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-3 md:px-4 pt-6 pb-16" aria-label="照片时间线">
        {loading ? (
          /* 加载态 */
          <div className="flex items-center justify-center py-24">
            <Loader2 size={20} className="animate-spin text-zinc-350" />
          </div>
        ) : photos.length === 0 ? (
          /* 空状态 */
          <div className="flex-1 min-h-[24rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-12 rounded-2xl backdrop-blur-md bg-white/5 dark:bg-zinc-900/10 border border-zinc-200/30 dark:border-zinc-800/30">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Camera size={24} className="text-zinc-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <p className="text-sm font-heading text-zinc-400 dark:text-zinc-500">
                暂无照片，敬请期待
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 按月份分组渲染 */}
            {monthGroups.map((group) => (
              <div key={group.monthKey} className="mb-8">
                {/* 月份分隔线 */}
                <div className="flex items-center gap-3 mb-4 px-1 select-none">
                  <span className="text-xs font-mono font-bold text-[#D4AF37]/60 dark:text-[#D4AF37]/40">
                    {group.monthLabel}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/15 to-transparent" />
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {group.photos.length} 张
                  </span>
                </div>

                {/* 瀑布流网格 — CSS columns 实现 */}
                <div
                  className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3 space-y-2 md:space-y-3"
                >
                  {group.photos.map((photo, idx) => {
                    // 在 groups 中的全局索引需要计算
                    const globalIdx = photos.indexOf(photo)
                    return (
                      <PhotoTile
                        key={photo.id}
                        photo={photo}
                        onClick={() => setLightboxIndex(globalIdx)}
                        priority={idx < 8}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            {/* 加载更多 sentinel */}
            <div ref={sentinelRef} className="flex items-center justify-center py-8">
              {loadingMore && (
                <Loader2 size={18} className="animate-spin text-zinc-350" />
              )}
            </div>
          </>
        )}
      </section>

      {/* 灯箱 */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Footer */}
      <footer className="py-8 text-center border-t border-zinc-200/40 dark:border-zinc-900/50">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          2026 Butvan Blog
        </span>
      </footer>
    </div>
  )
}

// ==================== 子组件 ====================

/** 照片瓦片 — 瀑布流中的单张照片 */
function PhotoTile({
  photo,
  onClick,
  priority = false,
}: {
  photo: PhotoWallItem
  onClick: () => void
  priority?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const imgUrl = resolveImageUrl(photo.fileUrl)

  // 根据宽高比计算容器 aspect-ratio，防止布局抖动
  const aspectRatio = photo.width && photo.height
    ? (photo.width / photo.height)
    : 3 / 4 // 默认竖图比例

  return (
    <div
      onClick={onClick}
      className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer border border-zinc-200/30 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/5 hover:-translate-y-0.5"
    >
      {/* 占位骨架 */}
      <div
        className="w-full relative overflow-hidden"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        {/* 骨架脉冲 */}
        {!loaded && (
          <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
        )}

        <img
          src={imgUrl}
          alt={photo.caption || photo.albumTitle}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          style={{ opacity: loaded ? 1 : 0 }}
        />

        {/* hover 覆盖层 — 金色光晕 + 信息揭示 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {/* 说明文字 */}
          {photo.caption && (
            <p className="text-xs text-white/95 font-body leading-snug line-clamp-2 mb-1.5">
              {photo.caption}
            </p>
          )}

          {/* 相册标签 */}
          <div className="flex items-center gap-1.5">
            <Camera size={9} className="text-[#D4AF37]/80 shrink-0" />
            <span className="text-[10px] text-white/70 font-heading truncate">
              {photo.albumTitle}
            </span>
          </div>

          {/* 顶部金色光晕条 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </div>
  )
}

// ==================== 工具函数 ====================

/** 月份分组 */
interface MonthGroup {
  monthKey: string
  monthLabel: string
  photos: PhotoWallItem[]
}

function groupByMonth(photos: PhotoWallItem[]): MonthGroup[] {
  const map = new Map<string, PhotoWallItem[]>()

  for (const photo of photos) {
    const date = new Date(photo.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`

    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(photo)
  }

  return Array.from(map.entries()).map(([monthKey, photos]) => ({
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    photos,
  }))
}

/** 格式化月份标签 */
function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return `${year}年${monthNames[parseInt(month) - 1]}`
}
