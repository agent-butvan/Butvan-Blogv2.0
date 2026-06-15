'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Chip, Spinner } from '@heroui/react'
import { ArrowLeft, FileText, Settings, Sparkles, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/image-url'

// Define v0.2 Hotspot and Scene types matching backend VO
interface Hotspot {
  id: number
  itemName: string
  itemImageUrl: string // 透明抠图 PNG
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent?: number
  hoverTips: string
  redirectType: string // INTERNAL | EXTERNAL | ARTICLE | CATEGORY
  redirectPath: string
  redirectTargetId?: number
  zoomScale: number
  sortOrder: number
  isVisible: boolean
}

interface Scene {
  id: number
  title: string
  imageUrl: string
  isActive: boolean
  hotspots: Hotspot[]
}

/**
 * 沉浸式房间场景页面
 *
 * 原首页迁移到 /room 路由，
 * 用户通过首页「进入我的房间」CTA 跳转至此。
 */
export default function RoomPage() {
  const router = useRouter()
  const [scene, setScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [zoomState, setZoomState] = useState({
    active: false,
    x: 50,
    y: 50,
    scale: 1,
  })
  const [showTargetPage, setShowTargetPage] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // 1. Fetch active scene config on load
  const fetchActiveScene = () => {
    setLoading(true)
    setError(null)
    fetch('http://localhost:8080/api/scenes/active')
      .then((res) => {
        if (!res.ok) {
          throw new Error('无法连接到服务端，或目前无激活的房间场景')
        }
        return res.json()
      })
      .then((resData) => {
        if (resData.code === 200 || resData.code === 0) {
          setScene(resData.data)
        } else {
          throw new Error(resData.msg || '获取首页场景失败')
        }
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || '网络连接故障，请检查后端 API 服务是否已启动')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchActiveScene()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (zoomState.active) return
    setActiveHotspot(hotspot)

    // 计算物品的几何中心作为镜头缩放的焦点
    const zoomX = hotspot.xPercent + hotspot.widthPercent / 2
    // Y 坐标向偏下移动 15%，获得更平衡的居中视觉
    const zoomY = Math.min(100, hotspot.yPercent + 15)

    setZoomState({
      active: true,
      x: zoomX,
      y: zoomY,
      scale: hotspot.zoomScale || 3.0,
    })

    // 延时展开对应的跳转目标页内容或执行真实跳转
    setTimeout(() => {
      if (hotspot.redirectPath) {
        if (hotspot.redirectType === 'EXTERNAL') {
          // 外链在新窗口打开，自动补全协议前缀
          let url = hotspot.redirectPath
          if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url
          }
          window.open(url, '_blank')
          // 外链打开后，立即复位主界面的缩放镜头，避免界面卡在拉近状态
          handleBackToRoom()
        } else {
          // 站内路由跳转（包含 INTERNAL/ARTICLE/CATEGORY 等）
          router.push(hotspot.redirectPath)
        }
      } else {
        // 若无具体跳转路径，回退到预览卡片浮层
        setShowTargetPage(`target-${hotspot.id}`)
      }
    }, 850)
  }

  const handleBackToRoom = () => {
    setShowTargetPage(null)
    setActiveHotspot(null)
    setZoomState({
      active: false,
      x: 50,
      y: 50,
      scale: 1,
    })
  }

  // 渲染 Loading 状态
  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#c9d1d9] gap-4 font-body">
        <Spinner size="lg" color="accent" />
        <p className="text-sm font-heading tracking-wider animate-pulse text-primary">
          正在载入沉浸式个人书房...
        </p>
      </div>
    )
  }

  // 渲染错误/空场景状态
  if (error || !scene) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#c9d1d9] p-6 text-center font-body">
        <div className="bg-[#161b22] border border-white/10 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center gap-5 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-heading text-white">房间加载失败</h2>
          <p className="text-xs text-neutral-light/60 leading-relaxed">
            {error || '没有在系统中检测到处于启用激活状态的房间场景。'}
          </p>
          <div className="flex gap-3 mt-2">
            <Button size="sm" variant="outline" onClick={fetchActiveScene} className="font-heading gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> 重新尝试
            </Button>
            <Link href="/">
              <Button size="sm" variant="outline" className="font-heading gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 拼装完整的背景图片地址
  const bgImgUrl = resolveImageUrl(scene.imageUrl)

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d1117] flex items-center justify-center font-body selection:bg-primary/30">
      {/* 1. ROOM VIEW CONTAINER (PNG Sprite Overlay Mode) */}
      {/*    仅在真正缩放时才应用 CSS transform，避免 scale(1) 触发低分辨率 GPU 合成层 */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          ...(zoomState.active && zoomState.scale > 1
            ? {
                transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
                transform: `scale(${zoomState.scale})`,
                transition: 'transform 850ms cubic-bezier(0.25,1,0.5,1)',
                willChange: 'transform',
              }
            : {
                transition: 'transform 850ms cubic-bezier(0.25,1,0.5,1)',
              }),
        }}
        onMouseMove={handleMouseMove}
      >
        {/* 背景图使用 next/image 组件，
            自动生成多分辨率 srcSet 和 WebP/AVIF 转码，
            解决 Retina 高分屏模糊问题 */}
        <Image
          src={bgImgUrl}
          alt="Room Background"
          fill
          className="object-cover"
          sizes="100vw"
          preload
          draggable={false}
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* 2. PNG SPRITES OVERLAYS */}
        <div className="absolute inset-0 w-full h-full z-10 select-none pointer-events-auto">
          {scene.hotspots.map((hotspot) => {
            const isHovered = hoveredHotspot?.id === hotspot.id
            const isActive = activeHotspot?.id === hotspot.id

            if (!hotspot.itemImageUrl) return null

            const spriteUrl = resolveImageUrl(hotspot.itemImageUrl)

            return (
              <div
                key={hotspot.id}
                className="absolute cursor-pointer select-none origin-bottom transition-all duration-[450ms]"
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                  width: `${hotspot.widthPercent}%`,
                  zIndex: isActive ? 40 : isHovered ? 35 : hotspot.sortOrder || 10,
                  transform: isHovered
                    ? 'scale(1.01)'
                    : isActive
                    ? 'scale(1.02)'
                    : 'none',
                }}
                onMouseEnter={() => setHoveredHotspot(hotspot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                onClick={() => handleHotspotClick(hotspot)}
              >
                {/* 精灵图使用 next/image 优化，自动 WebP 转码消除锯齿模糊 */}
                <div className="relative w-full">
                  <Image
                    src={spriteUrl}
                    alt={hotspot.itemName}
                    width={800}
                    height={600}
                    sizes={`${hotspot.widthPercent}vw`}
                    className="object-contain transition-all duration-[450ms] ease-out pointer-events-auto"
                    style={{
                      width: '100%',
                      height: 'auto',
                      opacity: isHovered || isActive ? 1 : 0,
                      filter:
                        isHovered || isActive
                          ? 'drop-shadow(0 0 15px rgba(114, 123, 186, 0.95)) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.35))'
                          : 'none',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. PREMIUM GLASSMORPHISM TOOLTIP */}
      {hoveredHotspot && !zoomState.active && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-150 ease-out select-none flex flex-col items-center gap-1.5"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 75}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-neutral-light/75 dark:bg-neutral-dark/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2 max-w-[280px]">
            <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              {hoveredHotspot.redirectType === 'ARTICLE' ? (
                <FileText className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-primary font-heading">
                {hoveredHotspot.itemName}
              </span>
              <span className="text-[11px] text-neutral-dark/80 dark:text-neutral-light/80 mt-0.5">
                {hoveredHotspot.hoverTips}
              </span>
            </div>
          </div>
          <div className="w-2.5 h-2.5 bg-neutral-light/75 dark:bg-neutral-dark/85 backdrop-blur-md border-r border-b border-white/20 rotate-45 -mt-1.5 shadow-md" />
        </div>
      )}



      {/* 5. TRANSITION FADE SCREEN AND SUB-PAGES */}
      <div
        className={`absolute inset-0 z-30 transition-all duration-[600ms] flex flex-col items-center justify-center p-8 bg-neutral-light/95 dark:bg-neutral-dark/95 ${
          showTargetPage
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {showTargetPage && activeHotspot && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Header with back button */}
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold font-heading text-neutral-dark dark:text-neutral-light">
                  {activeHotspot.itemName} — 内容浏览
                </h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackToRoom}
                className="font-heading flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回场景
              </Button>
            </div>

            {/* Target Page Content Layout */}
            <Card className="border border-white/10 shadow-2xl bg-neutral-light/50 dark:bg-neutral-dark/50 backdrop-blur-lg">
              <Card.Content className="p-8">
                <div className="flex flex-col gap-6 text-left">
                  <h3 className="text-base font-bold text-primary">
                    {activeHotspot.itemName}
                  </h3>
                  <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70">
                    您点击了场景中的「{activeHotspot.itemName}
                    」。以下是系统加载的静态预览页面（待后续文章/跳转模块打通）：
                  </p>
                  <div className="p-5 rounded-2xl border border-divider bg-white/40 dark:bg-black/20 mt-2">
                    <span className="text-xs font-bold text-accent block mb-2">
                      交互路由信息：
                    </span>
                    <ul className="text-xs space-y-1 text-neutral-dark/80 dark:text-neutral-light/80 font-mono">
                      <li>• 跳转类型: {activeHotspot.redirectType}</li>
                      <li>• 跳转目标路径: {activeHotspot.redirectPath || '未配置'}</li>
                      <li>• 跳转关联ID: {activeHotspot.redirectTargetId || '无'}</li>
                      <li>• 聚焦缩放: {activeHotspot.zoomScale} 倍</li>
                    </ul>
                  </div>

                  {activeHotspot.redirectType === 'ARTICLE' &&
                    activeHotspot.redirectTargetId && (
                      <div className="mt-4 p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">已关联博客文章</span>
                            <span className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mt-0.5">
                              文章 ID: {activeHotspot.redirectTargetId}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="primary" className="font-heading">
                          立即阅读
                        </Button>
                      </div>
                    )}
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
