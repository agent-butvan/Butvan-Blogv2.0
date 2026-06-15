'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Save, Trash2, Upload, HelpCircle, SquareDashed } from 'lucide-react'
import type { HotspotData } from './SceneCanvas'
import { fetchClientRoutes, fetchArticlesSimple, fetchCategoriesSimple } from '@/lib/client-route-api'
import type { ClientRoute, ArticleSimple, CategorySimple } from '@/types/route'

/** 热区属性面板 Props */
interface HotspotPropertiesPanelProps {
  /** 当前选中的热区（null 表示未选中） */
  hotspot: HotspotData | null
  /** 是否为编辑已存在项（false 为新建） */
  isEditMode: boolean
  /** 是否正在保存 */
  saving: boolean
  /** 是否正在上传 */
  uploading: boolean
  /** 保存回调 */
  onSave: () => void
  /** 删除回调 */
  onDelete: (id?: number) => void
  /** 选中热区变更（热区列表点击） */
  onHotspotChange: (hotspot: HotspotData) => void
  /** 切换到框选模式 */
  onSwitchToDraw: () => void
  /** 热区列表 */
  hotspotList: HotspotData[]
  /** 已选中的热区 ID */
  activeHotspotId: number | null
  /** 替换物品图（上传文件） */
  onReplaceImage: (file: File) => void
  /** 外部 class */
  className?: string
}

/**
 * 热区属性编辑面板（右侧栏）
 *
 * 未选中热区时显示引导卡片；
 * 选中后展示物品图预览、坐标、跳转设置等表单。
 */
export default function HotspotPropertiesPanel({
  hotspot,
  isEditMode,
  saving,
  uploading,
  onSave,
  onDelete,
  onHotspotChange,
  onSwitchToDraw,
  hotspotList,
  activeHotspotId,
  onReplaceImage,
  className = '',
}: HotspotPropertiesPanelProps) {
  const replaceFileInputRef = useRef<HTMLInputElement>(null)

  // --- 跳转目标下拉框数据 ---
  const [clientRoutes, setClientRoutes] = useState<ClientRoute[]>([])
  const [articles, setArticles] = useState<ArticleSimple[]>([])
  const [categories, setCategories] = useState<CategorySimple[]>([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isCustomPath, setIsCustomPath] = useState(false)

  // --- 加载下拉框数据 ---
  useEffect(() => {
    setTimeout(() => {
      setRoutesLoading(true)
      fetchClientRoutes()
        .then(setClientRoutes)
        .catch(() => setClientRoutes([]))
        .finally(() => setRoutesLoading(false))
    }, 0)
  }, [])

  useEffect(() => {
    if (!hotspot) return
    setTimeout(() => {
      // 按需懒加载：仅首次切换到对应类型时请求
      if (hotspot.redirectType === 'ARTICLE' && articles.length === 0 && !articlesLoading) {
        setArticlesLoading(true)
        fetchArticlesSimple()
          .then(setArticles)
          .catch(() => setArticles([]))
          .finally(() => setArticlesLoading(false))
      }
      if (hotspot.redirectType === 'CATEGORY' && categories.length === 0 && !categoriesLoading) {
        setCategoriesLoading(true)
        fetchCategoriesSimple()
          .then(setCategories)
          .catch(() => setCategories([]))
          .finally(() => setCategoriesLoading(false))
      }
    }, 0)
  }, [hotspot?.redirectType, articles.length, articlesLoading, categories.length, categoriesLoading, hotspot])

  /** 解析图片 URL */
  const resolveUrl = (url: string) =>
    url.startsWith('/') ? `http://localhost:8080${url}` : url

  /** 触发替换图片 */
  const handleReplaceClick = () => {
    replaceFileInputRef.current?.click()
  }

  /** 文件选中 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    onReplaceImage(files[0])
    e.target.value = ''
  }

  return (
    <div
      className={`flex flex-col gap-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm ${className}`}
    >
      {/* 热区列表 */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xs font-heading text-zinc-900 dark:text-zinc-50 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          物品列表 ({hotspotList.length})
        </h2>
        <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          {hotspotList.length === 0 ? (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center py-4">
              暂无物品，请框选添加
            </p>
          ) : (
            hotspotList.map((h) => (
              <div
                key={h.id}
                onClick={() => onHotspotChange(h)}
                className={`px-3 py-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                  activeHotspotId === h.id
                    ? 'border-primary/60 bg-primary/10 text-primary font-semibold'
                    : 'border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate">{h.itemName}</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 ml-1 shrink-0">
                  z:{h.sortOrder}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 未选中热区时：引导卡片 */}
      {!hotspot ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 gap-3 shadow-inner">
          <HelpCircle size={24} className="text-zinc-400 dark:text-zinc-500" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center px-4 leading-relaxed">
            选择已有物品编辑属性，或
            <br />
            进入框选模式在场景上拖拽框选新物品
          </p>
          <button
            onClick={onSwitchToDraw}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-heading hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <SquareDashed size={13} />
            开始框选
          </button>
        </div>
      ) : (
        /* 选中热区：属性表单 */
        <div className="flex flex-col gap-4 text-left">
          {/* 标题行 */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <span className="text-xs font-heading text-zinc-900 dark:text-zinc-50 font-bold">
              {isEditMode ? '⚙️ 编辑物品属性' : '✨ 新物品配置'}
            </span>
            <button
              onClick={() => onDelete(hotspot.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-500/20 text-red-500 hover:text-white dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-500/10 hover:border-red-500 transition-colors text-[10px] font-heading cursor-pointer"
            >
              <Trash2 size={11} /> 删除
            </button>
          </div>

          {/* 物品图预览 + 替换 */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
              物品图预览
            </label>
            {hotspot.itemImageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">
                <img
                  src={resolveUrl(hotspot.itemImageUrl)}
                  alt={hotspot.itemName}
                  className="w-full h-full object-contain"
                />
                {/* 替换按钮浮层 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    ref={replaceFileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={handleReplaceClick}
                    disabled={uploading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-heading hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-sm"
                  >
                    {uploading ? '上传中...' : <><Upload size={11} /> 替换物品图</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-center">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  物品暂无图片
                </span>
              </div>
            )}
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-sans">
              可上传手动抠好的透明 PNG 替换自动裁剪图，获得更纯净的悬浮效果
            </span>
          </div>

          {/* 物品名称 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
              物品展示名称
            </label>
            <input
              placeholder="例如：我的电脑"
              value={hotspot.itemName || ''}
              onChange={(e) =>
                onHotspotChange({ ...hotspot, itemName: e.target.value })
              }
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* 百分比坐标 */}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['X 左边界 (%)', 'xPercent'],
                ['Y 上边界 (%)', 'yPercent'],
                ['W 宽度 (%)', 'widthPercent'],
                ['H 高度 (%)', 'heightPercent'],
              ] as [string, string][]
            ).map(([label, key]) => (
              <div className="flex flex-col gap-1" key={key}>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {label}
                </label>
                <input
                  value={
                    key === 'heightPercent'
                      ? (hotspot.heightPercent?.toString() ?? '')
                      : String((hotspot as unknown as Record<string, unknown>)[key] ?? '')
                  }
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value)
                    onHotspotChange({ ...hotspot, [key]: val })
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 h-7 text-[11px] text-zinc-900 dark:text-zinc-100 text-center font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            ))}
          </div>

          {/* 跳转类型 & 路径 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
                跳转类型
              </label>
              <select
                value={hotspot.redirectType}
                onChange={(e) => {
                  setIsCustomPath(false)
                  onHotspotChange({ ...hotspot, redirectType: e.target.value })
                }}
                className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full h-8 cursor-pointer transition-all"
              >
                <option value="INTERNAL" className="bg-white dark:bg-zinc-900">站内路径</option>
                <option value="EXTERNAL" className="bg-white dark:bg-zinc-900">外链 URL</option>
                <option value="ARTICLE" className="bg-white dark:bg-zinc-900">关联文章</option>
                <option value="CATEGORY" className="bg-white dark:bg-zinc-900">关联分类</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
                {hotspot.redirectType === 'ARTICLE' ? '选择文章' :
                 hotspot.redirectType === 'CATEGORY' ? '选择分类' :
                 hotspot.redirectType === 'INTERNAL' ? '选择页面路径' : '输入 URL'}
              </label>
              {/* INTERNAL：路径下拉框 + 手动输入兜底 */}
              {hotspot.redirectType === 'INTERNAL' && !isCustomPath ? (
                <select
                  value={hotspot.redirectPath || ''}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomPath(true)
                      return
                    }
                    onHotspotChange({ ...hotspot, redirectPath: e.target.value })
                  }}
                  className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full h-8 cursor-pointer transition-all"
                  disabled={routesLoading}
                >
                  <option value="">{routesLoading ? '加载中...' : '请选择路径...'}</option>
                  {['页面', '动态路由'].map(cat => {
                    const items = clientRoutes.filter(r => r.category === cat)
                    if (items.length === 0) return null
                    return (
                      <optgroup key={cat} label={`── ${cat} ──`}>
                        {items.map(r => (
                          <option key={r.path} value={r.path}>
                            {r.dynamic ? '✱ ' : ''}{r.label} — {r.path}
                          </option>
                        ))}
                      </optgroup>
                    )
                  })}
                  <option value="__custom__">✏️ 手动输入自定义路径...</option>
                </select>
              ) : hotspot.redirectType === 'INTERNAL' && isCustomPath ? (
                <div className="flex gap-1">
                  <input
                    placeholder="/guestbook"
                    value={hotspot.redirectPath || ''}
                    onChange={(e) =>
                      onHotspotChange({ ...hotspot, redirectPath: e.target.value })
                    }
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomPath(false)}
                    className="px-2 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    title="返回列表选择"
                  >
                    📋
                  </button>
                </div>
              ) : null}
              {/* EXTERNAL：外链文本输入 */}
              {hotspot.redirectType === 'EXTERNAL' ? (
                <input
                  placeholder="https://example.com"
                  value={hotspot.redirectPath || ''}
                  onChange={(e) =>
                    onHotspotChange({ ...hotspot, redirectPath: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              ) : null}
              {/* ARTICLE：文章下拉框 */}
              {hotspot.redirectType === 'ARTICLE' ? (
                <select
                  value={hotspot.redirectTargetId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined
                    const article = articles.find(a => a.id === id)
                    onHotspotChange({
                      ...hotspot,
                      redirectTargetId: id,
                      redirectPath: article ? `/articles/${article.slug}` : hotspot.redirectPath,
                    })
                  }}
                  className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full h-8 cursor-pointer transition-all"
                  disabled={articlesLoading}
                >
                  <option value="">
                    {articlesLoading ? '加载中...' : articles.length === 0 ? '暂无已发布文章' : '请选择文章...'}
                  </option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} (ID:{a.id})
                    </option>
                  ))}
                </select>
              ) : null}
              {/* CATEGORY：分类下拉框 */}
              {hotspot.redirectType === 'CATEGORY' ? (
                <select
                  value={hotspot.redirectTargetId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined
                    const category = categories.find(c => c.id === id)
                    onHotspotChange({
                      ...hotspot,
                      redirectTargetId: id,
                      redirectPath: category ? `/categories/${category.slug}` : hotspot.redirectPath,
                    })
                  }}
                  className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full h-8 cursor-pointer transition-all"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? '加载中...' : categories.length === 0 ? '暂无可见分类' : '请选择分类...'}
                  </option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          {/* 悬浮提示 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
              悬浮提示文案
            </label>
            <input
              placeholder="悬停显示的说明文字"
              value={hotspot.hoverTips || ''}
              onChange={(e) =>
                onHotspotChange({ ...hotspot, hoverTips: e.target.value })
              }
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* 缩放倍率 & z-index */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
                镜头缩放倍率
              </label>
              <input
                type="number"
                step="0.1"
                value={hotspot.zoomScale}
                onChange={(e) =>
                  onHotspotChange({ ...hotspot, zoomScale: Number(e.target.value) })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-heading font-medium text-zinc-500 dark:text-zinc-400">
                层级 (z-index)
              </label>
              <input
                type="number"
                value={hotspot.sortOrder}
                onChange={(e) =>
                  onHotspotChange({ ...hotspot, sortOrder: Number(e.target.value) })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* 可见性 */}
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              前台显示
            </span>
            <select
              value={hotspot.isVisible ? 'true' : 'false'}
              onChange={(e) =>
                onHotspotChange({ ...hotspot, isVisible: e.target.value === 'true' })
              }
              className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary w-20 h-7 cursor-pointer transition-all"
            >
              <option value="true" className="bg-white dark:bg-zinc-900">显示</option>
              <option value="false" className="bg-white dark:bg-zinc-900">隐藏</option>
            </select>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-heading font-medium hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-98 transition-all cursor-pointer"
          >
            {saving ? (
              '保存中...'
            ) : (
              <>
                <Save size={14} /> 保存物品配置
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
