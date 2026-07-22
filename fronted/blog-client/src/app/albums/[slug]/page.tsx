'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Camera } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import AlbumHero from '@/components/album/AlbumHero'
import PhotoLightbox from '@/components/album/PhotoLightbox'
import { AlbumDetailSkeleton } from '@/components/album/AlbumSkeleton'
import { fetchAlbumBySlug } from '@/lib/album-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import { handleError } from '@/lib/error-handler'
import type { ProfileVO } from '@/types/profile'
import type { AlbumDetail, AlbumPhoto } from '@/types/album'

/**
 * 「光影长廊」相册详情页
 *
 * 设计理念：
 * - 进入相册后如同走进光影长廊，照片以非对称瀑布流展开
 * - 顶部超大封面图 + 毛玻璃标题叠层（视差滚动）
 * - CSS Grid 自适应非对称照片墙
 * - 灯箱：点击照片 → 弹性展开（cubic-bezier 弹性动画）
 * - 照片依次错落入场（stagger 60ms/张）
 *
 * 技术要点：
 * - 灯箱支持键盘 ← → 切换、Esc 关闭
 * - prefers-reduced-motion 尊重
 */
export default function AlbumDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  // 灯箱状态
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // 加载数据
  useEffect(() => {
    if (!slug) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [profileData, albumData] = await Promise.all([
          fetchProfile('butvan'),
          fetchAlbumBySlug(slug),
        ])
        setProfile(profileData)
        setAlbum(albumData)
      } catch (err) {
        handleError(err, { silent: true, fallbackMessage: '加载相册失败' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  // 入场渐变
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // 灯箱导航
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  // ===== 加载态 =====
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
        <Navbar profile={null} />
        <SidebarWidget />
        <AlbumDetailSkeleton />
      </div>
    )
  }

  // ===== 相册不存在 =====
  if (!album) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
        <Navbar profile={profile} />
        <SidebarWidget />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl backdrop-blur-md bg-white/5 dark:bg-zinc-900/10 border border-zinc-200/30 dark:border-zinc-800/30">
            <Camera size={32} className="text-zinc-400" />
            <p className="text-sm font-heading text-zinc-500">相册不存在或已被删除</p>
            <Link
              href="/albums"
              className="flex items-center gap-1.5 text-xs text-[#727BBA] hover:text-[#5f68a3] transition-colors font-medium"
            >
              <ArrowLeft size={12} />
              返回相册列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 照片按 sortOrder 排序
  const sortedPhotos = [...album.photos].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />
      <SidebarWidget />

      {/* 顶部横幅 — 视差 + 毛玻璃标题叠层 */}
      <AlbumHero album={album} />

      {/* 返回链接 */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/albums"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft size={12} />
          返回相册列表
        </Link>
      </div>

      {/* 照片墙 — 非对称 CSS Grid */}
      <section
        className="flex-1 w-full max-w-7xl mx-auto px-4 pb-20"
        aria-label={`${album.title} 的照片`}
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 500ms ease-out 200ms' }}
      >
        {sortedPhotos.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Camera size={28} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">相册中暂无照片</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-auto">
            {sortedPhotos.map((photo, index) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                index={index}
                onClick={() => openLightbox(index)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 灯箱 */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}

      {/* 全站统一页脚 */}
      <Footer />
    </div>
  )
}

/**
 * 照片瓷片子组件
 *
 * 错落入场（stagger 60ms）+ hover 缩放 + 毛玻璃信息浮层
 */
function PhotoTile({
  photo,
  index,
  onClick,
}: {
  photo: AlbumPhoto
  index: number
  onClick: () => void
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 错落入场动画
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = prefersReducedMotion ? 0 : index * 60

    const timer = setTimeout(() => setIsVisible(true), delay + 100)
    return () => clearTimeout(timer)
  }, [index])

  const imageUrl = resolveImageUrl(photo.fileUrl)

  // 根据索引变化网格 span，创造非对称感
  const gridSpan = index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''

  return (
    <div
      className={`${gridSpan} rounded-xl overflow-hidden cursor-pointer transition-all duration-600 ease-out`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
      }}
    >
      <div
        className="group relative w-full h-full bg-zinc-100 dark:bg-zinc-800"
        style={{ aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : '4/3' }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 照片 */}
        <img
          src={imageUrl}
          alt={photo.caption || photo.fileName}
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
          loading="lazy"
        />

        {/* hover 遮罩 */}
        <div
          className="absolute inset-0 bg-black/20 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* 毛玻璃信息浮层 — hover 时从底部滑入 */}
        {photo.caption && (
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 backdrop-blur-md bg-black/40 transition-all duration-300 ease-out"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <span className="text-[11px] text-white/90 truncate block">{photo.caption}</span>
          </div>
        )}
      </div>
    </div>
  )
}
