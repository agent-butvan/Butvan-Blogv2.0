'use client'

import React, { useState, useEffect, useRef } from 'react'
import apiClient from '@/lib/api'
import { Card, Button, Input, Chip, Spinner } from '@heroui/react'
import { MapPin, Upload, Layers, Plus, Check, Eye } from 'lucide-react'
import Link from 'next/link'

interface Scene {
  id: number
  title: string
  imageUrl: string
  isActive: boolean
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  
  // 新建场景状态
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. 获取全部场景列表
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
    fetchScenes()
  }, [])

  // 2. 处理背景大图上传
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

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
        setImageUrl(res.data.data.fileUrl)
      } else {
        alert(res.data.msg || '上传图片失败')
      }
    } catch (err) {
      console.error(err)
      alert('上传接口异常，请确认后端已启动并完成迁移')
    } finally {
      setUploading(false)
    }
  }

  // 3. 提交保存场景
  const handleSubmitScene = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !imageUrl.trim()) {
      alert('请填写场景名称并上传底图')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiClient.post('/admin/scenes', {
        title,
        imageUrl,
        isActive: false // 新建默认不启用
      })
      if (res.data.code === 200 || res.data.code === 0) {
        setTitle('')
        setImageUrl('')
        fetchScenes()
      } else {
        alert(res.data.msg || '保存场景失败')
      }
    } catch (err) {
      console.error(err)
      alert('保存场景失败，服务器内部错误')
    } finally {
      setSubmitting(false)
    }
  }

  // 4. 激活选中场景 (单启用场景互斥)
  const handleActivateScene = async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/scenes/${id}/active`)
      if (res.data.code === 200 || res.data.code === 0) {
        fetchScenes()
      } else {
        alert(res.data.msg || '启用场景失败')
      }
    } catch (err) {
      console.error(err)
      alert('启用场景异常')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto min-h-screen text-[#c9d1d9] font-body">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-white">房间场景管理</h1>
            <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/50 mt-0.5">
              定义沉浸式博客的首页房间大图，叠加透明抠图物品及路由跳转。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Card: Create Scene Form */}
        <div className="lg:col-span-1 bg-[#161b22] border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-divider pb-3">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-white font-heading">上传新房间场景</h2>
          </div>
          
          <form onSubmit={handleSubmitScene} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-neutral-dark/80 dark:text-neutral-light/80">场景名称</label>
              <input
                placeholder="例如：Cozy Workstation"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-neutral-dark/80 dark:text-neutral-light/80">背景底图 URL</label>
              <input
                placeholder="上传图片或直接粘贴外链地址"
                value={imageUrl || ''}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 h-8 text-xs text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* 文件上传触发按钮 */}
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-divider rounded-2xl hover:border-primary/50 transition-all bg-black/10">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUploadImage}
                className="hidden"
              />
              
              {imageUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-divider">
                  <img
                    src={imageUrl.startsWith('/') ? `http://localhost:8080${imageUrl}` : imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-heading"
                    >
                      重新选择
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="font-heading gap-1.5"
                >
                  {uploading ? <Spinner size="sm" color="accent" /> : <><Upload className="w-4 h-4" /> 选择并上传房间大图</>}
                </Button>
              )}
              <span className="text-[10px] text-neutral-dark/50 dark:text-neutral-light/40 mt-2">推荐尺寸：1920x1080 PNG/JPG 图像</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isDisabled={submitting}
              className="font-heading w-full mt-2 flex items-center justify-center"
            >
              {submitting ? <Spinner size="sm" color="accent" /> : '完成场景创建'}
            </Button>
          </form>
        </div>

        {/* Right Cards Grid: Scenes List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-sm font-bold text-white font-heading">当前所有房间场景 ({scenes.length})</h2>
            <Chip size="sm" variant="secondary">全局有且仅有一个激活场景</Chip>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <Spinner color="accent" size="lg" />
              <span className="text-xs text-neutral-dark/50 dark:text-neutral-light/50">读取房间布局数据中...</span>
            </div>
          ) : scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-divider rounded-3xl py-20 bg-[#161b22]/30">
              <MapPin className="w-10 h-10 text-neutral-dark/40 dark:text-neutral-light/30 mb-3" />
              <span className="text-xs text-neutral-dark/50 dark:text-neutral-light/50 font-heading">暂无场景配置。请从左侧栏新建场景</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenes.map((scene) => {
                const previewUrl = scene.imageUrl.startsWith('/') 
                  ? `http://localhost:8080${scene.imageUrl}` 
                  : scene.imageUrl

                return (
                  <div 
                    key={scene.id} 
                    className={`bg-[#161b22] border rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-lg ${
                      scene.isActive ? 'border-primary/50 ring-1 ring-primary/25' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    {/* Scene Image Frame */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      <img 
                        src={previewUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        {scene.isActive ? (
                          <Chip size="sm" color="success" className="font-heading">当前已启用</Chip>
                        ) : (
                          <Chip size="sm" color="default" className="font-heading">已停用</Chip>
                        )}
                      </div>
                    </div>

                    {/* Scene Info */}
                    <div className="p-4 flex flex-col gap-3 flex-grow justify-between text-left">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-dark/40 dark:text-neutral-light/40 font-mono">ID: {scene.id}</span>
                        <h3 className="text-sm font-bold text-white mt-0.5 font-heading">{scene.title}</h3>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-3 border-t border-divider gap-2">
                        {!scene.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateScene(scene.id)}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-heading flex-grow gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> 设为启用
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            isDisabled
                            className="border-emerald-500/20 text-emerald-400/50 font-heading flex-grow opacity-60 cursor-not-allowed"
                          >
                            正在启用中
                          </Button>
                        )}
                        
                        <Link href={`/scenes/${scene.id}`} className="flex-grow flex">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="font-heading w-full gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> 编辑热区物品
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
