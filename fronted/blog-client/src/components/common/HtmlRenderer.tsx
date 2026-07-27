'use client'

import React, { useState, useEffect } from 'react'
import { marked } from 'marked'
import MarkdownCodeBlock from './MarkdownCodeBlock'
import ImagePreviewModal from './ImagePreviewModal'

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
 * 2. 在 SSR（服务端渲染）和首屏渲染期间，直接通过 dangerouslySetInnerHTML 输出标准的 HTML。
 * 3. 客户端激活（useClient）后，使用 DOMParser 递归解析 HTML 树并构建 React Virtual DOM 树。
 * 4. 拦截 <pre><code> 及 <img> 节点，提供代码高亮与图片点击全屏放大预览 lightbox。
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

    /**
     * 递归转换 DOM 节点为 React 元素
     */
    const convertNode = (node: Node, index: number): React.ReactNode => {
      // 1. 处理文本节点
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
      }

      // 2. 处理元素节点
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        // 【核心拦截 1】：如果是代码块 pre 标签且内含 code
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

        // 【核心拦截 2】：如果是 img 标签，支持点击调起高保真 Lightbox 大图预览
        if (tagName === 'img') {
          const src = element.getAttribute('src') || ''
          const alt = element.getAttribute('alt') || ''
          const originalClass = element.getAttribute('class') || ''
          return (
            <img
              key={`img-${index}`}
              src={src}
              alt={alt}
              className={`${originalClass} cursor-zoom-in transition-all duration-200 hover:opacity-95 hover:scale-[1.005]`}
              onClick={() => setPreviewImage({ isOpen: true, src, alt })}
            />
          )
        }

        // 构建常规元素的属性映射
        const props: Record<string, any> = {
          key: `${tagName}-${index}`
        }

        if (element.hasAttribute('class')) {
          props.className = element.getAttribute('class')
        }

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          if (attr.name === 'class') continue
          if (attr.name.startsWith('on')) continue

          let reactAttrName = attr.name
          if (attr.name === 'colspan') reactAttrName = 'colSpan'
          if (attr.name === 'rowspan') reactAttrName = 'rowSpan'
          if (attr.name === 'autocomplete') reactAttrName = 'autoComplete'

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

  return (
    <>
      {!reactContent ? (
        <div 
          className={`${proseClass} max-w-none`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      ) : (
        <div className={`${proseClass} max-w-none`}>
          {reactContent}
        </div>
      )}

      {/* 点击图片全屏 Lightbox 查看器 */}
      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        src={previewImage.src}
        alt={previewImage.alt}
        onClose={() => setPreviewImage({ isOpen: false, src: '', alt: '' })}
      />
    </>
  )
}

