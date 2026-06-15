'use client'

import React, { forwardRef } from 'react'
import { Maximize, Move } from 'lucide-react'
import type { EditorMode } from './SceneToolbar'

/** 热区数据（与编辑器页面保持一致） */
export interface HotspotData {
  id?: number
  itemName: string
  itemImageUrl: string
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent?: number
  hoverTips: string
  redirectType: string
  redirectPath: string
  redirectTargetId?: number
  zoomScale: number
  sortOrder: number
  isVisible: boolean
}

/** 绘制中的矩形选区 */
export interface DrawingRect {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

/** 场景画布 Props */
interface SceneCanvasProps {
  /** 背景图完整 URL */
  backgroundImageUrl: string
  /** 已保存的热区列表 */
  hotspots: HotspotData[]
  /** 当前编辑器模式 */
  mode: EditorMode
  /** 当前选中热区 ID */
  activeHotspotId: number | null
  /** 正在绘制的矩形选区 */
  drawingRect: DrawingRect | null
  /** 是否正在绘制中 */
  isDrawing: boolean
  /** 是否正在裁剪上传中 */
  isCropping: boolean
  /** 智能抠图进度（0-100），仅 isExtracting 为 true 时有效 */
  extractionProgress?: number
  /** 是否正在进行智能抠图 */
  isExtracting?: boolean
  /** 画布鼠标按下 */
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 画布鼠标移动 */
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 画布鼠标松开 */
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 选中热区 */
  onHotspotSelect: (hotspot: HotspotData) => void
  /** 开始拖拽热区 */
  onHotspotDragStart: (e: React.MouseEvent<HTMLDivElement>, hotspot: HotspotData) => void
  /** 开始缩放热区 */
  onHotspotResizeStart: (e: React.MouseEvent<HTMLDivElement>, hotspot: HotspotData) => void
  /** 开始拖拽临时选区 */
  onDrawingRectDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 开始缩放临时选区 */
  onDrawingRectResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 确认裁剪选区 */
  onConfirmCrop?: () => void
  /** 取消裁剪选区 */
  onCancelCrop?: () => void
  /** 外部 class */
  className?: string
}

/**
 * 场景可视化画布
 *
 * 支持两种模式：
 * - select：选中 / 拖拽移动 / 拉伸缩放已有热区物品
 * - draw：在背景图上拖拽框选矩形区域，松手触发裁剪
 */
const SceneCanvas = forwardRef<HTMLDivElement, SceneCanvasProps>(
  (
    {
      backgroundImageUrl,
      hotspots,
      mode,
      activeHotspotId,
      drawingRect,
      isDrawing,
      isCropping,
      extractionProgress = 0,
      isExtracting = false,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onHotspotSelect,
      onHotspotDragStart,
      onHotspotResizeStart,
      onDrawingRectDragStart,
      onDrawingRectResizeStart,
      onConfirmCrop,
      onCancelCrop,
      className = '',
    },
    ref
  ) => {
    /** 解析图片 URL */
    const resolveUrl = (url: string) =>
      url.startsWith('/') ? `http://localhost:8080${url}` : url

    /** 绘制矩形的 CSS 样式（支持任意方向拖拽） */
    const getDrawRectStyle = () => {
      if (!drawingRect) return { display: 'none' }
      const left = Math.min(drawingRect.startX, drawingRect.currentX)
      const top = Math.min(drawingRect.startY, drawingRect.currentY)
      const width = Math.abs(drawingRect.currentX - drawingRect.startX)
      const height = Math.abs(drawingRect.currentY - drawingRect.startY)
      return {
        display: 'block',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }
    }

    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {/* 画布提示栏 */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl shadow-xs">
          <span className="text-xs font-heading text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Move size={14} className="text-primary" />
            {mode === 'draw'
              ? '框选模式 — 在场景上拖动鼠标框选物品区域，松开自动裁剪上传'
              : '编辑模式 — 点击物品选中，拖拽移动位置，拖拽右下角拉伸缩放'}
          </span>
          <span
            className={`text-[10px] font-heading px-2 py-0.5 rounded-full border ${
              mode === 'draw'
                ? 'border-primary/40 text-primary bg-primary/5'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40'
            }`}
          >
            {mode === 'draw' ? '🔲 绘制模式' : '🖱 选择模式'}
          </span>
        </div>

        {/* 画布容器 */}
        <div
          ref={ref}
          className={`relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg select-none ${
            mode === 'draw'
              ? 'border-primary/40 ring-1 ring-primary/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {/* Layer 1: 背景图 */}
          <img
            src={backgroundImageUrl}
            alt="Room Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            crossOrigin="anonymous"
          />

          {/* Layer 2: 暗化遮罩 */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Layer 3: 网格辅助线（仅在 draw 模式下显示） */}
          {mode === 'draw' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '5% 5%',
              }}
            />
          )}

          {/* Layer 4: 已保存的热区 */}
          <div className="absolute inset-0 w-full h-full z-10">
            {hotspots.map((hotspot) => {
              if (!hotspot.itemImageUrl) return null
              const isSelected = activeHotspotId === hotspot.id
              const spriteUrl = resolveUrl(hotspot.itemImageUrl)

              return (
                <div
                  key={hotspot.id}
                  className={`absolute transition-all group ${
                    mode === 'draw' ? 'pointer-events-none' : 'cursor-move'
                  } ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/20 ring-2 ring-primary/35 z-30'
                      : 'border border-dashed border-primary/50 bg-primary/5 hover:border-primary/80 hover:bg-primary/10 z-20'
                  }`}
                  style={{
                    left: `${hotspot.xPercent}%`,
                    top: `${hotspot.yPercent}%`,
                    width: `${hotspot.widthPercent}%`,
                    zIndex: isSelected ? 50 : hotspot.sortOrder || 10,
                  }}
                  onMouseDown={(e) => {
                    if (mode === 'draw') return
                    onHotspotDragStart(e, hotspot)
                  }}
                  onClick={(e) => {
                    if (mode === 'draw') return
                    e.stopPropagation()
                    onHotspotSelect(hotspot)
                  }}
                >
                  {/*
                    隐藏图片渲染以解决多余空图遮挡问题，
                    仅利用透明 img 撑开自适应的高度和正确的长宽比例。
                  */}
                  <img
                    src={spriteUrl}
                    alt={hotspot.itemName}
                    className="w-full h-auto object-contain pointer-events-none select-none opacity-0"
                  />

                  {/* 悬浮标签 */}
                  <div className="absolute -top-5 left-0 bg-zinc-950/90 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {hotspot.itemName} ({hotspot.widthPercent}%)
                  </div>

                  {/* 选中态右下角缩放把手 */}
                  {isSelected && mode === 'select' && (
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border border-black rounded-full cursor-se-resize z-50 flex items-center justify-center hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        onHotspotResizeStart(e, hotspot)
                      }}
                    >
                      <Maximize size={10} className="text-black" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Layer 5: 正在绘制的矩形选区 */}
          {mode === 'draw' && drawingRect && (
            <div
              className={`absolute z-40 transition-shadow ${
                isDrawing ? 'pointer-events-none' : 'pointer-events-auto cursor-move shadow-2xl'
              }`}
              style={getDrawRectStyle()}
              onMouseDown={(e) => {
                if (isDrawing) return
                onDrawingRectDragStart?.(e)
              }}
            >
              {/* 蓝色半透明填充 */}
              <div className="absolute inset-0 bg-primary/15 border-2 border-primary rounded-sm" />

              {/* 虚线流动边框效果 */}
              <div className="absolute inset-0 border-2 border-dashed border-primary/70 rounded-sm animate-dash-move" />

              {/* 实时坐标标签 */}
              {isDrawing && (
                <div className="absolute -top-7 left-0 bg-primary px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold border border-primary/30 whitespace-nowrap">
                  {(() => {
                    if (!drawingRect) return null
                    const w = Math.abs(drawingRect.currentX - drawingRect.startX)
                    const h = Math.abs(drawingRect.currentY - drawingRect.startY)
                    return `${Math.round(w)}×${Math.round(h)} px`
                  })()}
                </div>
              )}

              {/* 选中态右下角缩放把手 */}
              {!isDrawing && (
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border border-black rounded-full cursor-se-resize z-50 flex items-center justify-center hover:scale-125 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onDrawingRectResizeStart?.(e)
                  }}
                >
                  <Maximize size={10} className="text-black" />
                </div>
              )}

              {/* 确认与取消微型悬浮工具栏 */}
              {!isDrawing && !isCropping && (
                <div 
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/95 border border-white/10 px-2 py-1.5 rounded-xl shadow-2xl z-50 pointer-events-auto select-none whitespace-nowrap animate-fade-in"
                  onMouseDown={(e) => e.stopPropagation()} // 阻止拖拽冒泡
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onConfirmCrop?.()
                    }}
                    className="px-2.5 py-1 rounded bg-primary hover:bg-primary/90 text-white text-[10px] font-heading font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    确认裁剪 ✂️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancelCrop?.()
                    }}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-heading cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Layer 6: 裁剪上传中遮罩 */}
          {isCropping && (
            <div className="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center gap-3 animate-fade-in">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-white font-heading">
                {isExtracting
                  ? `AI 智能抠图中... ${extractionProgress}%`
                  : '正在裁剪并上传物品图...'}
              </span>
              <span className="text-xs text-neutral-light/50">
                {isExtracting
                  ? 'AI 模型正在分析图像并移除背景'
                  : '从背景中提取选中区域'}
              </span>
              {isExtracting && (
                <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

SceneCanvas.displayName = 'SceneCanvas'
export default SceneCanvas
