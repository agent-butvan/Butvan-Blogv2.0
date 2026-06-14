'use client'

import React, { useRef } from 'react'
import { ArrowLeft, MousePointer2, SquareDashed, Upload } from 'lucide-react'
import Link from 'next/link'

/** 编辑器工作模式 */
export type EditorMode = 'select' | 'draw'

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
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 flex-wrap gap-3">
      {/* 左侧：返回 + 场景信息 */}
      <div className="flex items-center gap-3">
        <Link href="/scenes">
          <button
            className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm`}
          >
            <ArrowLeft size={14} /> 返回列表
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold font-heading text-zinc-900 dark:text-zinc-50">
            场景物品编辑器
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            编辑场景：
            <span className="text-primary font-bold ml-1">{sceneTitle}</span>
            <span className="text-zinc-400 dark:text-zinc-500 ml-2 font-mono text-[11px]">
              ID {sceneId}
            </span>
          </p>
        </div>
      </div>

      {/* 右侧：模式切换 + 手动上传 */}
      <div className="flex items-center gap-2">
        {/* 模式切换组 */}
        <div className="flex items-center rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 gap-0.5">
          {/* 选择编辑模式 */}
          <button
            onClick={() => onModeChange('select')}
            className={`${modeBtnBase} border-transparent cursor-pointer ${
              mode === 'select'
                ? 'bg-white dark:bg-zinc-800 text-primary border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <MousePointer2 size={14} />
            选择编辑
          </button>

          {/* 框选物品模式 */}
          <button
            onClick={() => onModeChange('draw')}
            className={`${modeBtnBase} border-transparent cursor-pointer ${
              mode === 'draw'
                ? 'bg-white dark:bg-zinc-800 text-primary border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold animate-draw-pulse'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <SquareDashed size={14} />
            框选物品
          </button>
        </div>

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
          className={`${modeBtnBase} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shadow-sm`}
        >
          <Upload size={14} />
          {uploading ? '上传中...' : '上传物品图'}
        </button>
      </div>
    </div>
  )
}
