'use client'

import React, { forwardRef } from 'react'
import { Maximize, Move } from 'lucide-react'
import type { EditorMode } from './SceneToolbar'
import { resolveAssetUrl } from '@/lib/image-url'
import { toast } from '@/lib/toast'

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
  /** 显示辅助网格 */
  showGrid?: boolean
  /** 网格间距百分比 */
  activeGridSize?: number
  /** 当前拖拽时的吸附线信息 */
  draggedHotspotSnapLines?: { x: number | null; y: number | null }
  /** 画布鼠标按下 */
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 画布鼠标移动 */
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 画布鼠标松开 */
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void
  /** 选中热区 */
  onHotspotSelect: (hotspot: HotspotData) => void
  /** 开始拖拽热区 */
  onHotspotDragStart: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    hotspot: HotspotData
  ) => void
  /** 开始缩放热区 */
  onHotspotResizeStart: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    hotspot: HotspotData
  ) => void
  /** 开始拖拽临时选区 */
  onDrawingRectDragStart?: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void
  /** 开始缩放临时选区 */
  onDrawingRectResizeStart?: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void
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
 * 支持三种模式：
 * - select：选中 / 拖拽移动 / 拉伸缩放已有热区物品
 * - draw：在背景图上拖拽框选矩形区域，松手触发裁剪
 * - preview：预览前台沉浸式发光悬浮动效
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
      showGrid = false,
      activeGridSize = 5,
      draggedHotspotSnapLines = { x: null, y: null },
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
    const resolveUrl = resolveAssetUrl

    // 预览模式下的 hovered 物品状态
    const [hoveredHotspotId, setHoveredHotspotId] = React.useState<number | null>(null)

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
        <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-heading text-zinc-800 dark:text-zinc-200 flex items-start gap-1.5 leading-relaxed">
            <Move size={14} className="text-primary mt-0.5 shrink-0" />
            <span className="hidden sm:inline">
              {mode === 'draw'
                ? '框选模式 — 在场景上拖动鼠标框选物品区域，松开自动裁剪上传'
                : mode === 'preview'
                ? '预览模式 — 移动鼠标悬浮在物品上，或触屏轻点，可预览前台物理悬浮与发光交互'
                : '编辑模式 — 点击物品选中，拖拽移动位置，拖拽右下角拉伸缩放'}
            </span>
            <span className="sm:hidden">
              {mode === 'draw'
                ? '框选模式：拖动鼠标创建物品区域'
                : mode === 'preview'
                ? '预览模式：悬浮或点击物品预览效果'
                : '编辑模式：点击选中并拖拽调整'}
            </span>
          </span>
          <span
            className={`self-start sm:self-auto text-xs font-heading px-2.5 py-0.5 rounded-full border ${
              mode === 'draw'
                ? 'border-primary/40 text-primary bg-primary/5'
                : mode === 'preview'
                ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40'
            }`}
          >
            {mode === 'draw' ? '🔲 绘制模式' : mode === 'preview' ? '👁 预览模式' : '🖱 选择模式'}
          </span>
        </div>

        {/* 画布容器 */}
        <div
          ref={ref}
          className={`relative w-full aspect-video min-h-[320px] lg:min-h-[420px] rounded-2xl overflow-hidden border shadow-lg select-none ${
            mode === 'draw'
              ? 'border-primary/40 ring-1 ring-primary/20'
              : mode === 'preview'
              ? 'border-emerald-500/30 ring-1 ring-emerald-500/10'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
          onMouseDown={mode === 'preview' ? undefined : onMouseDown}
          onMouseMove={mode === 'preview' ? undefined : onMouseMove}
          onMouseUp={mode === 'preview' ? undefined : onMouseUp}
          onTouchStart={mode === 'preview' ? undefined : (e) => {
            if (e.touches.length === 1 && mode === 'draw') {
              // 兼容 touch 绘图坐标转换
              const rect = e.currentTarget.getBoundingClientRect()
              const touch = e.touches[0]
              const mockEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {},
                stopPropagation: () => {},
              } as unknown as React.MouseEvent<HTMLDivElement>
              onMouseDown(mockEvent)
            }
          }}
          onTouchMove={mode === 'preview' ? undefined : (e) => {
            if (e.touches.length === 1 && isDrawing && mode === 'draw') {
              const rect = e.currentTarget.getBoundingClientRect()
              const touch = e.touches[0]
              const mockEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {},
                stopPropagation: () => {},
              } as unknown as React.MouseEvent<HTMLDivElement>
              onMouseMove(mockEvent)
            }
          }}
          onTouchEnd={mode === 'preview' ? undefined : (e) => {
            if (isDrawing && mode === 'draw') {
              const mockEvent = {
                preventDefault: () => {},
                stopPropagation: () => {},
              } as unknown as React.MouseEvent<HTMLDivElement>
              onMouseUp(mockEvent)
            }
          }}
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

          {/* Layer 3: 网格辅助线 */}
          {(mode === 'draw' || (showGrid && mode !== 'preview')) && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20 z-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(114, 123, 186, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(114, 123, 186, 0.2) 1px, transparent 1px)',
                backgroundSize: `${activeGridSize}% ${activeGridSize}%`,
              }}
            />
          )}

          {/* Layer 3.5: 磁吸对齐指示线 */}
          {mode === 'select' && draggedHotspotSnapLines.x !== null && (
            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-red-500/80 z-40 pointer-events-none"
              style={{ left: `${draggedHotspotSnapLines.x}%` }}
            />
          )}
          {mode === 'select' && draggedHotspotSnapLines.y !== null && (
            <div
              className="absolute left-0 right-0 border-t border-dashed border-red-500/80 z-40 pointer-events-none"
              style={{ top: `${draggedHotspotSnapLines.y}%` }}
            />
          )}

          {/* Layer 4: 已保存的热区 */}
          <div className="absolute inset-0 w-full h-full z-10">
            {activeHotspotId && mode !== 'preview' && (
              <div className="absolute left-3 top-3 z-40 rounded-lg bg-zinc-950/85 border border-white/10 px-3 py-1.5 text-[10px] font-mono text-white shadow-lg sm:hidden">
                当前选中: #{activeHotspotId}
              </div>
            )}
            {activeHotspotId && mode !== 'preview' && (
              <div className="absolute right-3 top-3 z-40 rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[10px] font-heading text-primary shadow-lg sm:hidden">
                可拖拽或展开面板继续编辑
              </div>
            )}
            {hotspots.map((hotspot) => {
              if (!hotspot.itemImageUrl) return null
              const isSelected = activeHotspotId === hotspot.id
              const spriteUrl = resolveUrl(hotspot.itemImageUrl)

              if (mode === 'preview') {
                const isHovered = hoveredHotspotId === hotspot.id
                return (
                  <div
                    key={hotspot.id}
                    className="absolute cursor-pointer select-none origin-bottom transition-all duration-[450ms] z-20 hover:z-30 touch-manipulation"
                    style={{
                      left: `${hotspot.xPercent}%`,
                      top: `${hotspot.yPercent}%`,
                      width: `${hotspot.widthPercent}%`,
                      transform: isHovered ? 'scale(1.01)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredHotspotId(hotspot.id ?? null)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                    onTouchStart={() => setHoveredHotspotId(hotspot.id ?? null)}
                    onTouchEnd={() => setTimeout(() => setHoveredHotspotId(null), 1500)}
                    onClick={() => {
                      toast.info(`[交互物品]: ${hotspot.itemName}\n跳转路径: ${hotspot.redirectPath} (类型: ${hotspot.redirectType})`)
                    }}
                  >
                    <div className="relative w-full">
                      <img
                        src={spriteUrl}
                        alt={hotspot.itemName}
                        className="object-contain transition-all duration-[450ms] ease-out pointer-events-none"
                        style={{
                          width: '100%',
                          height: 'auto',
                          opacity: isHovered ? 1 : 0,
                          filter: isHovered
                            ? 'drop-shadow(0 0 15px rgba(114, 123, 186, 0.95)) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.35))'
                            : 'none',
                        }}
                      />
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={hotspot.id}
                  className={`absolute transition-all group touch-manipulation ${
                    mode === 'draw' ? 'pointer-events-none' : 'cursor-move'
                  } ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/25 ring-4 ring-primary/25 z-30 shadow-lg'
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
                  onTouchStart={(e) => {
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
                  <div className="absolute -top-5 left-0 bg-zinc-950/90 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                    {hotspot.itemName} ({hotspot.widthPercent}%)
                  </div>

                  {/* 选中态右下角缩放把手 - 移动端增大点击区域 */}
                  {isSelected && mode === 'select' && (
                    <div
                      className="absolute -bottom-3 -right-3 w-8 h-8 sm:w-3.5 sm:h-3.5 bg-primary border-2 sm:border border-black rounded-full cursor-se-resize z-50 flex items-center justify-center hover:scale-125 transition-transform shadow-md touch-manipulation"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        onHotspotResizeStart(e, hotspot)
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        onHotspotResizeStart(e, hotspot)
                      }}
                    >
                      <Maximize size={10} className="text-black" />
                      {/* 移动端外圈提示 */}
                      <span className="absolute inset-0 rounded-full border-2 border-primary/30 sm:hidden animate-pulse" />
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
              style={{ ...getDrawRectStyle(), minWidth: '24px', minHeight: '24px' }}
              onMouseDown={(e) => {
                if (isDrawing) return
                onDrawingRectDragStart?.(e)
              }}
              onTouchStart={(e) => {
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

              {/* 选中态右下角缩放把手 - 移动端增大点击区域 */}
              {!isDrawing && (
                <div
                  className="absolute -bottom-3 -right-3 w-8 h-8 sm:w-3.5 sm:h-3.5 bg-primary border-2 sm:border border-black rounded-full cursor-se-resize z-50 flex items-center justify-center hover:scale-125 transition-transform shadow-md touch-manipulation"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onDrawingRectResizeStart?.(e)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    onDrawingRectResizeStart?.(e)
                  }}
                >
                  <Maximize size={10} className="text-black" />
                  {/* 移动端外圈提示 */}
                  <span className="absolute inset-0 rounded-full border-2 border-primary/30 sm:hidden animate-pulse" />
                </div>
              )}

              {/* 确认与取消微型悬浮工具栏 */}
              {!isDrawing && !isCropping && (
                <div
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-zinc-950/95 border border-white/10 px-2 py-1.5 rounded-xl shadow-2xl z-50 pointer-events-auto select-none whitespace-nowrap animate-fade-in min-w-[160px]"
                  onMouseDown={(e) => e.stopPropagation()} // 阻止拖拽冒泡
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onConfirmCrop?.()
                    }}
                    className="px-2.5 py-1 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-heading font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors duration-200 shadow-sm min-h-8"
                  >
                    确认裁剪 ✂️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancelCrop?.()
                    }}
                    className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-heading cursor-pointer transition-colors duration-200 min-h-8"
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
