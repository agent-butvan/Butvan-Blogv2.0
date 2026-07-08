'use client'

import React from 'react'

/**
 * 版权声明卡片
 * 展示作者、文章链接、CC 许可协议
 */
export default function Copyright({ authorName = '可梵' }: { authorName?: string }) {
  return (
    <div className="mt-10 p-5 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-150/20 dark:bg-zinc-900/25 flex flex-col gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-serif leading-relaxed select-none">
      <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-[#727BBA]" />
        <span>关于版权</span>
      </div>
      <p>作者：<strong>{authorName}</strong></p>
      <p>本文链接：<span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 underline select-all break-all">{typeof window !== 'undefined' ? window.location.href : ''}</span></p>
      <p>版权声明：本博客所有内容除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-[#727BBA] underline font-bold">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源。</p>
    </div>
  )
}
