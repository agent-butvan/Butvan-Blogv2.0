'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Chip } from '@heroui/react'
import { BookOpen, Laptop, Coffee, ArrowLeft, Terminal, User, FileText } from 'lucide-react'

// Define the hotspot type
interface Hotspot {
  id: number
  itemName: string
  x: number // percentage
  y: number // percentage
  w: number // percentage
  h: number // percentage
  hoverTips: string
  redirectPath: string
  zoomScale: number
  icon: React.ReactNode
}

export default function HomePage() {
  // Static hotspots list for v0.1 static demo
  const staticHotspots: Hotspot[] = [
    {
      id: 1,
      itemName: '电脑桌/工作台',
      x: 41.0,
      y: 33.0,
      w: 18.0,
      h: 18.0,
      hoverTips: '来看看我写的开源项目和代码吗？',
      redirectPath: 'projects',
      zoomScale: 3.5,
      icon: <Laptop className="w-4 h-4 text-primary" />
    },
    {
      id: 2,
      itemName: '书架',
      x: 21.0,
      y: 10.0,
      w: 14.0,
      h: 40.0,
      hoverTips: '翻一翻我的技术博客与读书笔记',
      redirectPath: 'blog',
      zoomScale: 3.0,
      icon: <BookOpen className="w-4 h-4 text-primary" />
    },
    {
      id: 3,
      itemName: '咖啡杯',
      x: 58.0,
      y: 53.0,
      w: 5.0,
      h: 9.0,
      hoverTips: '聊聊关于我、我的故事和咖啡',
      redirectPath: 'about',
      zoomScale: 4.2,
      icon: <Coffee className="w-4 h-4 text-primary" />
    }
  ]

  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [zoomState, setZoomState] = useState({
    active: false,
    x: 50,
    y: 50,
    scale: 1
  })
  const [showTargetPage, setShowTargetPage] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse coordinates for tooltip positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  // Handle click on hotspot
  const handleHotspotClick = (hotspot: Hotspot) => {
    if (zoomState.active) return
    setActiveHotspot(hotspot)
    
    // Calculate center coordinates of hotspot for zooming
    const centerX = hotspot.x + hotspot.w / 2
    const centerY = hotspot.y + hotspot.h / 2

    // Trigger zoom-in
    setZoomState({
      active: true,
      x: centerX,
      y: centerY,
      scale: hotspot.zoomScale
    })

    // After animation, show content
    setTimeout(() => {
      setShowTargetPage(hotspot.redirectPath)
    }, 850)
  }

  // Go back to the room
  const handleBackToRoom = () => {
    setShowTargetPage(null)
    setActiveHotspot(null)
    
    // Zoom back out
    setZoomState({
      active: false,
      x: 50,
      y: 50,
      scale: 1
    })
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-dark flex items-center justify-center font-body selection:bg-primary/30">
      
      {/* 1. ROOM VIEW CONTAINER */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-[850ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
          transform: `scale(${zoomState.scale})`,
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center"
             style={{ backgroundImage: `url('/fWdgJuAOF.jpeg')` }}
        />

        {/* Ambient Dark Overlay to make it premium */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Responsive Hotspots SVG Overlay */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full z-10 select-none pointer-events-auto"
        >
          {staticHotspots.map((hotspot) => {
            const isHovered = hoveredHotspot?.id === hotspot.id
            const isActive = activeHotspot?.id === hotspot.id
            return (
              <g key={hotspot.id} className="cursor-pointer">
                {/* Visual Area Highlight */}
                <rect
                  x={hotspot.x}
                  y={hotspot.y}
                  width={hotspot.w}
                  height={hotspot.h}
                  fill={isHovered ? 'rgba(114, 123, 186, 0.15)' : 'rgba(0, 0, 0, 0)'}
                  stroke={isHovered || isActive ? '#727BBA' : 'rgba(255, 255, 255, 0.1)'}
                  strokeWidth={isHovered || isActive ? '0.35' : '0.15'}
                  strokeDasharray={isHovered ? 'none' : '1, 1'}
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(114, 123, 186, 0.8))' : 'none'
                  }}
                  onMouseEnter={() => setHoveredHotspot(hotspot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onClick={() => handleHotspotClick(hotspot)}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* 2. PREMIUM GLASSMORPHISM TOOLTIP (Follows mouse cursor when hovering a hotspot) */}
      {hoveredHotspot && !zoomState.active && (
        <div 
          className="fixed z-50 pointer-events-none transition-all duration-150 ease-out select-none flex flex-col items-center gap-1.5"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 75}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-neutral-light/75 dark:bg-neutral-dark/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2 max-w-[280px]">
            {hoveredHotspot.icon}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-primary font-heading">{hoveredHotspot.itemName}</span>
              <span className="text-[11px] text-neutral-dark/80 dark:text-neutral-light/80 mt-0.5">{hoveredHotspot.hoverTips}</span>
            </div>
          </div>
          {/* Arrow */}
          <div className="w-2.5 h-2.5 bg-neutral-light/75 dark:bg-neutral-dark/85 backdrop-blur-md border-r border-b border-white/20 rotate-45 -mt-1.5 shadow-md" />
        </div>
      )}

      {/* 3. HEADS-UP DISPLAY (HUD) IN THE ROOM VIEW */}
      {!zoomState.active && (
        <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-center z-20 pointer-events-none select-none">
          <div className="pointer-events-auto bg-neutral-light/65 dark:bg-neutral-dark/65 backdrop-blur-lg border border-white/10 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-wider text-neutral-dark dark:text-neutral-light font-heading">
              BUTVAN ROOM <span className="text-primary font-normal text-xs ml-1">v0.1</span>
            </h1>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <Chip color="accent" variant="soft" size="sm" className="font-heading border border-primary/20 backdrop-blur-md">
              🎯 探索桌面物品进行跳转
            </Chip>
          </div>
        </div>
      )}

      {/* 4. TRANSITION FADE SCREEN AND SUB-PAGES */}
      <div 
        className={`absolute inset-0 z-30 transition-all duration-[600ms] flex flex-col items-center justify-center p-8 bg-neutral-light/95 dark:bg-neutral-dark/95 ${
          showTargetPage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {showTargetPage && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Header with back button */}
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-3">
                {showTargetPage === 'projects' && <Laptop className="w-6 h-6 text-primary" />}
                {showTargetPage === 'blog' && <BookOpen className="w-6 h-6 text-primary" />}
                {showTargetPage === 'about' && <Coffee className="w-6 h-6 text-primary" />}
                <h2 className="text-xl font-bold font-heading text-neutral-dark dark:text-neutral-light">
                  {showTargetPage === 'projects' && '💻 开源项目与代码'}
                  {showTargetPage === 'blog' && '📚 我的技术博客'}
                  {showTargetPage === 'about' && '☕ 关于我 / 留言板'}
                </h2>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleBackToRoom}
                className="font-heading flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回房间
              </Button>
            </div>

            {/* Target Page Content Layout */}
            <Card className="border border-white/10 shadow-2xl bg-neutral-light/50 dark:bg-neutral-dark/50 backdrop-blur-lg">
              <Card.Content className="p-8">
                {showTargetPage === 'projects' && (
                  <div className="flex flex-col gap-6 text-left">
                    <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70">
                      这里是我的工作台。下面是正在维护的项目（静态演示）：
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="p-5 rounded-2xl border border-divider hover:border-primary/50 transition-all cursor-pointer bg-white/40 dark:bg-black/20">
                        <div className="flex items-center gap-2 font-bold text-sm"><Terminal className="w-4 h-4 text-primary" /> Butvan Blog 2.0</div>
                        <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mt-2">基于 Next.js 15 和 Spring Boot 3.x 开发的沉浸式个人空间系统。</p>
                      </div>
                      <div className="p-5 rounded-2xl border border-divider hover:border-primary/50 transition-all cursor-pointer bg-white/40 dark:bg-black/20">
                        <div className="flex items-center gap-2 font-bold text-sm"><Laptop className="w-4 h-4 text-primary" /> ui-ux-pro-max</div>
                        <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mt-2">一套面向 AI 程序员的高级 UI 辅助设计与自动搜索体系。</p>
                      </div>
                    </div>
                  </div>
                )}

                {showTargetPage === 'blog' && (
                  <div className="flex flex-col gap-6 text-left">
                    <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70">
                      这里是我的书架。收录了我的学习随笔与思考文章：
                    </p>
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="p-5 rounded-2xl border border-divider hover:border-primary/50 transition-all cursor-pointer bg-white/40 dark:bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">如何用 SVG 实现精准的多端响应式交互热区</span>
                            <span className="text-xs text-neutral-dark/50 dark:text-neutral-light/50 mt-1">发布于 2026-06-14</span>
                          </div>
                        </div>
                        <Chip size="sm" color="accent" variant="soft">前端技术</Chip>
                      </div>
                      <div className="p-5 rounded-2xl border border-divider hover:border-primary/50 transition-all cursor-pointer bg-white/40 dark:bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">Spring Boot 3.x + JPA 优雅处理 JSONB 数据映射</span>
                            <span className="text-xs text-neutral-dark/50 dark:text-neutral-light/50 mt-1">发布于 2026-06-13</span>
                          </div>
                        </div>
                        <Chip size="sm" color="accent" variant="soft">后端开发</Chip>
                      </div>
                    </div>
                  </div>
                )}

                {showTargetPage === 'about' && (
                  <div className="flex flex-col gap-6 text-left">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-lg font-bold">可梵 (Butvan)</h3>
                        <p className="text-xs text-primary font-heading">Full-Stack Developer / UI Geek</p>
                        <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70 mt-1">
                          热爱设计与编程的创造者。喜欢干净的代码、极简的界面、以及醇香的黑咖啡。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
