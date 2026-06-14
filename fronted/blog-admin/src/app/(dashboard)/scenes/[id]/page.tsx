'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import { Card, Button, Input, Chip, Spinner } from '@heroui/react'
import { ArrowLeft, Save, Plus, Trash2, Maximize, Move, HelpCircle, Upload, Settings } from 'lucide-react'
import Link from 'next/link'

interface Hotspot {
  id?: number
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

export default function SceneEditorPage() {
  const params = useParams()
  const router = useRouter()
  const sceneId = params.id as string

  const [scene, setScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // 当前正在编辑/拖拽的热区
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [isEditMode, setIsEditMode] = useState(false) // false = 新建, true = 修改

  // 工作区容器尺寸引用
  const containerRef = useRef<HTMLDivElement>(null)
  const spriteFileInputRef = useRef<HTMLInputElement>(null)

  // 1. 加载场景详情
  const fetchSceneDetail = async () => {
    try {
      const res = await apiClient.get(`/admin/scenes/${sceneId}`)
      if (res.data.code === 200 || res.data.code === 0) {
        setScene(res.data.data)
        // 默认不选中任何热区
        setActiveHotspot(null)
        setIsEditMode(false)
      }
    } catch (err) {
      console.error(err)
      alert('获取场景配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sceneId) {
      fetchSceneDetail()
    }
  }, [sceneId])

  // 2. 选择/编辑某项热区
  const handleSelectHotspot = (hotspot: Hotspot) => {
    setActiveHotspot({ ...hotspot })
    setIsEditMode(true)
  }

  // 3. 点击空白画布准备创建新热区
  const handleCreateNewHotspot = () => {
    setActiveHotspot({
      itemName: '未命名物品',
      itemImageUrl: '',
      xPercent: 40.00,
      yPercent: 40.00,
      widthPercent: 10.00,
      hoverTips: '新增的可交互物品说明',
      redirectType: 'INTERNAL',
      redirectPath: '/about',
      zoomScale: 3.00,
      sortOrder: 10,
      isVisible: true
    })
    setIsEditMode(false)
  }

  // 4. 处理物品扣图 PNG 上传
  const handleUploadSprite = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !activeHotspot) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await apiClient.post('/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data.code === 200 || res.data.code === 0) {
        setActiveHotspot({
          ...activeHotspot,
          itemImageUrl: res.data.data.fileUrl
        })
      } else {
        alert(res.data.msg || '精灵图上传失败')
      }
    } catch (err) {
      console.error(err)
      alert('上传接口异常')
    } finally {
      setUploading(false)
    }
  }

  // 5. 拖拽移动 (Move)
  const handleDragStart = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.preventDefault()
    if (!containerRef.current) return

    // 自动切换当前编辑热区
    if (!activeHotspot || activeHotspot.id !== hotspot.id) {
      setActiveHotspot({ ...hotspot })
      setIsEditMode(true)
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    
    // 拖拽前记录的百分比值
    const startXPercent = Number(hotspot.xPercent)
    const startYPercent = Number(hotspot.yPercent)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      // 将 px 偏移换算成容器百分比偏移
      const dxPercent = (dx / containerRect.width) * 100
      const dyPercent = (dy / containerRect.height) * 100

      // 计算新的百分比并限制范围 [0, 100]
      const newXPercent = Math.max(0, Math.min(100 - Number(hotspot.widthPercent), startXPercent + dxPercent))
      const newYPercent = Math.max(0, Math.min(100, startYPercent + dyPercent))

      setActiveHotspot(prev => {
        if (!prev) return null
        return {
          ...prev,
          xPercent: Number(newXPercent.toFixed(2)),
          yPercent: Number(newYPercent.toFixed(2))
        }
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 6. 等比例拉伸缩放 (Resize)
  const handleResizeStart = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.stopPropagation()
    e.preventDefault()
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startWidthPercent = Number(hotspot.widthPercent)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      
      // px 换算成宽度百分比
      const dxPercent = (dx / containerRect.width) * 100
      const newWidthPercent = Math.max(1, Math.min(100, startWidthPercent + dxPercent))

      setActiveHotspot(prev => {
        if (!prev) return null
        return {
          ...prev,
          widthPercent: Number(newWidthPercent.toFixed(2))
        }
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 7. 保存热区信息到后端
  const handleSaveHotspot = async () => {
    if (!activeHotspot) return
    if (!activeHotspot.itemName.trim()) {
      alert('请填写物品名称')
      return
    }

    setSaving(true)
    try {
      const res = await apiClient.post('/admin/scenes/hotspots', {
        ...activeHotspot,
        sceneId: Number(sceneId)
      })
      if (res.data.code === 200 || res.data.code === 0) {
        // 保存成功后刷新数据
        await fetchSceneDetail()
      } else {
        alert(res.data.msg || '保存热区失败')
      }
    } catch (err) {
      console.error(err)
      alert('接口访问故障，无法保存热区')
    } finally {
      setSaving(false)
    }
  }

  // 8. 删除热区
  const handleDeleteHotspot = async (id?: number) => {
    if (!id) {
      // 如果是还没保存的新热区，直接清空编辑框即可
      setActiveHotspot(null)
      return
    }

    if (!confirm('确认要删除该热区吗？删除后前台该物品将无法交互。')) return

    try {
      const res = await apiClient.delete(`/admin/scenes/hotspots/${id}`)
      if (res.data.code === 200 || res.data.code === 0) {
        fetchSceneDetail()
      } else {
        alert(res.data.msg || '删除热区失败')
      }
    } catch (err) {
      console.error(err)
      alert('删除接口错误')
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#c9d1d9] gap-4">
        <Spinner size="lg" color="accent" />
        <span className="text-sm font-heading">载入场景热区编辑器中...</span>
      </div>
    )
  }

  if (!scene) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-white p-6">
        <div className="bg-[#161b22] border border-white/10 p-6 rounded-3xl max-w-sm text-center">
          <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-4">目标房间场景可能不存在，或者被移除。</p>
          <Button size="sm" variant="secondary" onClick={() => router.push('/scenes')}>返回列表</Button>
        </div>
      </div>
    )
  }

  const bgImgUrl = scene.imageUrl.startsWith('/') ? `http://localhost:8080${scene.imageUrl}` : scene.imageUrl

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen text-[#c9d1d9] font-body max-w-[1600px] mx-auto text-left">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/scenes">
            <Button size="sm" variant="outline" className="font-heading gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-heading text-white">场景热区拼贴器 (Sprite Placer)</h1>
            <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/50 mt-0.5">
              当前编辑场景：<span className="text-primary font-bold">{scene.title}</span> (场景ID: {scene.id})
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleCreateNewHotspot} className="font-heading gap-1">
            <Plus className="w-4 h-4" /> 摆放新物品
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Visual Sprite Placer Canvas Workspace (Left 3 Columns) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#161b22] border border-white/10 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-bold font-heading text-neutral-dark/80 dark:text-neutral-light/80 flex items-center gap-1.5">
              <Move className="w-4 h-4 text-primary" /> 可视化布局工作区 (按住透明精灵图拖动，拖拽右下角拉伸缩放大小)
            </span>
            <Chip size="sm" variant="primary" className="font-heading">画布大小自动对齐背景</Chip>
          </div>

          {/* Interactive Canvas Container */}
          <div 
            ref={containerRef}
            className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl select-none"
          >
            {/* Background Image */}
            <img
              src={bgImgUrl}
              alt="Room Background"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
            
            {/* Transparent Gradients Overlay */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />

            {/* Sprites Positioning Layer */}
            <div className="absolute inset-0 w-full h-full z-10">
              
              {/* 1. Render Saved Hotspots */}
              {scene.hotspots.map((hotspot) => {
                if (!hotspot.itemImageUrl) return null
                const isSelected = activeHotspot && activeHotspot.id === hotspot.id
                const spriteUrl = hotspot.itemImageUrl.startsWith('/') 
                  ? `http://localhost:8080${hotspot.itemImageUrl}` 
                  : hotspot.itemImageUrl

                return (
                  <div
                    key={hotspot.id}
                    className={`absolute cursor-move select-none border transition-colors group ${
                      isSelected ? 'border-primary ring-2 ring-primary/30 z-30' : 'border-dashed border-white/30 hover:border-white/60 z-20'
                    }`}
                    style={{
                      left: `${hotspot.xPercent}%`,
                      top: `${hotspot.yPercent}%`,
                      width: `${hotspot.widthPercent}%`,
                      zIndex: hotspot.sortOrder || 10,
                    }}
                    onMouseDown={(e) => handleDragStart(e, hotspot)}
                  >
                    <img
                      src={spriteUrl}
                      alt={hotspot.itemName}
                      className="w-full h-auto object-contain pointer-events-none select-none opacity-85 group-hover:opacity-100"
                    />
                    
                    {/* Size and info tag */}
                    <div className="absolute -top-5 left-0 bg-black/85 px-1.5 py-0.5 rounded text-[8px] font-mono border border-white/10 text-white select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {hotspot.itemName} ({hotspot.widthPercent}%)
                    </div>
                  </div>
                )
              })}

              {/* 2. Render Active Editing Hotspot (If it's a new unsaved one or being dragged) */}
              {activeHotspot && activeHotspot.itemImageUrl && (
                <div
                  className="absolute cursor-move select-none border-2 border-primary ring-2 ring-primary/40 z-40 bg-primary/5"
                  style={{
                    left: `${activeHotspot.xPercent}%`,
                    top: `${activeHotspot.yPercent}%`,
                    width: `${activeHotspot.widthPercent}%`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, activeHotspot)}
                >
                  <img
                    src={activeHotspot.itemImageUrl.startsWith('/') ? `http://localhost:8080${activeHotspot.itemImageUrl}` : activeHotspot.itemImageUrl}
                    alt="Active Preview"
                    className="w-full h-auto object-contain pointer-events-none select-none"
                  />

                  {/* Positioning Tag */}
                  <div className="absolute -top-7 left-0 bg-primary px-2 py-0.5 rounded text-[10px] font-mono text-black font-bold border border-white/20 select-none pointer-events-none flex gap-2">
                    <span>X: {activeHotspot.xPercent}%</span>
                    <span>Y: {activeHotspot.yPercent}%</span>
                    <span>W: {activeHotspot.widthPercent}%</span>
                  </div>

                  {/* Equilateral Equidistant Resize handle on bottom-right corner */}
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border border-black rounded-full cursor-se-resize z-50 flex items-center justify-center hover:scale-125 transition-transform"
                    onMouseDown={(e) => handleResizeStart(e, activeHotspot)}
                  >
                    <Maximize className="w-2 h-2 text-black" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls and Form Panel (Right 1 Column) */}
        <div className="xl:col-span-1 flex flex-col gap-5 bg-[#161b22] border border-white/10 p-5 rounded-3xl shadow-xl">
          
          {/* Section: List existing sprites */}
          <div className="flex flex-col gap-3 border-b border-divider pb-4">
            <h2 className="text-xs font-bold font-heading text-white flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-primary" /> 精灵物品管理 ({scene.hotspots.length})
            </h2>
            <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
              {scene.hotspots.map((h) => (
                <div 
                  key={h.id}
                  onClick={() => handleSelectHotspot(h)}
                  className={`px-3 py-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                    activeHotspot && activeHotspot.id === h.id 
                      ? 'border-primary/60 bg-primary/10 text-white font-bold' 
                      : 'border-white/5 hover:border-white/15 bg-black/15 text-neutral-dark/80 dark:text-neutral-light/75'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="truncate">{h.itemName}</span>
                  </div>
                  <Chip size="sm" variant="soft" className="text-[9px] h-4 font-mono">
                    z:{h.sortOrder}
                  </Chip>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Form fields */}
          {activeHotspot ? (
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <span className="text-xs font-bold font-heading text-white">
                  {isEditMode ? '⚙️ 编辑物品属性' : '✨ 摆放物品配置'}
                </span>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleDeleteHotspot(activeHotspot.id)}
                  className="font-heading gap-1 h-7 text-[10px]"
                >
                  <Trash2 className="w-3 h-3" /> 删除
                </Button>
              </div>

              {/* Upload Cutout Sprite Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">物品透明抠图 PNG</label>
                <div className="flex gap-2">
                  <input
                    placeholder="上传透明 PNG 或粘贴外链"
                    value={activeHotspot.itemImageUrl || ''}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, itemImageUrl: e.target.value })}
                    className="flex-grow bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="file"
                    accept="image/png"
                    ref={spriteFileInputRef}
                    onChange={handleUploadSprite}
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    isDisabled={uploading}
                    onClick={() => spriteFileInputRef.current?.click()}
                    className="font-heading px-3"
                  >
                    {uploading ? <Spinner size="sm" color="accent" /> : <Upload className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <span className="text-[9px] text-neutral-dark/50 dark:text-neutral-light/40">必须为透明背景 .png 切片以获得最佳悬浮效果</span>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">物品展示名称</label>
                <input
                  placeholder="例如：我的电脑"
                  value={activeHotspot.itemName || ''}
                  onChange={(e) => setActiveHotspot({ ...activeHotspot, itemName: e.target.value })}
                  className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Coord indicators */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-dark/50 dark:text-neutral-light/40 font-mono">X 左边界 (%)</label>
                  <input
                    value={activeHotspot.xPercent.toString()}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, xPercent: Number(Number(e.target.value).toFixed(2)) })}
                    className="w-full bg-black/10 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-dark/50 dark:text-neutral-light/40 font-mono">Y 上边界 (%)</label>
                  <input
                    value={activeHotspot.yPercent.toString()}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, yPercent: Number(Number(e.target.value).toFixed(2)) })}
                    className="w-full bg-black/10 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-dark/50 dark:text-neutral-light/40 font-mono">W 宽度 (%)</label>
                  <input
                    value={activeHotspot.widthPercent.toString()}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, widthPercent: Number(Number(e.target.value).toFixed(2)) })}
                    className="w-full bg-black/10 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Redirect Type & Path */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">跳转类型</label>
                  <select
                    value={activeHotspot.redirectType}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, redirectType: e.target.value })}
                    className="text-xs bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-primary w-full h-8"
                  >
                    <option value="INTERNAL">站内路径</option>
                    <option value="EXTERNAL">外链 URL</option>
                    <option value="ARTICLE">关联文章</option>
                    <option value="CATEGORY">关联分类</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">跳转目标路径/ID</label>
                  {activeHotspot.redirectType === 'ARTICLE' || activeHotspot.redirectType === 'CATEGORY' ? (
                    <input
                      placeholder="输入目标实体ID"
                      value={activeHotspot.redirectTargetId?.toString() || ''}
                      onChange={(e) => setActiveHotspot({ ...activeHotspot, redirectTargetId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <input
                      placeholder="如 /about 或 URL"
                      value={activeHotspot.redirectPath || ''}
                      onChange={(e) => setActiveHotspot({ ...activeHotspot, redirectPath: e.target.value })}
                      className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
              </div>

              {/* Hover tips */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">悬浮微文案</label>
                <input
                  placeholder="悬停显示的说明，如：来看看我的故事"
                  value={activeHotspot.hoverTips || ''}
                  onChange={(e) => setActiveHotspot({ ...activeHotspot, hoverTips: e.target.value })}
                  className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">镜头缩放倍率</label>
                  <input
                    value={activeHotspot.zoomScale.toString()}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, zoomScale: Number(e.target.value) })}
                    className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-dark/75 dark:text-neutral-light/75">层级/排序(z-index)</label>
                  <input
                    value={activeHotspot.sortOrder.toString()}
                    onChange={(e) => setActiveHotspot({ ...activeHotspot, sortOrder: Number(e.target.value) })}
                    className="w-full bg-black/15 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-divider pt-3 mt-1">
                <span className="text-[11px] text-neutral-dark/50 dark:text-neutral-light/45">前台是否显示：</span>
                <select
                  value={activeHotspot.isVisible ? 'true' : 'false'}
                  onChange={(e) => setActiveHotspot({ ...activeHotspot, isVisible: e.target.value === 'true' })}
                  className="text-xs bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-primary w-24 h-7"
                >
                  <option value="true">显示</option>
                  <option value="false">隐藏</option>
                </select>
              </div>

              <Button
                variant="primary"
                isDisabled={saving}
                onClick={handleSaveHotspot}
                className="font-heading w-full mt-2 gap-1.5 flex items-center justify-center"
              >
                {saving ? '保存中...' : <><Save className="w-4 h-4" /> 保存当前物品配置</>}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-divider rounded-2xl bg-black/5">
              <HelpCircle className="w-8 h-8 text-neutral-dark/30 dark:text-neutral-light/30 mb-2" />
              <p className="text-[11px] text-neutral-dark/65 dark:text-neutral-light/65 text-center px-4 leading-relaxed">
                请先点击画布上的热区物品，或点击“摆放新物品”上传并拼贴定位。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
