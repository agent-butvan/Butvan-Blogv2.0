'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { AlbumDetail } from '@/types/album'
import { resolveImageUrl } from '@/lib/image-url'
import { Calendar, Camera, Eye } from 'lucide-react'

interface AlbumHeroProps {
  album: AlbumDetail
}

/**
 * 相册详情页顶部横幅组件
 *
 * 设计：超大封面图 + 毛玻璃标题叠层
 * 交互动效：滚动视差（封面图 translateY 随滚动偏移）
 * 底部信息栏：照片数、浏览数、创建日期
 */
export default function AlbumHero({ album }: AlbumHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)
  const [visible, setVisible] = useState(false)

  // 入场渐变
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // 滚动视差效果
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      setOffsetY(scrollY * 0.25) // 视差系数 0.25
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const coverUrl = album.coverImageUrl
    ? resolveImageUrl(album.coverImageUrl)
    : null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[50vh] min-h-[380px] max-h-[600px] overflow-hidden select-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 600ms ease-out' }}
    >
      {/* 封面图 — 视差效果 */}
      <div
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ transform: `translateY(${offsetY}px)`, willChange: 'transform' }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
        )}

        {/* 暗角渐变层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* 毛玻璃标题叠层 */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 z-10">
        {/* 标题 — 超大字号 + 毛玻璃背景条 */}
        <div className="backdrop-blur-lg bg-black/30 rounded-2xl px-8 py-4 border border-white/10 inline-block mb-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight text-center">
            {album.title}
          </h1>
        </div>

        {/* 描述 */}
        {album.description && (
          <p className="text-sm md:text-base text-white/80 font-body max-w-lg text-center mb-5 leading-relaxed">
            {album.description}
          </p>
        )}

        {/* 元信息行 */}
        <div className="flex items-center gap-5 text-white/60 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <Camera size={13} />
            {album.photoCount} 张照片
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={13} />
            {album.viewCount} 次浏览
          </span>
          {album.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(album.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* 底部渐变 → 消失到背景 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-background z-10" />
    </div>
  )
}
