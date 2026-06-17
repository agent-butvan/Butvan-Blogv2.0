'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import hljs from 'highlight.js'

interface MarkdownCodeBlockProps {
  text: string
  lang?: string
}

/**
 * 通用定制化 Markdown 代码块组件
 * 
 * 功能点：
 * 1. 仿 macOS 经典红黄绿三色控制圆点
 * 2. 自动检测语言并展示大写语言标示
 * 3. 复制代码到剪贴板，支持微交互对勾变化与提示
 * 4. 自动集成 highlight.js 高亮，亮暗色主题自适应
 * 5. 代码行数大于 10 行时，支持平滑折叠/展开，带底边淡出渐变蒙版
 */
export default function MarkdownCodeBlock({ text, lang = '' }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [maxHeight, setMaxHeight] = useState<string>('none')
  const bodyRef = useRef<HTMLDivElement>(null)

  // 处理语言标示
  const rawLang = (lang || '').trim()
  const displayLang = rawLang ? rawLang.toUpperCase() : 'TEXT'

  // 计算行数
  const lines = text.endsWith('\n') 
    ? text.split('\n').length - 1 
    : text.split('\n').length
  const isCollapsible = lines > 10

  // 语法高亮
  const highlightedHtml = React.useMemo(() => {
    const codeContent = text ?? ''
    try {
      if (rawLang && hljs.getLanguage(rawLang)) {
        return hljs.highlight(codeContent, { language: rawLang }).value
      }
      return hljs.highlightAuto(codeContent).value
    } catch (e) {
      console.warn('highlight.js highlight failed:', e)
      // 回退至转义过的纯文本
      return codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }
  }, [text, rawLang])

  // 当折叠/展开状态改变或行数变化时，计算 maxHeight
  useEffect(() => {
    if (isCollapsible) {
      if (expanded) {
        setMaxHeight(`${bodyRef.current?.scrollHeight || 500}px`)
      } else {
        setMaxHeight('280px') // 收起状态固定为 280px
      }
    } else {
      setMaxHeight('none')
    }
  }, [expanded, text, isCollapsible])

  // 复制代码方法
  const handleCopy = async () => {
    const value = text ?? ''
    if (!value) return

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        // 降级使用 textarea 复制
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.setAttribute('readonly', 'true')
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!success) throw new Error('execCommand copy failed')
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code block content:', err)
    }
  }

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="md-codeblock font-mono my-6 overflow-hidden rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 shadow-sm relative group/code">
      {/* macOS 头部栏 */}
      <div className="md-codeblock__header flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/60 px-4 py-2 text-[10px] uppercase tracking-wider select-none bg-zinc-100/50 dark:bg-zinc-900/60">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        
        {/* 语言标识 */}
        <span className="md-codeblock__lang font-bold text-zinc-400 dark:text-zinc-500">{displayLang}</span>
        
        {/* 复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer border-0 outline-none"
          aria-label={copied ? '已复制' : '复制代码'}
          title={copied ? '已复制' : '复制代码'}
        >
          {copied ? (
            <Check size={13} className="text-emerald-500 dark:text-emerald-400 animate-[scaleIn_0.15s_ease-out]" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {/* 代码正文区域 */}
      <div 
        ref={bodyRef}
        style={{ maxHeight }}
        className={`md-codeblock__body transition-[max-height] duration-350 ease-in-out overflow-hidden relative`}
      >
        <pre className="m-0 overflow-x-auto bg-transparent px-5 py-4 text-[13px] leading-relaxed hljs">
          <code 
            className={`language-${rawLang} bg-transparent`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>

        {/* 渐变遮罩 (仅在折叠时显示) */}
        {isCollapsible && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-50/90 dark:from-zinc-900/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* 展开/收起 控制栏 */}
      {isCollapsible && (
        <div className="flex justify-center border-t border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-900/20 py-2">
          <button
            type="button"
            onClick={toggleExpand}
            className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-bold tracking-wider uppercase text-zinc-500 hover:text-[#727BBA] dark:text-zinc-400 dark:hover:text-[#727BBA] transition-colors cursor-pointer outline-none border-0"
          >
            {expanded ? (
              <>
                <span>收起代码</span>
                <ChevronUp size={12} />
              </>
            ) : (
              <>
                <span>展开代码 ({lines} 行)</span>
                <ChevronDown size={12} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
