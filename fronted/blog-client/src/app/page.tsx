'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Spinner } from '@heroui/react'
import { ArrowLeft, FileText, Settings, Sparkles, RefreshCw, Eye, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 定义 Hotspot 和 Scene 类型
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

export default function HomePage() {
  const [scene, setScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 视图模式：'showroom' (高级悬浮展厅) | 'room' (实景房间模式)
  const [viewMode, setViewMode] = useState<'showroom' | 'room'>('showroom')

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

  // 1. 获取当前激活的房间场景
  const fetchActiveScene = () => {
    setLoading(true)
    setError(null)
    fetch('http://localhost:8080/api/scenes/active')
      .then(res => {
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
      .catch(err => {
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
    setActiveHotspot(hotspot)

    if (viewMode === 'room') {
      if (zoomState.active) return
      // 实景模式：计算镜头缩放的焦点
      const zoomX = hotspot.xPercent + (hotspot.widthPercent / 2)
      const zoomY = Math.min(100, hotspot.yPercent + 15)

      setZoomState({
        active: true,
        x: zoomX,
        y: zoomY,
        scale: hotspot.zoomScale || 3.0
      })

      // 延时展开对应的跳转目标页内容，保证镜头平滑拉近
      setTimeout(() => {
        setShowTargetPage(hotspot.redirectPath || `target-${hotspot.id}`)
      }, 850)
    } else {
      // 悬浮展厅模式：跳过缩放动画，直接渐显跳转目标页
      setShowTargetPage(hotspot.redirectPath || `target-${hotspot.id}`)
    }
  }

  const handleBackToRoom = () => {
    setShowTargetPage(null)
    setActiveHotspot(null)
    setZoomState({
      active: false,
      x: 50,
      y: 50,
      scale: 1
    })
  }

  // 渲染 Loading 状态
  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#07080d] text-[#c9d1d9] gap-4 font-body">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm font-heading tracking-wider animate-pulse text-primary/80">正在载入沉浸式个人书房...</p>
      </div>
    )
  }

  // 渲染错误/空场景状态
  if (error || !scene) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#07080d] text-[#c9d1d9] p-6 text-center font-body">
        <div className="bg-[#0f111a]/80 border border-white/5 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center gap-5 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-heading text-white">房间加载失败</h2>
          <p className="text-xs text-neutral-light/60 dark:text-neutral-light/60 leading-relaxed">
            {error || '没有在系统中检测到处于启用激活状态的房间场景。'}
          </p>
          <div className="w-full text-left bg-black/40 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[11px] font-bold text-primary block mb-1">🛠 快速排查指引:</span>
            <ol className="text-[10px] space-y-1 list-decimal list-inside text-neutral-light/50">
              <li>确认本地 PostgreSQL 服务已启动</li>
              <li>确保 Spring Boot 后端项目已在 8080 端口启动</li>
              <li>在管理后台录入并激活一个场景</li>
            </ol>
          </div>
          <div className="flex gap-3 mt-2">
            <Button size="sm" variant="outline" onClick={fetchActiveScene} className="font-heading gap-1.5 border-white/10 text-neutral-light/80">
              <RefreshCw className="w-3.5 h-3.5" /> 重新尝试
            </Button>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="font-heading border-primary/30 text-primary">
                登录管理端后台 ⚙️
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 拼装完整的背景图片地址
  const bgImgUrl = scene.imageUrl.startsWith('/') ? `http://localhost:8080${scene.imageUrl}` : scene.imageUrl

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07080d] flex items-center justify-center font-body selection:bg-primary/30">
      
      {/* ==================== 视图 1：高级悬浮展厅 (Showroom Mode) ==================== */}
      {viewMode === 'showroom' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          {/* Cyber Grid 背景 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
          
          {/* 动态霓虹背景光圈 */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-accent/6 blur-[120px] animate-pulse pointer-events-none" />

          {/* 展台网格列表 */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-between h-full overflow-hidden">
            {/* 展台头部文字 */}
            <div className="text-center flex flex-col items-center gap-2 mt-8 animate-[fadeIn_0.6s_ease-out]">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-heading">
                {scene.title} · 数码悬浮展台
              </h2>
              <p className="text-[11px] md:text-xs text-neutral-light/40 max-w-md font-body">
                独立悬浮的物品切片，支持 3D 浮动感交互，点击即可穿梭专栏文章与关联功能
              </p>
            </div>

            {/* 展物网格容器 */}
            <div className="flex-1 w-full flex items-center justify-center overflow-y-auto px-2 py-6 scrollbar-hide">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl w-full justify-items-center">
                {scene.hotspots.map((hotspot) => {
                  if (!hotspot.itemImageUrl) return null
                  const spriteUrl = hotspot.itemImageUrl.startsWith('/') 
                    ? `http://localhost:8080${hotspot.itemImageUrl}` 
                    : hotspot.itemImageUrl

                  return (
                    <motion.div
                      key={hotspot.id}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="group relative w-full max-w-[240px] h-[280px] flex flex-col justify-between items-center p-5 rounded-3xl border border-white/5 bg-[#0e101a]/50 backdrop-blur-md shadow-2xl hover:border-primary/25 hover:shadow-[0_0_30px_rgba(114,123,186,0.15)] cursor-pointer"
                      onClick={() => handleHotspotClick(hotspot)}
                    >
                      {/* 展台背光 glow */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/3 group-hover:to-accent/3 transition-all duration-500 pointer-events-none" />

                      {/* 3D 悬浮物品渲染 */}
                      <div className="flex-1 flex flex-col justify-center items-center relative w-full h-[150px] mb-2">
                        {/* 漂浮动画封装 */}
                        <div className="relative z-10 animate-float w-full h-full flex items-center justify-center">
                          <img
                            src={spriteUrl}
                            alt={hotspot.itemName}
                            className="max-w-[85%] max-h-[110px] object-contain group-hover:scale-105 transition-transform duration-500"
                            style={{
                              filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.45))'
                            }}
                          />
                        </div>
                        {/* 投影伴随缩放 */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-black/60 rounded-full blur-xs animate-float-shadow pointer-events-none" />
                      </div>

                      {/* 底部标题及状态标签 */}
                      <div className="w-full flex flex-col items-center text-center gap-1.5 z-10">
                        <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-accent border border-accent/15 px-2 py-0.5 rounded-full bg-accent/5">
                          {hotspot.redirectType === 'ARTICLE' ? '专栏文章' : '交互跳转'}
                        </span>
                        <h3 className="text-xs font-bold text-neutral-light group-hover:text-primary transition-colors font-heading leading-tight">
                          {hotspot.itemName}
                        </h3>
                        <p className="text-[10px] text-neutral-light/40 line-clamp-1">
                          {hotspot.hoverTips || '点击探索此物品'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            
            {/* 留空底部安全空间 */}
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* ==================== 视图 2：实景房间模式 (Room Mode) ==================== */}
      {viewMode === 'room' && (
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-[850ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
            transform: `scale(${zoomState.scale})`,
          }}
          onMouseMove={handleMouseMove}
        >
          {/* 背景图（底图） */}
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('${bgImgUrl}')` }}
          />

          {/* 暗色环境光幕 */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* 绝对定位物品 PNG Sprites 叠加层 */}
          <div className="absolute inset-0 w-full h-full z-10 select-none pointer-events-auto">
            {scene.hotspots.map((hotspot) => {
              const isHovered = hoveredHotspot?.id === hotspot.id
              const isActive = activeHotspot?.id === hotspot.id
              
              if (!hotspot.itemImageUrl) return null

              const spriteUrl = hotspot.itemImageUrl.startsWith('/') 
                ? `http://localhost:8080${hotspot.itemImageUrl}` 
                : hotspot.itemImageUrl

              return (
                <div
                  key={hotspot.id}
                  className="absolute cursor-pointer select-none origin-bottom transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                  style={{
                    left: `${hotspot.xPercent}%`,
                    top: `${hotspot.yPercent}%`,
                    width: `${hotspot.widthPercent}%`,
                    zIndex: isActive ? 40 : (isHovered ? 35 : (hotspot.sortOrder || 10)),
                    transform: isHovered 
                      ? 'translateY(-6px) scale(1.03)' 
                      : (isActive ? 'scale(1.05) translateY(-2px)' : 'none'),
                  }}
                  onMouseEnter={() => setHoveredHotspot(hotspot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onClick={() => handleHotspotClick(hotspot)}
                >
                  {/*
                    应用极其高端的羽化阴影
                    由于智能抠图将余白已全部剪除，热区定位完美贴合，可确保无多余色块或双影锯齿
                  */}
                  <img
                    src={spriteUrl}
                    alt={hotspot.itemName}
                    className="w-full h-auto object-contain transition-all duration-[450ms] ease-out pointer-events-auto"
                    style={{
                      filter: isHovered 
                        ? 'drop-shadow(0 12px 18px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 8px rgba(114, 123, 186, 0.5))'
                        : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== 3. 悬浮玻璃拟态悬浮提示 (Tooltip) ==================== */}
      {hoveredHotspot && !zoomState.active && viewMode === 'room' && (
        <div 
          className="fixed z-50 pointer-events-none transition-all duration-150 ease-out select-none flex flex-col items-center gap-1.5"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 75}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-[#0f111a]/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 max-w-[280px]">
            <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-primary font-heading">{hoveredHotspot.itemName}</span>
              <span className="text-[10px] text-neutral-light/50 mt-0.5">{hoveredHotspot.hoverTips}</span>
            </div>
          </div>
          <div className="w-2 h-2 bg-[#0f111a]/85 backdrop-blur-md border-r border-b border-white/10 rotate-45 -mt-1 shadow-md" />
        </div>
      )}

      {/* ==================== 4. HUD 面板与视图切换 (HUD Header) ==================== */}
      {!zoomState.active && (
        <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-center z-20 pointer-events-none select-none">
          {/* 左侧：Logo/主站入口 */}
          <div className="pointer-events-auto bg-[#0f111a]/80 backdrop-blur-lg border border-white/5 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-xs font-bold tracking-wider text-neutral-light font-heading">
              BUTVAN DIGITAL <span className="text-primary font-normal text-[10px] ml-1">v2.0</span>
            </h1>
          </div>
          
          {/* 右侧：精美视图切换器 */}
          <div className="pointer-events-auto flex items-center gap-1 bg-[#0f111a]/90 backdrop-blur-lg border border-white/5 p-1 rounded-2xl shadow-xl">
            <button
              onClick={() => setViewMode('showroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-heading font-semibold transition-all duration-300 ${
                viewMode === 'showroom'
                  ? 'bg-primary/95 text-white shadow-md'
                  : 'text-neutral-light/50 hover:text-neutral-light hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 悬浮展台
            </button>
            <button
              onClick={() => setViewMode('room')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-heading font-semibold transition-all duration-300 ${
                viewMode === 'room'
                  ? 'bg-primary/95 text-white shadow-md'
                  : 'text-neutral-light/50 hover:text-neutral-light hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> 实景空间
            </button>
          </div>
        </div>
      )}

      {/* ==================== 5. 沉浸式详情穿梭过渡层 (Detail Slide-In Panel) ==================== */}
      <AnimatePresence>
        {showTargetPage && activeHotspot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 md:p-12 bg-[#07080d]/98 backdrop-blur-md"
          >
            <div className="w-full max-w-4xl flex flex-col gap-6 select-text">
              {/* Header with back button */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg md:text-xl font-bold font-heading text-neutral-light">
                    {activeHotspot.itemName} — 详情浏览
                  </h2>
                </div>
                <Button 
                  size="sm"
                  onClick={handleBackToRoom}
                  className="font-heading flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-light text-xs rounded-xl px-4 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回展台
                </Button>
              </div>

              {/* 详情卡片内容布局 */}
              <Card className="border border-white/5 shadow-2xl bg-[#0f111a]/40 backdrop-blur-lg rounded-3xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                  
                  {/* 左侧：3D 悬浮大图缩略 */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center relative h-[240px] rounded-2xl bg-black/20 border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01),transparent)] pointer-events-none" />
                    <div className="animate-float flex items-center justify-center w-full h-full p-6">
                      <img
                        src={activeHotspot.itemImageUrl.startsWith('/') 
                          ? `http://localhost:8080${activeHotspot.itemImageUrl}` 
                          : activeHotspot.itemImageUrl}
                        alt={activeHotspot.itemName}
                        className="max-w-full max-h-[170px] object-contain"
                        style={{
                          filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.5))'
                        }}
                      />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/60 rounded-full blur-xs animate-float-shadow pointer-events-none" />
                  </div>

                  {/* 右侧：文章路由和静态交互说明 */}
                  <div className="md:col-span-3 flex flex-col gap-5 text-left justify-center">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base md:text-lg font-bold text-primary font-heading leading-tight">{activeHotspot.itemName}</h3>
                      <p className="text-xs text-neutral-light/50 font-body leading-relaxed">
                        已通过智能裁剪系统将其独立切片。下方为当前物品绑定的控制流与动作配置。
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/5 bg-black/30 mt-1">
                      <span className="text-[11px] font-bold text-accent block mb-2 font-heading uppercase tracking-wide">📦 交互路由及实体参数</span>
                      <ul className="text-xs space-y-2 text-neutral-light/70 font-mono">
                        <li className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-neutral-light/40">跳转类型:</span>
                          <span className="text-primary font-bold">{activeHotspot.redirectType}</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-neutral-light/40">目标路径:</span>
                          <span className="text-neutral-light/95 max-w-[200px] truncate">{activeHotspot.redirectPath || '未配置'}</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-neutral-light/40">关联ID:</span>
                          <span className="text-neutral-light/80">{activeHotspot.redirectTargetId || '无'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-neutral-light/40">视口缩放:</span>
                          <span className="text-accent">{activeHotspot.zoomScale} 倍</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* 若类型为博客文章，拉取关联状态 */}
                    {activeHotspot.redirectType === 'ARTICLE' && activeHotspot.redirectTargetId && (
                      <div className="mt-2 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-neutral-light">已关联博客文章</span>
                            <span className="text-[10px] text-neutral-light/40 mt-0.5">文章 ID: {activeHotspot.redirectTargetId}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs font-heading font-bold rounded-xl px-4">
                          立即阅读
                        </Button>
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
