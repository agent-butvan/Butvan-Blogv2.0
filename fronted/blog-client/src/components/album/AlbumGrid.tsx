'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { AlbumItem } from '@/types/album'
import { resolveImageUrl } from '@/lib/image-url'
import { Camera } from 'lucide-react'

interface AlbumGridProps {
  albums: AlbumItem[]
}

/**
 * 「暗夜画廊」非对称编辑式网格
 *
 * 设计理念：
 * - 每个相册是一扇通往记忆空间的"门"
 * - 非对称双栏/三栏瑞士编辑式网格，不规则宽高比混合
 * - IntersectionObserver → 滚动入场揭示动画
 * - hover 时封面去灰 + 金色光晕 + 毛玻璃信息层滑入
 *
 * 禁止传统卡片模块布局，一切由排版、间距和比例定义。
 */

/** 网格项尺寸模式：用于计算每个网格单元的 aspect-ratio 和 span */
const GRID_PATTERNS = [
  { aspectRatio: '16/9', colSpan: 'md:col-span-2', rowSpan: '' },
  { aspectRatio: '4/5', colSpan: '', rowSpan: '' },
  { aspectRatio: '3/2', colSpan: '', rowSpan: '' },
  { aspectRatio: '1/1', colSpan: '', rowSpan: '' },
  { aspectRatio: '4/5', colSpan: 'md:col-span-2', rowSpan: '' },
  { aspectRatio: '3/2', colSpan: '', rowSpan: 'md:row-span-2' },
  { aspectRatio: '16/9', colSpan: '', rowSpan: '' },
  { aspectRatio: '1/1', colSpan: '', rowSpan: '' },
] as const

/** 单个相册条目 */
function AlbumEntry({ album, pattern, index }: {
  album: AlbumItem
  pattern: (typeof GRID_PATTERNS)[number]
  index: number
}) {
  const entryRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // IntersectionObserver — 滚动入场揭示
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const el = entryRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const coverUrl = album.coverImageUrl
    ? resolveImageUrl(album.coverImageUrl)
    : null

  return (
    <div
      ref={entryRef}
      className={`${pattern.colSpan} ${pattern.rowSpan}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms,
                     transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms`,
      }}
    >
      <Link
        href={`/albums/${album.slug}`}
        className="group relative block w-full h-full rounded-2xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: pattern.aspectRatio }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 封面图 */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-all duration-700 ease-out"
            style={{
              filter: isHovered ? 'grayscale(0%)' : 'grayscale(20%)',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 flex items-center justify-center">
            <Camera size={28} className="text-zinc-600" />
          </div>
        )}

        {/* 金色光晕 — hover 时浮现 */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: 'inset 0 0 60px rgba(212, 175, 55, 0.15)',
          }}
        />

        {/* 毛玻璃信息浮层 — hover 时从底部滑入 */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-lg bg-black/30 border-t border-white/10 transition-all duration-400 ease-out"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: isHovered ? 1 : 0,
          }}
        >
          <h3 className="text-sm md:text-base font-heading font-bold text-white truncate">
            {album.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-white/60 text-[11px]">
            <span className="flex items-center gap-1">
              <Camera size={11} />
              {album.photoCount} 张
            </span>
            {album.description && (
              <span className="truncate max-w-[120px]">{album.description}</span>
            )}
          </div>
        </div>

        {/* 默认状态：无封面时的标题浮层（始终可见，hover 时隐藏） */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <h3 className="text-sm font-heading font-bold text-white/90 truncate">
            {album.title}
          </h3>
        </div>
      </Link>
    </div>
  )
}

/**
 * 相册非对称网格组件
 */
export default function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
        {albums.map((album, index) => {
          const pattern = GRID_PATTERNS[index % GRID_PATTERNS.length]
          return (
            <AlbumEntry
              key={album.id}
              album={album}
              pattern={pattern}
              index={index}
            />
          )
        })}
      </div>
    </div>
  )
}
