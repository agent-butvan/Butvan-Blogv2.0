'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { AlertCircle } from 'lucide-react'

/**
 * 详情页错误状态展示
 * 居中显示错误图标 + 消息 + 返回按钮
 */
export default function DetailErrorState({
  title = '无法加载内容',
  message = '加载异常，找不到相关内容。',
  backText = '返回列表',
  backPath,
}: {
  title?: string
  message?: string
  backText?: string
  backPath: string
}) {
  const router = useRouter()

  return (
    <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-6">
        {message}
      </p>
      <Button size="sm" onClick={() => router.push(backPath)} className="font-heading rounded-xl px-5 bg-[#727BBA] text-white">
        {backText}
      </Button>
    </div>
  )
}
