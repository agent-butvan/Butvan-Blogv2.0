'use client'

import React, { useState, useEffect } from 'react'
import { marked } from 'marked'
import MarkdownCodeBlock from './MarkdownCodeBlock'

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
 * 2. 在 SSR（服务端渲染）和首屏渲染期间，直接通过 dangerouslySetInnerHTML 输出标准的 HTML，这保证了极速的首屏视觉体验，并使得标题、段落、引用、列表等获得 globals.css 对应的 article-content-prose 样式。
 * 3. 客户端激活（useClient）后，使用浏览器的 DOMParser 递归解析 HTML 树并构建 React Virtual DOM 树。
 * 4. 在递归过程中精准拦截 <pre><code> 节点，由定制好的 React 组件 MarkdownCodeBlock 来接管，从而不破坏 React 本身的生命周期与组件状态。
 */
export default function HtmlRenderer({ html, proseClass = 'article-content-prose' }: HtmlRendererProps) {
  const [reactContent, setReactContent] = useState<React.ReactNode>(null)

  // 同步将 Markdown / 原始 HTML 转换为标准的 HTML 富文本，保证 SSR & 客户端输入一致
  const cleanHtml = React.useMemo(() => {
    const rawContent = html ?? ''
    try {
      // 如果已经是 Markdown 或者混杂的 HTML，先使用 marked 解析成标准 HTML
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

        // 【核心拦截点】：如果是代码块 pre 标签且内含 code
        if (tagName === 'pre') {
          const codeEl = element.querySelector('code')
          if (codeEl) {
            const codeText = codeEl.textContent || ''
            
            // 提取语言 class
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

        // 处理 class 属性
        if (element.hasAttribute('class')) {
          props.className = element.getAttribute('class')
        }

        // 处理其他普通属性，跳过安全隐患属性（如 onclick 等事件）
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          if (attr.name === 'class') continue
          if (attr.name.startsWith('on')) continue // 忽略原生事件绑定

          // 属性转换（React 驼峰格式）
          let reactAttrName = attr.name
          if (attr.name === 'colspan') reactAttrName = 'colSpan'
          if (attr.name === 'rowspan') reactAttrName = 'rowSpan'
          if (attr.name === 'autocomplete') reactAttrName = 'autoComplete'

          props[reactAttrName] = attr.value
        }

        // 递归转换所有子节点
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

    // 从 body 解析出第一层节点列表进行递归转换
    const childNodes = Array.from(doc.body.childNodes)
    const elements = childNodes.map((node, idx) => convertNode(node, idx))
    
    setReactContent(<React.Fragment>{elements}</React.Fragment>)
  }, [cleanHtml])

  // 未完成客户端激活时，回退到原始 HTML 以支持 SEO 和瞬间呈现（带 globals.css 正文排版）
  if (!reactContent) {
    return (
      <div 
        className={`${proseClass} max-w-none`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    )
  }

  return (
    <div className={`${proseClass} max-w-none`}>
      {reactContent}
    </div>
  )
}

