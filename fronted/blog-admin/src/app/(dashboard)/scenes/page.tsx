'use client'

import React, { useState, useEffect, useRef } from 'react'
import apiClient from '@/lib/api'
import { resolveAssetUrl } from '@/lib/image-url'
import { toast } from '@/lib/toast'
import { Spinner } from '@heroui/react'
import { MapPin, Upload, Layers, Plus, Check, Eye, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/common/ConfirmModal'
import Portal from '@/components/common/Portal'

interface Scene {
  id: number
  title: string
  imageUrl: string
  isActive: boolean
}

/**
 * 场景列表管理页（v0.3 改进）
 *
 * - 左侧：上传新场景表单
 * - 右侧：场景卡片网格，含删除、激活、编辑入口
 */
export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)

  // 新建场景状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 删除确认
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // 获取全部场景列表
  const fetchScenes = async () => {
    try {
      const res = await apiClient.get('/admin/scenes')
      if (res.data.code === 200 || res.data.code === 0) {
        setScenes(res.data.data || [])
      }
    } catch (err) {
      console.error('获取房间场景列表失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchScenes()
    }, 0)
  }, [])

  // 上传背景大图
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sourceType', 'SCENE')
    formData.append('sourceDetail', '房间场景背景图')
    setUploading(true)
    try {
      const res = await apiClient.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.code === 200 || res.data.code === 0) {
        setImageUrl(res.data.data.fileUrl)
        toast.success('背景底图上传成功')
      } else {
        toast.error(res.data.msg || '上传图片失败')
      }
    } catch {
      toast.error('上传接口异常，请确认后端已启动')
    } finally {
      setUploading(false)
    }
  }

  // 提交保存场景
  const handleSubmitScene = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !imageUrl.trim()) {
      toast.warning('请填写场景名称并上传底图')
      return
    }
    setSubmitting(true)
    try {
      const res = await apiClient.post('/admin/scenes', {
        title,
        imageUrl,
        isActive: false,
      })
      if (res.data.code === 200 || res.data.code === 0) {
        setTitle('')
        setImageUrl('')
        toast.success('场景上传创建成功')
        fetchScenes()
      } else {
        toast.error(res.data.msg || '保存场景失败')
      }
    } catch {
      toast.error('保存场景失败，服务器内部错误')
    } finally {
      setSubmitting(false)
    }
  }

  // 激活场景
  const handleActivateScene = async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/scenes/${id}/active`)
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success('场景启用成功')
        fetchScenes()
      } else {
        toast.error(res.data.msg || '启用场景失败')
      }
    } catch {
      toast.error('服务器运行异常，请稍后再试')
    }
  }

  // 请求删除
  const handleDeleteRequest = (id: number) => {
    setConfirmDeleteId(id)
  }

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    setDeleteLoading(true)
    try {
      const res = await apiClient.delete(`/admin/scenes/${confirmDeleteId}`)
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success('场景删除成功')
        setConfirmDeleteId(null)
        fetchScenes()
      } else {
        toast.error(res.data.msg || '删除场景失败')
      }
    } catch {
      toast.error('删除场景接口异常')
    } finally {
      setDeleteLoading(false)
    }
  }

  /** 解析预览 URL */
  const resolveUrl = resolveAssetUrl



  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto min-h-screen text-zinc-700 dark:text-zinc-350 font-body">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-zinc-900 dark:text-zinc-50">房间场景管理</h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-0.5">
              上传背景大图，框选标记可交互物品，定义沉浸式博客首页体验
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-heading font-medium rounded-lg shadow-sm hover:opacity-90 active:scale-98 transition-all duration-200 cursor-pointer w-full lg:w-auto"
        >
          <Plus size={14} />
          上传新场景
        </button>
      </div>

      {/* 主展示区：场景列表 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-heading text-zinc-900 dark:text-zinc-50 font-bold">
            全部房间场景 ({scenes.length})
          </h2>
          <span className="text-xs text-zinc-550 dark:text-zinc-450 font-heading px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            全局仅能激活一个场景
          </span>
        </div>

        {loading ? (
          /* 骨架屏 */
          <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : scenes.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl py-16 sm:py-20 bg-white dark:bg-zinc-900/20 gap-3 shadow-sm px-4 text-center">
            <MapPin size={36} className="text-zinc-450 dark:text-zinc-400" />
            <p className="text-sm font-heading font-semibold text-zinc-900 dark:text-zinc-50">
              暂无场景配置
            </p>
            <p className="text-xs text-zinc-555 dark:text-zinc-400">
              点击右上角“上传新场景”按钮，创建博客首页房间大图
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenes.map((scene) => {
              const previewUrl = resolveUrl(scene.imageUrl)
              return (
                <div
                  key={scene.id}
                  className={`group bg-white dark:bg-zinc-900/40 border rounded-xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    scene.isActive
                      ? 'border-primary/50 ring-1 ring-primary/25'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* 场景预览图 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-black/20">
                    <img
                      src={previewUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    {/* 状态标签 */}
                    <div className="absolute top-3 left-3 z-10">
                      {scene.isActive ? (
                        <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-heading font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          当前已启用
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900/60 backdrop-blur-xs border border-white/10 text-white font-heading font-medium">
                          已停用
                        </span>
                      )}
                    </div>
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteRequest(scene.id)
                      }}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/45 border border-white/10 text-white hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="删除场景"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* 信息栏 */}
                  <div className="p-4 flex flex-col gap-3 flex-grow justify-between text-left">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-550 dark:text-zinc-400 font-mono">
                        ID: {scene.id}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 font-heading">
                        {scene.title}
                      </h3>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 sm:flex-row sm:items-center">
                      {!scene.isActive ? (
                        <button
                          onClick={() => handleActivateScene(scene.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-heading font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex-1 justify-center cursor-pointer min-h-9"
                        >
                          <Check size={13} /> 设为启用
                        </button>
                      ) : (
                        <span className="flex-1 text-center text-xs text-emerald-600 dark:text-emerald-400 font-heading font-medium flex items-center justify-center gap-1 min-h-9 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          正在启用中
                        </span>
                      )}
                      <Link
                        href={`/scenes/${scene.id}`}
                        className="flex-1"
                      >
                        <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-heading font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full justify-center cursor-pointer min-h-9">
                          <Eye size={13} /> 编辑物品
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 新建场景弹窗 (Modal) */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-fade-in"
              onClick={() => {
                if (!submitting && !uploading) {
                  setShowCreateModal(false)
                }
              }}
            />

            {/* 弹窗内容 */}
            <div className="relative z-10 w-full max-w-md mx-4 sm:my-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-2xl shadow-xl animate-slide-up flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[auto]">
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-heading">上传新房间场景</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting || uploading}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    await handleSubmitScene(e)
                    setShowCreateModal(false)
                  }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-heading font-medium text-zinc-700 dark:text-zinc-300">
                      场景名称
                    </label>
                    <input
                      placeholder="例如：Cozy Workstation"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-heading font-medium text-zinc-700 dark:text-zinc-300">
                      背景底图 URL
                    </label>
                    <input
                      placeholder="上传图片或直接粘贴外链地址"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>

                  {/* 文件上传 */}
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-primary/50 transition-all bg-zinc-50/50 dark:bg-zinc-950/20">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                      className="hidden"
                    />
                    {imageUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <img
                          src={resolveUrl(imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer min-h-9"
                          >
                            重新选择
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-heading hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm min-h-10 w-full"
                      >
                        {uploading ? (
                          <Spinner size="sm" />
                        ) : (
                          <Upload size={14} />
                        )}
                        选择并上传房间大图
                      </button>
                    )}
                    <span className="text-xs text-zinc-550 dark:text-zinc-400 mt-2 font-mono">
                      推荐 3840×2160（4K）PNG/JPG，最低 2560×1440
                    </span>
                  </div>

                  <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                    <button
                      type="button"
                      disabled={submitting || uploading}
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-heading hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploading || !title.trim() || !imageUrl.trim()}
                      className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-heading font-medium hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {submitting ? (
                        <Spinner size="sm" />
                      ) : (
                        '完成创建'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title="确认删除场景"
        description="删除场景将同时清理该场景下的全部热区物品配置。此操作不可撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

/** 骨架屏卡片 */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden animate-skeleton-pulse shadow-sm">
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800/40" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="flex gap-2 mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800/40 rounded-lg" />
          <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800/40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
