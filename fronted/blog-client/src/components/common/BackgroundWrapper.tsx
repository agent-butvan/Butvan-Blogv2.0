'use client'

import { useEffect, useState } from 'react'
import { fetchSiteConfig } from '@/lib/profile'

/**
 * 站点全局背景图片包装组件
 *
 * 从后端获取 background_image_url 配置，若存在则作为
 * 全局 body 背景图渲染，否则不展示背景。
 * 作为客户端组件嵌入 layout.tsx 以保持 metadata 可用。
 */
export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const [bgUrl, setBgUrl] = useState<string>('')
  const [fetchFailed, setFetchFailed] = useState(false)

  useEffect(() => {
    fetchSiteConfig('background_image_url')
      .then((url) => {
        if (url) {
          console.log('[背景图] 已获取配置 →', url)
          setBgUrl(url)
        } else {
          console.log('[背景图] 配置为空，不渲染背景')
        }
      })
      .catch((err) => {
        console.warn('[背景图] 获取配置异常:', err)
        setFetchFailed(true)
      })
  }, [])

  useEffect(() => {
    if (bgUrl) {
      // 设置 body 背景样式
      document.body.style.backgroundImage = `url(${bgUrl})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundRepeat = 'no-repeat'
    }

    return () => {
      // 清理背景样式
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundAttachment = ''
      document.body.style.backgroundRepeat = ''
    }
  }, [bgUrl])

  return (
    <>
      {/* 磨砂纹理层 — SVG 胶片颗粒叠加，4% 透明度营造哑光质感，背景图清晰可见 */}
      {bgUrl && <div aria-hidden="true" className="bg-grain" />}
      {children}
    </>
  )
}
