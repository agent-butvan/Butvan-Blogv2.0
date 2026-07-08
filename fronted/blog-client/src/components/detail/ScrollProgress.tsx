'use client'

import React, { useState, useEffect } from 'react'

/**
 * 沉浸式阅读进度条
 * 固定在页面顶部，随滚动进度从左到右填充
 */
export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-[2.5px] bg-[#727BBA] shadow-[0_0_8px_rgba(114,123,186,0.6)] z-50 transition-all duration-75"
      style={{ width: `${scrollProgress}%` }}
    />
  )
}
