'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import MarkdownCodeBlock from './MarkdownCodeBlock'
import ImagePreviewModal from './ImagePreviewModal'
import { resolveImageUrl } from '@/lib/image-url'

interface HtmlRendererProps {
  html: string
  proseClass?: string
}

// 基础 Markdown 解析配置
marked.setOptions({
  gfm: true,
  breaks: true
})

/**
 * 通用 HTML 解析与组件拦截渲染器
 * 
 * 机制：
 * 1. 同步使用 marked 将输入的 Markdown 源文本转换为标准 HTML 富文本。
 * 2. 客户端结合事件代理 handleContainerClick 处理图片点击放大预览，确保 SSR/Hydration 无闪烁且 100% 支持所有图片。
 * 3. 完美整合 resolveImageUrl，解决相对路径图片 404 与图片代理问题。
 */
export default function HtmlRenderer({ html, proseClass = 'article-content-prose' }: HtmlRendererProps) {
  const [reactContent, setReactContent] = useState<React.ReactNode>(null)
  const [previewImage, setPreviewImage] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: '',
  })

  // 同步将 Markdown / 原始 HTML 转换为标准的 HTML 富文本
  const cleanHtml = React.useMemo(() => {
    const rawContent = html ?? ''
    try {
      return marked.parse(rawContent) as string
    } catch (e) {
      console.error('marked.parse error:', e)
      return rawContent
    }
  }, [html])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanHtml, 'text/html')

    const convertNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        // 拦截 <pre><code> 进行 React 代码高亮接管
        if (tagName === 'pre') {
          const codeEl = element.querySelector('code')
          if (codeEl) {
            const codeText = codeEl.textContent || ''
            let lang = 'text'
            const classList = Array.from(codeEl.classList)
            const langClass = classList.find(c => c.startsWith('language-'))
            if (langClass) {
              lang = langClass.replace('language-', '')
            }
            return (
              <MarkdownCodeBlock 
                key={`code-block-${index}`} 
                text={codeText} 
                lang={lang} 
              />
            )
          }
        }

        // 构建常规元素的属性映射
        const props: Record<string, any> = {
          key: `${tagName}-${index}`
        }

        if (element.hasAttribute('class')) {
          props.className = element.getAttribute('class')
        }

        // 如果是 img 标签，解析正确路径并附加手势 Cursor
        if (tagName === 'img') {
          const rawSrc = element.getAttribute('src') || ''
          const resolvedSrc = resolveImageUrl(rawSrc)
          props.src = resolvedSrc
          props.className = `${element.getAttribute('class') || ''} cursor-zoom-in hover:opacity-95 transition-all duration-200`
        }

        // 如果是 iframe 网页嵌入标签，解析正确绝对路径并配置无阴影、带明确 HTML 预览区标识边框的组件卡片
        if (tagName === 'iframe') {
          const rawSrc = element.getAttribute('src') || ''
          const resolvedSrc = resolveImageUrl(rawSrc)
          const rawTitle = element.getAttribute('title') || element.getAttribute('name')
          let cleanTitle = 'HTML 页面预览'
          if (rawTitle && rawTitle !== '嵌入 HTML 页面') {
            cleanTitle = rawTitle
          } else if (rawSrc) {
            const filename = rawSrc.split('/').pop() || ''
            cleanTitle = filename.replace(/\.(html|htm)$/i, '') || 'HTML 页面预览'
          }

          return (
            <div 
              key={`iframe-card-${index}`} 
              className="my-6 not-prose rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden transition-all duration-200"
            >
              {/* 顶部 HTML 预览区专属标识与交互 Bar */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 text-xs select-none">
                {/* 左侧：Mac 窗体点缀 + 页面文件名 */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 font-mono text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="truncate max-w-[240px] sm:max-w-[360px]">{cleanTitle}</span>
                  </div>
                </div>

                {/* 右侧：HTML 预览区标识 Tag */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                    HTML 页面预览区
                  </span>
                  {resolvedSrc && (
                    <a
                      href={resolvedSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="在新标签页独立打开预览"
                      className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* iframe 真正嵌入区 */}
              <iframe
                src={resolvedSrc}
                title={cleanTitle}
                className="w-full min-h-[460px] border-none bg-white block"
                allowFullScreen
              />
            </div>
          )
        }

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          if (attr.name === 'class') continue
          if ((attr.name === 'src' && tagName === 'img') || (attr.name === 'src' && tagName === 'iframe')) continue // 避免重复处理
          if (attr.name.startsWith('on')) continue

          // 转换 React 专属 CamelCase 驼峰属性
          let reactAttrName = attr.name
          if (attr.name === 'colspan') reactAttrName = 'colSpan'
          if (attr.name === 'rowspan') reactAttrName = 'rowSpan'
          if (attr.name === 'autocomplete') reactAttrName = 'autoComplete'
          if (attr.name === 'allowfullscreen') reactAttrName = 'allowFullScreen'
          if (attr.name === 'frameborder') reactAttrName = 'frameBorder'

          // 对原生 style 字符串属性转为 React 对象格式
          if (attr.name === 'style') {
            const styleObj: Record<string, string> = {}
            attr.value.split(';').forEach(rule => {
              const [k, v] = rule.split(':')
              if (k && v) {
                const camelKey = k.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                styleObj[camelKey] = v.trim()
              }
            })
            props.style = styleObj
            continue
          }

          props[reactAttrName] = attr.value
        }

        const children = Array.from(element.childNodes).map((child, childIdx) =>
          convertNode(child, childIdx)
        )

        return React.createElement(
          tagName,
          props,
          children.length > 0 ? children : null
        )
      }

      return null
    }

    const childNodes = Array.from(doc.body.childNodes)
    const elements = childNodes.map((node, idx) => convertNode(node, idx))
    
    setReactContent(<React.Fragment>{elements}</React.Fragment>)
  }, [cleanHtml])

  /**
   * 全局事件代理：拦截正文容器内所有图片点击并调起 Lightbox
   */
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target && target.tagName.toLowerCase() === 'img') {
      const imgEl = target as HTMLImageElement
      const rawSrc = imgEl.getAttribute('src') || imgEl.currentSrc || imgEl.src
      const resolvedSrc = resolveImageUrl(rawSrc)
      const alt = imgEl.alt || ''
      if (resolvedSrc) {
        setPreviewImage({
          isOpen: true,
          src: resolvedSrc,
          alt,
        })
      }
    }
  }, [])

  return (
    <>
      <div
        className={`${proseClass} max-w-none`}
        onClick={handleContainerClick}
      >
        {!reactContent ? (
          <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
        ) : (
          reactContent
        )}
      </div>

      {/* 图片全屏 Lightbox 查看器 */}
      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        src={previewImage.src}
        alt={previewImage.alt}
        onClose={() => setPreviewImage({ isOpen: false, src: '', alt: '' })}
      />
    </>
  )
}

