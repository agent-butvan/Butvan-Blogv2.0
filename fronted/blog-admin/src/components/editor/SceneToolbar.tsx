'use client'

import React, { useRef } from 'react'
import { ArrowLeft, MousePointer2, SquareDashed, Upload, Eye, Undo2, Redo2 } from 'lucide-react'
import Link from 'next/link'

/** 编辑器工作模式 */
export type EditorMode = 'select' | 'draw' | 'preview'

/** 场景工具栏 Props */
interface SceneToolbarProps {
  /** 场景标题 */
  sceneTitle: string
  /** 场景 ID */
  sceneId: number
  /** 当前模式 */
  mode: EditorMode
  /** 模式切换回调 */
  onModeChange: (mode: EditorMode) => void
  /** 手动上传物品图回调（传入文件） */
  onUploadManualSprite: (file: File) => void
  /** 是否正在上传 */
  uploading?: boolean
  /** 是否启用智能抠图（框选后自动去背景） */
  smartExtraction?: boolean
  /** 智能抠图开关回调 */
  onSmartExtractionChange?: (enabled: boolean) => void
  /** 撤销回调 */
  onUndo?: () => void
  /** 重做回调 */
  onRedo?: () => void
  /** 是否可撤销 */
  canUndo?: boolean
  /** 是否可重做 */
  canRedo?: boolean
}

/**
 * 场景编辑器工具栏
 *
 * 提供模式切换（选择编辑 / 框选物品）和手动上传入口。
 */
export default function SceneToolbar({
  sceneTitle,
  sceneId,
  mode,
  onModeChange,
  onUploadManualSprite,
  uploading = false,
  smartExtraction = true,
  onSmartExtractionChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: SceneToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** 触发手动上传文件选择 */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /** 处理文件选中 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    onUploadManualSprite(files[0])
    // 清空 input 以便可重复选择同一文件
    e.target.value = ''
  }

  const modeBtnBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-heading transition-all duration-200'

  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
      {/* 左侧：返回 + 场景信息 */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link href="/scenes">
          <button
            className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm w-full sm:w-auto`}
          >
            <ArrowLeft size={14} /> 返回列表
          </button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold font-heading text-zinc-900 dark:text-zinc-50 truncate max-w-[18rem] sm:max-w-none">
            场景物品编辑器
          </h1>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate">
              编辑场景：<span className="text-primary font-bold ml-1">{sceneTitle}</span>
            </span>
            <span className="text-zinc-550 dark:text-zinc-400 font-mono text-xs">
              ID {sceneId}
            </span>
          </p>
        </div>
      </div>

      {/* 右侧：模式切换 + 手动上传 */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        {/* 模式切换组 - 移动端自适应 */}
        <div className="flex items-center rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 gap-0.5 animate-fade-in duration-200 w-full sm:w-auto">
          {/* 选择编辑模式 */}
          <button
            onClick={() => onModeChange('select')}
            className={`${modeBtnBase} border-transparent cursor-pointer flex-1 sm:flex-none justify-center ${
              mode === 'select'
                ? 'bg-white dark:bg-zinc-800 text-primary border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <MousePointer2 size={14} />
            <span className="hidden xs:inline">选择编辑</span>
          </button>

          {/* 框选物品模式 */}
          <button
            onClick={() => onModeChange('draw')}
            className={`${modeBtnBase} border-transparent cursor-pointer flex-1 sm:flex-none justify-center ${
              mode === 'draw'
                ? 'bg-white dark:bg-zinc-800 text-primary border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold animate-draw-pulse'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <SquareDashed size={14} />
            <span className="hidden xs:inline">框选物品</span>
          </button>

          {/* 预览模式 */}
          <button
            onClick={() => onModeChange('preview')}
            className={`${modeBtnBase} border-transparent cursor-pointer flex-1 sm:flex-none justify-center ${
              mode === 'preview'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Eye size={14} />
            <span className="hidden xs:inline">预览</span>
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
            className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed p-1.5 !px-2`}
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
            className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed p-1.5 !px-2`}
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* 智能抠图开关（仅 draw 模式可见） */}
        {mode === 'draw' && onSmartExtractionChange && (
          <button
            onClick={() => onSmartExtractionChange(!smartExtraction)}
            className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 cursor-pointer shadow-sm flex-1 sm:flex-none justify-center ${
              smartExtraction
                ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={smartExtraction ? '已启用 AI 智能抠图' : '已关闭智能抠图，使用矩形裁剪'}
          >
            ✨ <span className="hidden sm:inline">{smartExtraction ? '智能抠图' : '矩形裁剪'}</span>
            <span className="sm:hidden">抠图</span>
          </button>
        )}

        {/* 手动上传物品图 */}
        <input
          type="file"
          accept="image/png"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shadow-sm flex-1 sm:flex-none justify-center`}
        >
          <Upload size={14} />
          {uploading ? '上传中...' : '上传物品图'}
        </button>

      </div>
    </div>
  )
}
