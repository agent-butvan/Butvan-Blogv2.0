'use client'

import React, { useEffect, useCallback, useState } from 'react'
import type { AlbumPhoto } from '@/types/album'
import { resolveImageUrl } from '@/lib/image-url'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoLightboxProps {
  photos: AlbumPhoto[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

/**
 * 照片灯箱组件
 *
 * 交互动效：
 * - 点击照片 → 从中心弹性展开（spring-like cubic-bezier）
 * - 遮罩：暗色毛玻璃背景
 * - 键盘 ← → 切换、Esc 关闭
 * - 点击遮罩区域关闭
 *
 * 使用原生 img 而非 next/image 以支持弹性动画
 */
export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const [animating, setAnimating] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  const photo = photos[currentIndex]
  const imageUrl = photo ? resolveImageUrl(photo.fileUrl) : ''

  // 键盘事件
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1)
          break
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
          break
      }
    },
    [currentIndex, photos.length, onClose, onNavigate],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // 入场动画
    const timer = setTimeout(() => setAnimating(false), 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      clearTimeout(timer)
    }
  }, [handleKeyDown])

  // 切换照片时重置加载状态
  useEffect(() => {
    setImgLoaded(false)
  }, [currentIndex])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* 暗色毛玻璃遮罩 */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        style={{
          opacity: animating ? 0 : 1,
          transition: 'opacity 400ms ease-out',
        }}
      />

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        aria-label="关闭灯箱"
      >
        <X size={18} />
      </button>

      {/* 左箭头 */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
          className="absolute left-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="上一张"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* 右箭头 */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
          className="absolute right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="下一张"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* 照片主体 — 弹性缩放动画 */}
      <div
        className="relative z-10 max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        style={{
          transform: animating ? 'scale(0.85)' : 'scale(1)',
          opacity: animating ? 0 : 1,
          transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out',
        }}
      >
        {/* 图片容器 */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          {/* 加载占位 */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-xl" />
          )}

          <img
            src={imageUrl}
            alt={photo.caption || photo.fileName}
            className="max-w-[85vw] max-h-[80vh] object-contain rounded-xl select-none"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 300ms ease-out' }}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />
        </div>

        {/* 说明文字 */}
        {photo.caption && (
          <div className="mt-3 px-4 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-sm text-white/90 font-body">{photo.caption}</span>
          </div>
        )}

        {/* 页码指示器 */}
        <div className="mt-3 flex items-center gap-1.5">
          {photos.length > 1 &&
            photos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); onNavigate(idx) }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`第 ${idx + 1} 张`}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
