'use client'

import React, { useState, useEffect } from 'react'
import { X, QrCode } from 'lucide-react'
import { resolveImageUrl } from '@/lib/image-url'
import { fetchProfile } from '@/lib/profile'

interface RewardModalProps {
  open: boolean
  onClose: () => void
  rewardCodeUrl?: string
}

/**
 * 赞赏弹窗模态框
 * 居中覆盖层，动态展示作者后台配置的赞赏/收款二维码图片
 */
export default function RewardModal({ open, onClose, rewardCodeUrl: propRewardCodeUrl }: RewardModalProps) {
  const [rewardCodeUrl, setRewardCodeUrl] = useState<string | undefined>(propRewardCodeUrl)

  useEffect(() => {
    if (propRewardCodeUrl) {
      setRewardCodeUrl(propRewardCodeUrl)
    } else if (open) {
      fetchProfile('butvan').then((data) => {
        if (data?.socialLinks?.rewardCodeUrl) {
          setRewardCodeUrl(data.socialLinks.rewardCodeUrl as string)
        }
      })
    }
  }, [open, propRewardCodeUrl])

  if (!open) return null

  const resolvedCodeUrl = rewardCodeUrl ? resolveImageUrl(rewardCodeUrl) : ''

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

        {/* 赞赏/收款码核心展示区 */}
        <div className="relative w-48 h-48 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden p-2 shadow-inner">
          {resolvedCodeUrl ? (
            <img
              src={resolvedCodeUrl}
              alt="作者赞赏收款码"
              className="w-full h-full object-contain rounded-xl transition-all duration-300 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs font-sans p-3 text-center select-none">
              <QrCode size={28} className="text-zinc-300 dark:text-zinc-700 mb-1" />
              <span>暂未设置赞赏收款码</span>
              <span className="text-[10px] text-zinc-400 select-none opacity-80">请前往后台个人中心进行配置</span>
            </div>
          )}
        </div>

        <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-serif text-center max-w-[240px]">
          感谢您的赞同与支持。本博客以知识共享、无广告为初衷，坚持创作高水准内容。
        </p>
      </div>
    </div>
  )
}
