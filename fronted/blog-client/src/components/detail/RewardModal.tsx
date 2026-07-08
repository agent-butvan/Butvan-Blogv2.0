'use client'

import React from 'react'
import { X, Lock } from 'lucide-react'

/**
 * 赞赏弹窗模态框
 * 居中覆盖层，展示扫码赞赏区域（演示占位）
 */
export default function RewardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl w-full max-w-sm p-6 relative flex flex-col items-center gap-5 shadow-xl select-none mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
        <div className="flex flex-col items-center text-center mt-2">
          <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white mb-1">给作者来杯咖啡</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic">您的鼓励是最好的赞赏</p>
        </div>

        {/* 模拟收款码区 */}
        <div className="relative w-36 h-36 border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-zinc-350 dark:text-zinc-650 text-[10px] font-mono p-3 text-center select-none">
            <Lock size={16} />
            <span>[ 演示扫码区 ]</span>
            <span className="scale-75 select-none opacity-80">支持微信/支付宝</span>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-serif text-center max-w-[240px]">
          感谢您的赞同与支持。本博客以知识共享、无广告为初衷，坚持创作高水准内容。
        </p>
      </div>
    </div>
  )
}
