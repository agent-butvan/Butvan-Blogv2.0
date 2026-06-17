'use client'

import React, { useState, useEffect } from 'react'
import MarkdownCodeBlock from './MarkdownCodeBlock'

interface HtmlRendererProps {
  html: string
}

/**
 * 通用 HTML 解析与组件拦截渲染器
 * 
 * 主要解决：
 * 1. 富文本 HTML 字符串的 React 组件化替换（如 pre/code 转 MarkdownCodeBlock）
 * 2. 避免客户端直接使用原生 DOM API 破坏 React 虚拟 DOM 结构
 * 3. 预留极佳的扩展性：如果未来需要拦截 img（做 Lightbox 灯箱大图）、a（拦截外链跳出提示）等，直接在此组件内添加拦截逻辑即可
 * 4. 兼容 SSR（服务端渲染）：首屏直接通过 dangerouslySetInnerHTML 保障 SEO，客户端加载后自动使用 DOMParser 映射为 React 树
 */
export default function HtmlRenderer({ html }: HtmlRendererProps) {
  const [reactContent, setReactContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

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
  }, [html])

  // 未完成客户端解析时（即 SSR/首屏挂载前），回退到原始 HTML 以支持 SEO 和瞬间呈现
  if (!reactContent) {
    return (
      <div 
        className="article-content-prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="article-content-prose max-w-none">
      {reactContent}
    </div>
  )
}
