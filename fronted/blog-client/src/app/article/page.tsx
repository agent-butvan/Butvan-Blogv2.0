'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button, Chip, Spinner } from '@heroui/react'
import { 
  FileText, 
  Calendar, 
  Eye, 
  Tag as TagIcon, 
  FolderOpen, 
  ChevronRight, 
  AlertCircle, 
  Inbox, 
  ArrowLeft,
  Sparkles,
  Heart,
  Pin,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/image-url'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'

// ==================== 数据接口定义 ====================

interface Article {
  id: number
  title: string
  slug: string
  summary: string
  coverImageUrl: string
  publishedAt: string
  viewCount: number
  isPinned: boolean
  isFeatured: boolean
  categoryName?: string
  categoryId?: number
  tags?: Array<{ id: number; name: string }>
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

// ==================== 高品质 Mock 数据（降级备用） ====================

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '前端开发', slug: 'frontend' },
  { id: 2, name: '后端架构', slug: 'backend' },
  { id: 3, name: 'AI与算法', slug: 'ai-ml' },
  { id: 4, name: '随笔杂谈', slug: 'life' },
]

const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'Next.js', slug: 'nextjs' },
  { id: 2, name: 'Spring Boot', slug: 'springboot' },
  { id: 3, name: 'PostgreSQL', slug: 'postgresql' },
  { id: 4, name: 'TypeScript', slug: 'typescript' },
  { id: 5, name: 'CSS 魔法', slug: 'css-magic' },
]

const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: '基于 Next.js 16 与 React 19 的个人博客 2.0 视觉重构实战',
    slug: 'nextjs-blog-visual-refactor',
    summary: '本文详细记录了如何利用 Next.js 极速渲染、React 19 的新特性以及透明 PNG 切片，物理重构一个具有沉浸式玻璃拟态效果的个人空间，分享关于镜头缩放与布局抖动优化的经验。',
    coverImageUrl: '/images/mock-cover-1.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    viewCount: 1540,
    isPinned: true,
    isFeatured: true,
    categoryId: 1,
    categoryName: '前端开发',
    tags: [
      { id: 1, name: 'Next.js' },
      { id: 4, name: 'TypeScript' }
    ]
  },
  {
    id: 2,
    title: 'Spring Boot 3.2.5 多环境 YML 配置文件优雅拆解与规范',
    slug: 'springboot-yml-split-standard',
    summary: '随着项目模块的不断增多，单一的 application.yml 会变得越来越臃肿。本文教你如何运用 spring.config.import 将配置优雅地解耦成数据库、安全组件和客户端路由三个独立文件，确保核心结构一目了然。',
    coverImageUrl: '/images/mock-cover-2.jpg',
    publishedAt: '2026-06-14T08:30:00Z',
    viewCount: 890,
    isPinned: false,
    isFeatured: true,
    categoryId: 2,
    categoryName: '后端架构',
    tags: [
      { id: 2, name: 'Spring Boot' }
    ]
  },
  {
    id: 3,
    title: 'PostgreSQL 16 高性能索引优化与 JSONB 复杂查询指南',
    slug: 'postgresql-jsonb-index-performance',
    summary: '结合个人书房系统的操作日志与热区配置扩展字段，深入解析 PostgreSQL 在 JSONB 高频读写及多路关联查询场景下的 GIN 索引设计与优化调优经验。',
    coverImageUrl: '',
    publishedAt: '2026-06-12T15:20:00Z',
    viewCount: 650,
    isPinned: false,
    isFeatured: false,
    categoryId: 2,
    categoryName: '后端架构',
    tags: [
      { id: 3, name: 'PostgreSQL' },
      { id: 4, name: 'TypeScript' }
    ]
  },
  {
    id: 4,
    title: 'Vanilla CSS 配合 CSS 变量实现高级的发光阴影与微动画特效',
    slug: 'vanilla-css-glowing-effect-guide',
    summary: '在大厂规范的 UI 设计中，微动画与色彩系统是用户体验的核心。本文教你如何利用纯 Vanilla CSS 结合 HSL 动态调色板，打造极具呼吸感的按钮发光与卡片边缘悬停微动效。',
    coverImageUrl: '/images/mock-cover-3.jpg',
    publishedAt: '2026-06-10T11:45:00Z',
    viewCount: 1280,
    isPinned: false,
    isFeatured: false,
    categoryId: 1,
    categoryName: '前端开发',
    tags: [
      { id: 5, name: 'CSS 魔法' }
    ]
  },
  {
    id: 5,
    title: '探秘 Transformer 注意力机制：写给前端工程师的 AI 极简通识',
    slug: 'transformer-attention-mechanism-frontend',
    summary: '用最直观的可视化图表与前端开发熟悉的 JavaScript 代码片段，拆解大模型背后的核心 Self-Attention 机制，帮助开发者扫盲 AI 基础认知。',
    coverImageUrl: '',
    publishedAt: '2026-06-08T09:00:00Z',
    viewCount: 420,
    isPinned: false,
    isFeatured: false,
    categoryId: 3,
    categoryName: 'AI与算法',
    tags: [
      { id: 4, name: 'TypeScript' }
    ]
  }
]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

/**
 * 前台文章列表页组件
 *
 * 实现了紧凑优雅的静谧深海视觉风格。
 * 具备分类筛选、标签筛选、分页以及 API 数据加载与 Mock 数据降级的双通道安全模式。
 */
export default function ArticleListPage() {
  // 状态定义
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  
  // 过滤与分页状态
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  
  // 加载与错误状态
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isMocked, setIsMocked] = useState<boolean>(false)

  const pageSize = 6

  // Fluid Hover State 用于单栏列表背景滑动特效
  const [hoverStyle, setHoverStyle] = useState({ top: 0, height: 0, opacity: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const targetRect = e.currentTarget.getBoundingClientRect()
    setHoverStyle({
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
      opacity: 1
    })
  }

  const handleMouseLeave = () => {
    setHoverStyle(prev => ({ ...prev, opacity: 0 }))
  }

  /**
   * 从后端或降级本地 Mock 获取分类与标签列表
   */
  const loadFilterData = async () => {
    try {
      // 1. 获取分类
      const catRes = await fetch(`${API_BASE}/categories/simple`, { cache: 'no-store' })
      if (catRes.ok) {
        const catJson = await catRes.json()
        if (catJson.code === 200 || catJson.code === 0) {
          setCategories(catJson.data || [])
        } else {
          setCategories(MOCK_CATEGORIES)
        }
      } else {
        setCategories(MOCK_CATEGORIES)
      }

      // 2. 获取标签
      const tagRes = await fetch(`${API_BASE}/tags/simple`, { cache: 'no-store' })
      if (tagRes.ok) {
        const tagJson = await tagRes.json()
        if (tagJson.code === 200 || tagJson.code === 0) {
          setTags(tagJson.data || [])
        } else {
          setTags(MOCK_TAGS)
        }
      } else {
        setTags(MOCK_TAGS)
      }
    } catch (err) {
      console.warn('获取筛选数据失败，降级为 Mock 数据', err)
      setCategories(MOCK_CATEGORIES)
      setTags(MOCK_TAGS)
    }
  }

  /**
   * 拉取已发布的文章列表，支持过滤和分页，
   * 如果后端未开启或接口 404 则平滑降级使用 Mock 数据。
   */
  const fetchArticlesList = async () => {
    setLoading(true)
    setError(null)
    
    // 构建 API 请求 Query 参数
    const params = new URLSearchParams()
    params.append('page', (currentPage - 1).toString())
    params.append('size', pageSize.toString())
    if (selectedCategory !== null) {
      params.append('categoryId', selectedCategory.toString())
    }
    if (selectedTag !== null) {
      params.append('tagId', selectedTag.toString())
    }

    try {
      // 尝试调用后端公开 API 接口
      const res = await fetch(`${API_BASE}/articles?${params.toString()}`, { cache: 'no-store' })
      
      if (!res.ok) {
        // HTTP 错误（例如 404/500）触发降级
        throw new Error(`HTTP_${res.status}`)
      }
      
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        // 请求成功
        const data = json.data
        if (data) {
          setArticles(data.content || [])
          setTotalPages(data.totalPages || 1)
          setTotalCount(data.totalElements || 0)
          setIsMocked(false)
        } else {
          setArticles([])
          setTotalPages(1)
          setTotalCount(0)
        }
      } else {
        throw new Error(json.msg || '后端返回异常')
      }
    } catch (err: any) {
      // 连接失败或接口不存在，进入平滑降级机制
      console.warn('获取文章 API 接口不可用或报错，平滑降级使用 Mock 本地数据：', err.message)
      setIsMocked(true)
      
      // 本地对 Mock 数据进行简单的过滤与分页计算
      let filtered = [...MOCK_ARTICLES]
      if (selectedCategory !== null) {
        filtered = filtered.filter(a => a.categoryId === selectedCategory)
      }
      if (selectedTag !== null) {
        filtered = filtered.filter(a => a.tags?.some(t => t.id === selectedTag))
      }
      
      // 计算分页
      const totalElements = filtered.length
      const calculatedPages = Math.max(1, Math.ceil(totalElements / pageSize))
      const startIdx = (currentPage - 1) * pageSize
      const endIdx = startIdx + pageSize
      
      setArticles(filtered.slice(startIdx, endIdx))
      setTotalPages(calculatedPages)
      setTotalCount(totalElements)
    } finally {
      setLoading(false)
    }
  }

  // 挂载时载入过滤器数据与用户资料
  useEffect(() => {
    loadFilterData()
    fetchProfile('butvan').then((data) => {
      setProfile(data)
    })
  }, [])

  // 依赖项变动时拉取文章
  useEffect(() => {
    fetchArticlesList()
  }, [selectedCategory, selectedTag, currentPage])

  /**
   * 重置所有过滤条件为全部状态
   */
  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSelectedTag(null)
    setCurrentPage(1)
  }

  /**
   * 格式化 ISO 日期为更易读的中文格式
   */
  const formatDate = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return isoString
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-[#f6f6f6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-body selection:bg-[#727BBA]/20 transition-colors duration-200 flex flex-col items-center">
      {/* 顶部动态主导航栏 */}
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 顶部极简居中人文页头 */}
      <header className="relative w-full max-w-5xl px-4 pt-16 pb-8 text-center flex flex-col items-center select-none">
        <div className="relative flex flex-col items-center">
          <span className="absolute -top-4 -right-10 [writing-mode:vertical-rl] text-[9px] font-serif font-bold text-[#727BBA]/60 dark:text-[#727BBA]/50 tracking-[0.3em] uppercase border-r border-[#727BBA]/20 pr-1 h-10">
            ARCHIVE
          </span>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-[0.1em] flex items-center gap-2">
            文章归档
            {isMocked && (
              <Chip size="sm" className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-[9px] scale-90 origin-left font-bold font-heading">
                演示数据
              </Chip>
            )}
          </h1>

          {/* 极简点线修饰 */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1 h-1 rounded-full bg-[#727BBA]/40"></div>
            <div className="w-12 h-px bg-[#727BBA]/20"></div>
            <div className="w-1 h-1 rounded-full bg-[#727BBA]/40"></div>
          </div>
        </div>

        <p className="mt-5 font-serif italic text-sm md:text-base text-zinc-700 dark:text-zinc-200 opacity-90 tracking-wide">
          文字是思考的锚点
        </p>

        <div className="mt-4 flex items-start gap-2 max-w-lg mx-auto">
          <span className="text-[#727BBA]/40 font-serif text-lg leading-none">“</span>
          <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-serif text-center italic">
            按时间顺序排布的思考、笔记与技术沉淀。在这里，你可以找到所有历史文章的快照。
          </p>
          <span className="text-[#727BBA]/40 font-serif text-lg leading-none self-end">”</span>
        </div>
      </header>

      {/* 主体筛选区与文章列表 */}
      <section className="w-full max-w-5xl px-6 py-8 flex flex-col gap-8">
        
        {/* 1. 高级过滤器 (分类 & 标签) - 极简人文字标流设计 */}
        <div className="flex flex-col gap-6 py-6 px-4 border-b border-zinc-200/50 dark:border-zinc-800/40 text-left w-full max-w-3xl mx-auto">
          {/* 分类筛选 */}
          <div className="flex flex-wrap items-baseline gap-y-3 select-none">
            <span className="text-[10px] font-heading font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mr-6 w-16 shrink-0 flex items-center gap-1">
              <FolderOpen className="w-3 h-3 text-[#727BBA]/60" /> 分类
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                className={`transition-all duration-200 cursor-pointer ${
                  selectedCategory === null 
                    ? 'text-[#727BBA] font-bold underline underline-offset-4' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className={`transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.id 
                      ? 'text-[#727BBA] font-bold underline underline-offset-4' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 标签筛选 */}
          <div className="flex flex-wrap items-baseline gap-y-3 select-none">
            <span className="text-[10px] font-heading font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mr-6 w-16 shrink-0 flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-[#727BBA]/60" /> 标签
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
              <button
                onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
                className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${
                  selectedTag === null 
                    ? 'bg-[#727BBA]/10 text-[#727BBA] font-bold' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                全部标签
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => { setSelectedTag(tag.id); setCurrentPage(1); }}
                  className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${
                    selectedTag === tag.id 
                      ? 'bg-[#727BBA]/10 text-[#727BBA] font-bold' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 文章列表展示区域 */}
        {loading ? (
          /* ================= 加载状态 (Spinner + 骨架模拟器) ================= */
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" color="accent" />
            <p className="text-xs font-heading text-zinc-400 dark:text-zinc-650 tracking-wider animate-pulse">
              正在加载文章列表，请稍候...
            </p>
          </div>
        ) : error ? (
          /* ================= 错误状态 ================= */
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">文章获取服务异常</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-sm leading-relaxed mb-6">
              未能连接到后端接口服务。请检查您的网络连接或后端 API 是否已部署并正常运作。
            </p>
            <Button size="sm" onClick={fetchArticlesList} className="font-heading rounded-xl px-5 bg-[#727BBA] hover:bg-[#727BBA]/90 text-white shadow-md shadow-[#727BBA]/25">
              重新尝试连接
            </Button>
          </div>
        ) : articles.length === 0 ? (
          /* ================= 空数据状态 ================= */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/60 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-white mb-2">没有筛选到相关文章</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-xs leading-relaxed mb-6">
              当前分类或标签过滤条件下，暂无已发布的文章数据。
            </p>
            <Button size="sm" variant="outline" onClick={handleResetFilters} className="font-heading rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              清除筛选条件
            </Button>
          </div>
        ) : (
          /* ================= 正常渲染文章列表 (极简人文单栏 + Fluid Hover) ================= */
          <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.35s_ease-out] w-full max-w-3xl mx-auto">
            <div 
              ref={containerRef}
              onMouseLeave={handleMouseLeave}
              className="flex flex-col relative isolate w-full"
            >
              {/* Fluid Background 跟随滑块 */}
              <div 
                className="absolute left-0 w-full bg-[#E9EEE8] dark:bg-[#727BBA]/15 rounded-2xl pointer-events-none -z-10 fluid-hover-bg"
                style={{
                  top: `${hoverStyle.top}px`,
                  height: `${hoverStyle.height}px`,
                  opacity: hoverStyle.opacity
                }}
              />

              {articles.map((article, index) => {
                return (
                  <div
                    key={article.id}
                    className="article-enter rounded-2xl transition-colors duration-300"
                    style={{ animationDelay: `${index * 80}ms` }}
                    onMouseEnter={handleMouseEnter}
                  >
                    <Link
                      href={`/article/${article.slug}`}
                      className="group relative flex flex-col gap-3.5 px-6 py-6 sm:px-8 sm:py-7 border-b border-zinc-200/30 dark:border-zinc-800/30 last:border-0 w-full outline-none"
                    >
                      {/* 标题 */}
                      <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#727BBA] transition-colors duration-200 flex items-center gap-2">
                        <span>{article.title}</span>
                        <div className="flex gap-1 shrink-0 items-center">
                          {article.isPinned && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 ml-1.5 align-middle px-1 py-px text-[9px] font-mono font-normal tracking-wider text-[#727BBA]">
                              <Pin size={10} className="rotate-45" />
                              <span className="scale-75 origin-left">置顶</span>
                            </span>
                          )}
                          {article.isFeatured && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 ml-1 align-middle px-1 py-px text-[9px] font-mono font-normal tracking-wider text-[#09B38A]">
                              <Sparkles size={10} />
                              <span className="scale-75 origin-left">精选</span>
                            </span>
                          )}
                        </div>
                      </h2>

                      {/* 描述摘要 */}
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {article.summary || '暂无摘要'}
                      </p>

                      {/* 元数据行 */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-mono sm:gap-x-6">
                        {/* 日期 */}
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} strokeWidth={1.5} />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>

                        {/* 分类 */}
                        {article.categoryName && (
                          <div className="flex items-center gap-1.5">
                            <FolderOpen size={13} strokeWidth={1.5} />
                            <span>{article.categoryName}</span>
                          </div>
                        )}

                        {/* 浏览量 */}
                        <div className="flex items-center gap-1.5">
                          <Eye size={13} strokeWidth={1.5} />
                          <span>{article.viewCount} 次浏览</span>
                        </div>

                        {/* 标签 */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <TagIcon size={12} strokeWidth={1.5} />
                            <div className="flex gap-1.5">
                              {article.tags.slice(0, 3).map(t => (
                                <span key={t.id} className="text-[10px] hover:text-[#727BBA]">
                                  #{t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 外部链接斜向滑显微动效 */}
                        <div className="w-full sm:w-auto sm:ml-auto">
                          <div className="flex items-center gap-1.5 text-zinc-300 hover:text-[#727BBA] dark:text-zinc-700 dark:hover:text-[#727BBA] transition-colors">
                            <span className="opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[10px]">
                              阅读全文
                            </span>
                            <ExternalLink
                              size={12}
                              strokeWidth={1.5}
                              className="opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* 3. 自定义分页控制器 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8 select-none">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  isDisabled={currentPage === 1}
                  className="bg-zinc-150/40 border border-zinc-200/50 dark:bg-zinc-900/60 dark:border-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-xl text-xs font-heading transition-all"
                >
                  上一页
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    size="sm"
                    variant={currentPage === pageNumber ? 'primary' : 'outline'}
                    onClick={() => {
                      setCurrentPage(pageNumber)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`rounded-xl text-xs min-w-8 h-8 font-heading transition-all ${
                      currentPage === pageNumber 
                        ? 'bg-[#727BBA] text-white font-bold shadow-lg shadow-[#727BBA]/25' 
                        : 'bg-zinc-150/40 border border-zinc-200/50 dark:bg-zinc-900/60 dark:border-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                ))}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  isDisabled={currentPage === totalPages}
                  className="bg-zinc-150/40 border border-zinc-200/50 dark:bg-zinc-900/60 dark:border-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-xl text-xs font-heading transition-all"
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
