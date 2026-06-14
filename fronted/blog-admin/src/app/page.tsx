'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react'
import { Save, Plus, Trash2, Crosshair, HelpCircle, Layers, Eye } from 'lucide-react'

interface Hotspot {
  id: number
  itemName: string
  x: number // percentage
  y: number // percentage
  w: number // percentage
  h: number // percentage
  hoverTips: string
  redirectType: 'internal' | 'external'
  redirectPath: string
  zoomScale: number
}

export default function AdminEditor() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    {
      id: 1,
      itemName: '电脑桌/工作台',
      x: 41.0,
      y: 33.0,
      w: 18.0,
      h: 18.0,
      hoverTips: '来看看我写的开源项目和代码吗？',
      redirectType: 'internal',
      redirectPath: '/projects',
      zoomScale: 3.5
    },
    {
      id: 2,
      itemName: '书架',
      x: 21.0,
      y: 10.0,
      w: 14.0,
      h: 40.0,
      hoverTips: '翻一翻我的技术博客与读书笔记',
      redirectType: 'internal',
      redirectPath: '/blog',
      zoomScale: 3.0
    }
  ])

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentDragRect, setCurrentDragRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Start drawing a new hotspot box
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    e.preventDefault()

    const rect = containerRef.current.getBoundingClientRect()
    // Calculate click coordinates as percentages
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentDragRect({ x, y, w: 0, h: 0 })
  }

  // Update box size during dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current || !currentDragRect) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100

    // Compute width and height supporting drag in all directions
    const x = Math.min(startPos.x, currentX)
    const y = Math.min(startPos.y, currentY)
    const w = Math.abs(startPos.x - currentX)
    const h = Math.abs(startPos.y - currentY)

    setCurrentDragRect({ x, y, w, h })
  }

  // Finish drawing and create draft hotspot
  const handleMouseUp = () => {
    if (!isDrawing || !currentDragRect) return
    setIsDrawing(false)

    // Ignore tiny accidental clicks (less than 1% size)
    if (currentDragRect.w < 1 || currentDragRect.h < 1) {
      setCurrentDragRect(null)
      return
    }

    const newHotspot: Hotspot = {
      id: Date.now(),
      itemName: `未命名物品_${hotspots.length + 1}`,
      x: parseFloat(currentDragRect.x.toFixed(2)),
      y: parseFloat(currentDragRect.y.toFixed(2)),
      w: parseFloat(currentDragRect.w.toFixed(2)),
      h: parseFloat(currentDragRect.h.toFixed(2)),
      hoverTips: '请配置悬浮文案',
      redirectType: 'internal',
      redirectPath: '/change-me',
      zoomScale: 3.0
    }

    setHotspots([...hotspots, newHotspot])
    setSelectedHotspot(newHotspot)
    setCurrentDragRect(null)
  }

  // Update selected hotspot values
  const handleUpdateField = (field: keyof Hotspot, value: any) => {
    if (!selectedHotspot) return
    const updated = { ...selectedHotspot, [field]: value }
    setSelectedHotspot(updated)
    setHotspots(hotspots.map(h => h.id === selectedHotspot.id ? updated : h))
  }

  // Delete hotspot
  const handleDeleteHotspot = (id: number) => {
    setHotspots(hotspots.filter(h => h.id !== id))
    if (selectedHotspot?.id === id) {
      setSelectedHotspot(null)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-light text-neutral-dark p-8 font-body flex flex-col gap-6 selection:bg-primary/30">
      
      {/* 1. Header Navigation */}
      <div className="flex justify-between items-center border-b border-divider pb-4">
        <div>
          <h1 className="text-xl font-bold font-heading flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-primary" /> 可梵的博客后台 — 首页热区编辑器
          </h1>
          <p className="text-xs text-neutral-dark/60 mt-1">在下方背景图上按下鼠标并拖动，即可为物品划定可点击的热区范围。</p>
        </div>
        <div className="flex gap-2">
          <Button 
            color="primary" 
            startContent={<Save className="w-4 h-4" />}
            onClick={() => alert('已输出配置JSON到控制台！\n' + JSON.stringify(hotspots, null, 2))}
            className="font-heading"
          >
            保存场景配置
          </Button>
        </div>
      </div>

      {/* 2. Main Editing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left and Mid Column: Interactive Drawing Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border border-divider shadow-md bg-white overflow-hidden">
            <CardBody className="p-0 relative select-none">
              
              {/* Canvas Container */}
              <div 
                ref={containerRef}
                className="relative w-full aspect-[16/10] bg-neutral-dark/10 cursor-crosshair overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Background Image */}
                <img 
                  src="/fWdgJuAOF.jpeg" 
                  alt="Cozy Room Scene" 
                  className="w-full h-full object-cover pointer-events-none select-none"
                />

                {/* Hotspots Rect Overlay */}
                {hotspots.map((hotspot) => {
                  const isSelected = selectedHotspot?.id === hotspot.id
                  return (
                    <div
                      key={hotspot.id}
                      className="absolute border transition-all duration-150"
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        width: `${hotspot.w}%`,
                        height: `${hotspot.h}%`,
                        borderColor: isSelected ? '#727BBA' : 'rgba(114, 123, 186, 0.4)',
                        backgroundColor: isSelected ? 'rgba(114, 123, 186, 0.15)' : 'rgba(114, 123, 186, 0.05)',
                        borderWidth: isSelected ? '2px' : '1px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation() // Stop drawing logic
                        setSelectedHotspot(hotspot)
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                        {hotspot.itemName}
                      </div>
                    </div>
                  )
                })}

                {/* Current Drag Rectangle */}
                {isDrawing && currentDragRect && (
                  <div
                    className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none"
                    style={{
                      left: `${currentDragRect.x}%`,
                      top: `${currentDragRect.y}%`,
                      width: `${currentDragRect.w}%`,
                      height: `${currentDragRect.h}%`,
                    }}
                  />
                )}
              </div>
            </CardBody>
          </Card>

          {/* Hotspots List Table */}
          <Card className="border border-divider shadow-sm bg-white">
            <CardBody className="p-4">
              <h3 className="text-sm font-bold font-heading mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" /> 已配置热区列表
              </h3>
              <Table aria-label="Hotspots table" size="sm" removeWrapper>
                <TableHeader>
                  <TableColumn>物品名称</TableColumn>
                  <TableColumn>坐标定位 (X, Y, W, H)</TableColumn>
                  <TableColumn>跳转路径</TableColumn>
                  <TableColumn>操作</TableColumn>
                </TableHeader>
                <TableBody>
                  {hotspots.map((hotspot) => (
                    <TableRow key={hotspot.id} className={selectedHotspot?.id === hotspot.id ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <span 
                          className="font-bold text-xs cursor-pointer hover:underline"
                          onClick={() => setSelectedHotspot(hotspot)}
                        >
                          {hotspot.itemName}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-neutral-dark/60">
                        {`${hotspot.x}%, ${hotspot.y}%, ${hotspot.w}%, ${hotspot.h}%`}
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary" className="font-mono text-[10px]">
                          {hotspot.redirectPath}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            color="danger"
                            onClick={() => handleDeleteHotspot(hotspot.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {hotspots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-xs text-neutral-dark/40">
                        暂无交互热区，请在图片上拖拽框选添加。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Properties Configurations Side Panel */}
        <div className="flex flex-col gap-4">
          <Card className="border border-divider shadow-md bg-white h-full">
            <CardBody className="p-6 flex flex-col gap-5">
              <h3 className="text-sm font-bold font-heading border-b border-divider pb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" /> 热区属性配置
              </h3>

              {selectedHotspot ? (
                <div className="flex flex-col gap-4">
                  {/* Item Name */}
                  <Input
                    label="物品名称"
                    placeholder="例如：电脑、书本"
                    labelPlacement="outside"
                    size="sm"
                    value={selectedHotspot.itemName}
                    onChange={(e) => handleUpdateField('itemName', e.target.value)}
                  />

                  {/* Hover Tips */}
                  <Input
                    label="悬浮提示文字"
                    placeholder="鼠标悬停时展示的趣玩提示文案"
                    labelPlacement="outside"
                    size="sm"
                    value={selectedHotspot.hoverTips}
                    onChange={(e) => handleUpdateField('hoverTips', e.target.value)}
                  />

                  {/* Redirect Type */}
                  <Select
                    label="跳转类型"
                    labelPlacement="outside"
                    size="sm"
                    selectedKeys={[selectedHotspot.redirectType]}
                    onSelectionChange={(keys) => handleUpdateField('redirectType', Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="internal" value="internal">内部路由 (Next.js Link)</SelectItem>
                    <SelectItem key="external" value="external">外部超链接 (URL)</SelectItem>
                  </Select>

                  {/* Redirect Path */}
                  <Input
                    label="目标跳转路径"
                    placeholder="例如：/blog 或 https://github.com"
                    labelPlacement="outside"
                    size="sm"
                    value={selectedHotspot.redirectPath}
                    onChange={(e) => handleUpdateField('redirectPath', e.target.value)}
                  />

                  {/* Zoom Scale */}
                  <Input
                    label="镜头拉近倍率"
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    labelPlacement="outside"
                    size="sm"
                    value={selectedHotspot.zoomScale.toString()}
                    onChange={(e) => handleUpdateField('zoomScale', parseFloat(e.target.value) || 3.0)}
                  />

                  <div className="flex flex-col gap-1 mt-4">
                    <span className="text-xs font-bold text-neutral-dark/70">几何数据 (只读)</span>
                    <div className="bg-neutral-light/50 p-3 rounded-xl border border-divider font-mono text-[10px] text-neutral-dark/80 flex flex-col gap-1">
                      <span>X 轴起点: {selectedHotspot.x}%</span>
                      <span>Y 轴起点: {selectedHotspot.y}%</span>
                      <span>热区宽度: {selectedHotspot.w}%</span>
                      <span>热区高度: {selectedHotspot.h}%</span>
                    </div>
                  </div>

                  <Button 
                    color="danger" 
                    variant="flat" 
                    startContent={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDeleteHotspot(selectedHotspot.id)}
                    className="mt-6 font-heading"
                  >
                    删除此热区
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-neutral-dark/40 gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-dark/20 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span>在左侧图片上框选，或点击已存在的区域进行配置。</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  )
}
