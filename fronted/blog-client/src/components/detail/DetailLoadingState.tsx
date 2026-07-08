'use client'

import React from 'react'
import { Spinner } from '@heroui/react'

/**
 * 详情页加载骨架
 * 居中展示 Spinner + 提示文字
 */
export default function DetailLoadingState({ message = '正在加载内容，请稍候...' }: { message?: string }) {
  return (
    <div className="py-36 flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" color="accent" />
      <p className="text-xs font-heading text-zinc-400 dark:text-zinc-600 tracking-wider animate-pulse">
        {message}
      </p>
    </div>
  )
}
