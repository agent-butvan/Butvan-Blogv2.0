'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  X,
  ExternalLink,
  Download
} from 'lucide-react'

export interface ImagePreviewModalProps {
  isOpen: boolean
  src: string
  alt?: string
  onClose: () => void
}

/**
 * 前台全屏高保真图片放大查看 Modal (Image Lightbox)
 * - 支持 滚轮/按钮 缩放、拖拽平移、顺时针旋转、原图查看与键盘 Esc 快捷键关闭
 * - 沉浸式毛玻璃半透明遮罩背景
 */
export default function ImagePreviewModal({
  isOpen,
  src,
  alt = '',
  onClose,
}: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imgRef = useRef<HTMLImageElement>(null)

  // 当弹窗状态重置时，还原缩放、角度和平移位移
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, src])

  // 键盘 Esc 按键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !src) return null

  // 缩放增减
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5))

  // 旋转 90 度
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  // 重置 100%
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // 鼠标滚轮缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.15, 4))
    } else {
      setScale((prev) => Math.max(prev - 0.15, 0.5))
    }
  }

  // 拖拽平移处理
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/85 backdrop-blur-md select-none animate-fade-in transition-all duration-300"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
    >
      {/* 顶部操作控制栏 */}
      <header className="w-full flex items-center justify-between px-6 py-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
        {/* 左侧说明 */}
        <div className="flex items-center gap-2 text-white/80 text-xs font-mono truncate max-w-sm">
          <span className="truncate">{alt || '图片预览'}</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* 中间/右侧功能操作按钮 */}
        <div className="flex items-center gap-2 bg-white/10 dark:bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="放大图片"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="缩小图片"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="顺时针旋转 90°"
          >
            <RotateCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="重置比例"
          >
            <RefreshCw size={15} />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="查看原图"
          >
            <ExternalLink size={15} />
          </a>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-rose-500/80 transition-all cursor-pointer"
            title="关闭预览 (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 主体图片呈现区（点击空白关闭） */}
      <div
        className="flex-1 w-full flex items-center justify-center relative overflow-hidden p-6 cursor-zoom-out"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-out',
          }}
          className="max-h-[85vh] max-w-[90vw] object-contain drop-shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* 底部快捷提示 */}
      <footer className="py-3 text-[11px] font-mono text-white/40 z-10 select-none">
        按 Esc 退出 | 滚轮可缩放 | 放大后可鼠标拖拽位移
      </footer>
    </div>
  )
}
