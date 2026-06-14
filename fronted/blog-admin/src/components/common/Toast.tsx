'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { toast } from '@/lib/toast'
import type { ToastItem, ToastType } from '@/lib/toast'

/**
 * 全局 Toast 容器组件
 * 应该在全局根 Providers 或 Layout 中挂载一次
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    // 订阅 toast manager 事件
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast])

      // 自动移除
      const duration = newToast.duration ?? 3000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, duration)
    })

    return () => unsubscribe()
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-55 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onClose={() => removeToast(item.id)} />
      ))}
    </div>
  )
}

interface ToastCardProps {
  item: ToastItem
  onClose: () => void
}

function ToastCard({ item, onClose }: ToastCardProps) {
  const { message, type } = item

  // 图标及配色配置
  const configs: Record<
    ToastType,
    {
      icon: React.ReactNode
      border: string
      bg: string
      text: string
    }
  > = {
    success: {
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      border: 'border-emerald-500/20 dark:border-emerald-500/10',
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/20',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
    error: {
      icon: <XCircle size={16} className="text-red-500" />,
      border: 'border-red-500/20 dark:border-red-500/10',
      bg: 'bg-red-50/90 dark:bg-red-950/20',
      text: 'text-red-900 dark:text-red-300',
    },
    warning: {
      icon: <AlertCircle size={16} className="text-amber-500" />,
      border: 'border-amber-500/20 dark:border-amber-500/10',
      bg: 'bg-amber-50/90 dark:bg-amber-950/20',
      text: 'text-amber-900 dark:text-amber-300',
    },
    info: {
      icon: <Info size={16} className="text-primary" />,
      border: 'border-primary/20 dark:border-primary/10',
      bg: 'bg-zinc-50/90 dark:bg-zinc-900/60',
      text: 'text-zinc-900 dark:text-zinc-100',
    },
  }

  const currentConfig = configs[type] || configs.info

  return (
    <div
      className={`flex items-center justify-between border ${currentConfig.border} ${currentConfig.bg} backdrop-blur-md px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-fade-in transition-all select-none`}
      style={{
        animation: 'fadeIn 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0">{currentConfig.icon}</span>
        <span className={`text-xs font-medium ${currentConfig.text} font-body leading-tight text-left`}>
          {message}
        </span>
      </div>
      <button
        onClick={onClose}
        className="ml-3 shrink-0 p-0.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  )
}
