'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import { toast } from '@/lib/toast'
import { cropImageFromBackground, trimAndSmoothCutout } from '@/lib/canvas-crop'
import { removeImageBackground, preloadRemovalModel } from '@/lib/background-removal'
import SceneToolbar from '@/components/editor/SceneToolbar'
import type { EditorMode } from '@/components/editor/SceneToolbar'
import SceneCanvas from '@/components/editor/SceneCanvas'
import type { HotspotData, DrawingRect } from '@/components/editor/SceneCanvas'
import HotspotPropertiesPanel from '@/components/editor/HotspotPropertiesPanel'
import ConfirmModal from '@/components/common/ConfirmModal'
import { Spinner } from '@heroui/react'

/** 场景详情 */
interface Scene {
  id: number
  title: string
  imageUrl: string
  isActive: boolean
  hotspots: HotspotData[]
}

/**
 * 场景编辑器页面（v0.3 重构）
 *
 * 支持两种工作模式：
 * 1. 框选模式 — 在背景图上拖拽框选 → 松开自动裁剪上传 → 创建热区
 * 2. 编辑模式 — 选中/拖拽/缩放已有热区，编辑属性
 */
export default function SceneEditorPage() {
  const params = useParams()
  const router = useRouter()
  const sceneId = params.id as string

  // --- 场景数据 ---
  const [scene, setScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- 编辑器状态 ---
  const [mode, setMode] = useState<EditorMode>('select')
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // --- 绘制状态（框选模式） ---
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingRect, setDrawingRect] = useState<DrawingRect | null>(null)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [smartExtraction, setSmartExtraction] = useState(true)
  const [extractionProgress, setExtractionProgress] = useState(0)

  // --- 删除确认 ---
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null)
  const spriteFileInputRef = useRef<HTMLInputElement>(null)

  // ==================== 数据加载 ====================

  const fetchSceneDetail = useCallback(async () => {
    try {
      const res = await apiClient.get(`/admin/scenes/${sceneId}`)
      if (res.data.code === 200 || res.data.code === 0) {
        setScene(res.data.data)
        setActiveHotspot(null)
        setIsEditMode(false)
      }
    } catch (err) {
      console.error('获取场景配置失败', err)
    } finally {
      setLoading(false)
    }
  }, [sceneId])

  useEffect(() => {
    if (sceneId) fetchSceneDetail()
  }, [sceneId, fetchSceneDetail])

  // 预加载智能抠图 AI 模型（后台静默下载，不阻塞 UI）
  useEffect(() => {
    preloadRemovalModel()
  }, [])

  // ==================== 热区操作 ====================

  /** 选中热区 */
  const handleSelectHotspot = (hotspot: HotspotData) => {
    setActiveHotspot({ ...hotspot })
    setIsEditMode(true)
  }

  /** 保存热区 */
  const handleSaveHotspot = async () => {
    if (!activeHotspot) return
    if (!activeHotspot.itemName.trim()) {
      toast.warning('请填写物品名称')
      return
    }
    setSaving(true)
    try {
      const res = await apiClient.post('/admin/scenes/hotspots', {
        ...activeHotspot,
        sceneId: Number(sceneId),
      })
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success('物品配置保存成功')
        await fetchSceneDetail()
      } else {
        toast.error(res.data.msg || '保存热区失败')
      }
    } catch {
      toast.error('接口访问故障，无法保存热区')
    } finally {
      setSaving(false)
    }
  }

  /** 请求删除热区（打开确认弹窗） */
  const handleDeleteRequest = (id?: number) => {
    if (!id) {
      setActiveHotspot(null)
      return
    }
    setConfirmDeleteId(id)
  }

  /** 确认删除热区 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    setDeleteLoading(true)
    try {
      const res = await apiClient.delete(`/admin/scenes/hotspots/${confirmDeleteId}`)
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success('物品删除成功')
        setConfirmDeleteId(null)
        setActiveHotspot(null)
        await fetchSceneDetail()
      } else {
        toast.error(res.data.msg || '删除失败')
      }
    } catch {
      toast.error('删除接口错误')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ==================== 拖拽与缩放（编辑模式） ====================

  const handleDragStart = (e: React.MouseEvent, hotspot: HotspotData) => {
    e.preventDefault()
    if (!containerRef.current) return

    if (!activeHotspot || activeHotspot.id !== hotspot.id) {
      setActiveHotspot({ ...hotspot })
      setIsEditMode(true)
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startXPercent = Number(hotspot.xPercent)
    const startYPercent = Number(hotspot.yPercent)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      const dxPercent = (dx / containerRect.width) * 100
      const dyPercent = (dy / containerRect.height) * 100
      const newX = Math.max(0, Math.min(100 - Number(hotspot.widthPercent), startXPercent + dxPercent))
      const newY = Math.max(0, Math.min(100, startYPercent + dyPercent))

      setActiveHotspot((prev) =>
        prev
          ? { ...prev, xPercent: Number(newX.toFixed(2)), yPercent: Number(newY.toFixed(2)) }
          : null
      )
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeStart = (e: React.MouseEvent, hotspot: HotspotData) => {
    e.stopPropagation()
    e.preventDefault()
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startWidthPercent = Number(hotspot.widthPercent)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dxPercent = (dx / containerRect.width) * 100
      const newWidth = Math.max(1, Math.min(100, startWidthPercent + dxPercent))

      setActiveHotspot((prev) =>
        prev ? { ...prev, widthPercent: Number(newWidth.toFixed(2)) } : null
      )
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // ==================== 手动上传物品图 ====================

  const handleUploadManualSprite = async (file: File) => {
    // 如果当前有选中热区，替换其图片
    if (activeHotspot) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await apiClient.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res.data.code === 200 || res.data.code === 0) {
          toast.success('物品图上传成功')
          setActiveHotspot({ ...activeHotspot, itemImageUrl: res.data.data.fileUrl })
        } else {
          toast.error(res.data.msg || '物品图上传失败')
        }
      } catch {
        toast.error('上传接口异常')
      } finally {
        setUploading(false)
      }
    } else {
      // 没有选中热区时，创建一个新热区并附加图片
      setActiveHotspot({
        itemName: '未命名物品',
        itemImageUrl: '',
        xPercent: 40,
        yPercent: 40,
        widthPercent: 10,
        hoverTips: '手动上传的物品',
        redirectType: 'INTERNAL',
        redirectPath: '/about',
        zoomScale: 3.0,
        sortOrder: 10,
        isVisible: true,
      })
      setIsEditMode(false)
      // 立即触发上传
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await apiClient.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res.data.code === 200 || res.data.code === 0) {
          toast.success('物品图上传成功')
          setActiveHotspot((prev) =>
            prev ? { ...prev, itemImageUrl: res.data.data.fileUrl } : null
          )
        }
      } catch {
        toast.error('上传接口异常')
      } finally {
        setUploading(false)
      }
    }
  }

  /** 替换物品图（属性面板触发） */
  const handleReplaceImage = async (file: File) => {
    if (!activeHotspot) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success('物品图替换成功')
        setActiveHotspot({ ...activeHotspot, itemImageUrl: res.data.data.fileUrl })
      } else {
        toast.error(res.data.msg || '替换图片失败')
      }
    } catch {
      toast.error('上传接口异常')
    } finally {
      setUploading(false)
    }
  }

  // ==================== 框选绘制模式 ====================

  /** 画布 mouseDown（仅 draw 模式生效） */
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'draw' || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDrawStart({ x, y })
    setIsDrawing(true)
    setDrawingRect({ startX: x, startY: y, currentX: x, currentY: y })
  }

  /** 画布 mouseMove */
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return
    const rect = containerRef.current!.getBoundingClientRect()
    setDrawingRect({
      startX: drawStart.x,
      startY: drawStart.y,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    })
  }

  /** 画布 mouseUp → 完成框选 → 自动裁剪上传 */
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawingRect || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()

    // 归一化起止点（支持任意方向拖拽）
    const minX = Math.min(drawingRect.startX, drawingRect.currentX)
    const minY = Math.min(drawingRect.startY, drawingRect.currentY)
    const maxX = Math.max(drawingRect.startX, drawingRect.currentX)
    const maxY = Math.max(drawingRect.startY, drawingRect.currentY)

    const xPercent = (minX / containerRect.width) * 100
    const yPercent = (minY / containerRect.height) * 100
    const widthPercent = ((maxX - minX) / containerRect.width) * 100
    const heightPercent = ((maxY - minY) / containerRect.height) * 100

    setIsDrawing(false)
    setDrawStart(null)

    // 校验最小尺寸
    if (widthPercent < 0.5 || heightPercent < 0.5) {
      toast.warning('框选区域太小，请重新框选一个更大的区域')
      setDrawingRect(null)
      return
    }

    handleDrawingComplete({ xPercent, yPercent, widthPercent, heightPercent })
  }

  /** 框选完成 → 裁剪 + 上传 + 创建热区 */
  const handleDrawingComplete = async (rect: {
    xPercent: number
    yPercent: number
    widthPercent: number
    heightPercent: number
  }) => {
    setIsCropping(true)
    try {
      // 1. 从背景图裁剪矩形区域
      const bgUrl = scene!.imageUrl.startsWith('/')
        ? `http://localhost:8080${scene!.imageUrl}`
        : scene!.imageUrl
      const { blob: croppedBlob, naturalWidth, naturalHeight } = await cropImageFromBackground(
        bgUrl,
        rect.xPercent,
        rect.yPercent,
        rect.widthPercent,
        rect.heightPercent
      )

      // 2. 智能抠图（如果已启用）：从矩形裁剪图中提取主体物品并优化边缘
      let finalBlob: Blob = croppedBlob
      let finalXPercent = rect.xPercent
      let finalYPercent = rect.yPercent
      let finalWidthPercent = rect.widthPercent
      let finalHeightPercent = rect.heightPercent

      if (smartExtraction) {
        setExtractionProgress(0)
        try {
          // AI 背景移除
          const removalResult = await removeImageBackground(
            croppedBlob,
            (progress) => setExtractionProgress(progress)
          )

          // 核心优化：裁切透明边缘像素并进行 Alpha 边缘盒模糊（羽化）平滑
          const trimResult = await trimAndSmoothCutout(removalResult.blob)
          finalBlob = trimResult.blob

          // 重算热区坐标，确保定位边框与实际去背景物体完美贴合
          const sx = Math.round((rect.xPercent / 100) * naturalWidth)
          const sy = Math.round((rect.yPercent / 100) * naturalHeight)
          const finalSx = sx + trimResult.dx
          const finalSy = sy + trimResult.dy
          
          finalXPercent = (finalSx / naturalWidth) * 100
          finalYPercent = (finalSy / naturalHeight) * 100
          finalWidthPercent = (trimResult.dw / naturalWidth) * 100
          finalHeightPercent = (trimResult.dh / naturalHeight) * 100
        } catch (err) {
          console.warn('智能抠图失败，回退到矩形裁剪图', err)
          // 抠图失败时静默回退，使用原裁剪图
          finalBlob = croppedBlob
        }
      }

      // 3. 上传最终 of the 物品图
      const formData = new FormData()
      formData.append('file', finalBlob, `crop-${Date.now()}.png`)
      const uploadRes = await apiClient.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (uploadRes.data.code !== 200 && uploadRes.data.code !== 0) {
        throw new Error(uploadRes.data.msg || '裁剪图上传失败')
      }
      const croppedImageUrl: string = uploadRes.data.data.fileUrl

      // 4. 创建热区
      const hotspotRes = await apiClient.post('/admin/scenes/hotspots', {
        sceneId: Number(sceneId),
        itemName: '未命名物品',
        itemImageUrl: croppedImageUrl,
        xPercent: Number(finalXPercent.toFixed(2)),
        yPercent: Number(finalYPercent.toFixed(2)),
        widthPercent: Number(finalWidthPercent.toFixed(2)),
        heightPercent: Number(finalHeightPercent.toFixed(2)),
        hoverTips: '框选裁剪的物品',
        redirectType: 'INTERNAL',
        redirectPath: '/about',
        zoomScale: 3.0,
        sortOrder: 10,
        isVisible: true,
      })

      if (hotspotRes.data.code !== 200 && hotspotRes.data.code !== 0) {
        throw new Error(hotspotRes.data.msg || '创建热区物品失败')
      }

      // 4. 刷新场景数据
      toast.success('框选物品裁剪并上传成功')
      await fetchSceneDetail()

      // 5. 自动选中新创建的热区（通过 ID 匹配）
      // fetchSceneDetail 已清空 activeHotspot，重新获取后选中最后一个
      if (hotspotRes.data?.data?.id) {
        // 通过重新获取场景详情后的列表选中
        const res = await apiClient.get(`/admin/scenes/${sceneId}`)
        if (res.data.code === 200 || res.data.code === 0) {
          const updatedHotspots: HotspotData[] = res.data.data.hotspots || []
          const created = updatedHotspots.find(
            (h) => h.id === hotspotRes.data.data.id
          )
          if (created) {
            setActiveHotspot({ ...created })
            setIsEditMode(true)
          }
          setScene(res.data.data)
        }
      }
    } catch (err: any) {
      console.error('框选裁剪流程失败', err)
      toast.error(err?.message || '裁剪失败，请重试')
    } finally {
      setIsCropping(false)
      setMode('select')
      setDrawingRect(null)
    }
  }

  // ==================== 加载 / 错误状态 ====================

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 gap-4">
        <Spinner size="lg" />
        <span className="text-sm font-heading">载入场景编辑器中...</span>
      </div>
    )
  }

  if (!scene) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl max-w-sm text-center shadow-sm">
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
            目标场景不存在或已被移除。
          </p>
          <button
            onClick={() => router.push('/scenes')}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  const bgImgUrl = scene.imageUrl.startsWith('/')
    ? `http://localhost:8080${scene.imageUrl}`
    : scene.imageUrl

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen text-zinc-600 dark:text-zinc-400 font-body max-w-[1600px] mx-auto text-left">
      {/* 工具栏 */}
      <SceneToolbar
        sceneTitle={scene.title}
        sceneId={scene.id}
        mode={mode}
        onModeChange={setMode}
        onUploadManualSprite={handleUploadManualSprite}
        uploading={uploading}
        smartExtraction={smartExtraction}
        onSmartExtractionChange={setSmartExtraction}
      />

      {/* 主区域：画布 + 属性面板 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* 画布 */}
        <SceneCanvas
          ref={containerRef}
          backgroundImageUrl={bgImgUrl}
          hotspots={scene.hotspots}
          mode={mode}
          activeHotspotId={activeHotspot?.id ?? null}
          drawingRect={drawingRect}
          isDrawing={isDrawing}
          isCropping={isCropping}
          extractionProgress={extractionProgress}
          isExtracting={smartExtraction && isCropping}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onHotspotSelect={handleSelectHotspot}
          onHotspotDragStart={handleDragStart}
          onHotspotResizeStart={handleResizeStart}
          className="xl:col-span-3"
        />

        {/* 属性面板 */}
        <HotspotPropertiesPanel
          hotspot={activeHotspot}
          isEditMode={isEditMode}
          saving={saving}
          uploading={uploading}
          onSave={handleSaveHotspot}
          onDelete={handleDeleteRequest}
          onHotspotChange={setActiveHotspot}
          onSwitchToDraw={() => setMode('draw')}
          hotspotList={scene.hotspots}
          activeHotspotId={activeHotspot?.id ?? null}
          onReplaceImage={handleReplaceImage}
          className="xl:col-span-1"
        />
      </div>

      {/* 隐藏的文件上传 input（备用） */}
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        ref={spriteFileInputRef}
        className="hidden"
      />

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title="确认删除物品"
        description="确定要删除这个热区物品吗？删除后前台该物品将无法交互。"
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
