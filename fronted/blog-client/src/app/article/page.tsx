'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Chip, Spinner } from '@heroui/react'
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
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/image-url'

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

  // 挂载时载入过滤器数据
  useEffect(() => {
    loadFilterData()
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
    <main className="min-h-screen w-screen bg-[#0d1117] text-[#c9d1d9] font-body selection:bg-primary/30 flex flex-col items-center">
      {/* 顶部高端大气的渐变打光 Banner */}
      <section className="w-full max-w-5xl px-6 pt-16 pb-8 border-b border-white/5 relative overflow-hidden flex flex-col gap-4 text-left">
        <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <Link href="/room">
            <Button size="sm" variant="outline" className="bg-white/5 border border-white/10 text-neutral-light hover:bg-white/10 font-heading gap-1.5 rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5" /> 返回房间
            </Button>
          </Link>
          {isMocked && (
            <Chip size="sm" variant="soft" color="warning" className="text-warning-300 border-warning-500/30 text-[10px]">
              演示模式 (已降级)
            </Chip>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            文章归档
            <span className="text-primary text-sm font-normal tracking-widest hidden md:inline ml-2">/ ARCHIVE</span>
          </h1>
          <p className="text-xs md:text-sm text-neutral-light/60 max-w-2xl leading-relaxed">
            在这里，我将沉淀所有的技术积累与思考。包含前端探索、后端高并发架构设计、数据库优化调优及一些零星的个人随笔记录。
          </p>
        </div>
      </section>

      {/* 主体筛选区与文章列表 */}
      <section className="w-full max-w-5xl px-6 py-8 flex flex-col gap-8">
        
        {/* 1. 高级横向滚动过滤器 (分类 & 标签) */}
        <div className="flex flex-col gap-4 bg-[#161b22]/55 border border-white/5 p-5 rounded-3xl backdrop-blur-md shadow-xl text-left">
          
          {/* 分类筛选 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-primary font-heading flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> 文章分类
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'primary' : 'outline'}
                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                className={`font-heading text-xs rounded-xl ${
                  selectedCategory === null ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'text-neutral-light/60 hover:text-white bg-white/5'
                }`}
              >
                全部
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className={`font-heading text-xs rounded-xl ${
                    selectedCategory === cat.id ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'text-neutral-light/60 hover:text-white bg-white/5'
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 装饰分割线 */}
          <div className="w-full h-px bg-white/5 my-1" />

          {/* 标签筛选 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-primary font-heading flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" /> 标签筛选
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                size="md"
                variant={selectedTag === null ? 'primary' : 'soft'}
                onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
                className={`cursor-pointer hover:bg-white/10 transition-all text-xs rounded-lg ${
                  selectedTag === null ? 'bg-primary text-white font-bold' : 'bg-white/5 text-neutral-light/50'
                }`}
              >
                全部标签
              </Chip>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  size="md"
                  variant={selectedTag === tag.id ? 'primary' : 'soft'}
                  onClick={() => { setSelectedTag(tag.id); setCurrentPage(1); }}
                  className={`cursor-pointer hover:bg-white/10 transition-all text-xs rounded-lg ${
                    selectedTag === tag.id ? 'bg-primary text-white font-bold' : 'bg-white/5 text-neutral-light/70'
                  }`}
                >
                  {tag.name}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 文章列表展示区域 */}
        {loading ? (
          /* ================= 加载状态 (Spinner + 骨架模拟器) ================= */
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" color="accent" />
            <p className="text-xs font-heading text-neutral-light/40 tracking-wider animate-pulse">
              正在加载文章列表，请稍候...
            </p>
          </div>
        ) : error ? (
          /* ================= 错误状态 ================= */
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">文章获取服务异常</h3>
            <p className="text-xs text-neutral-light/50 max-w-sm leading-relaxed mb-6">
              未能连接到后端接口服务。请检查您的网络连接或后端 API 是否已部署并正常运作。
            </p>
            <Button size="sm" onClick={fetchArticlesList} className="font-heading rounded-xl px-5">
              重新尝试连接
            </Button>
          </div>
        ) : articles.length === 0 ? (
          /* ================= 空数据状态 ================= */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[#161b22]/30 border border-white/5 rounded-3xl p-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-light/30 mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">没有筛选到相关文章</h3>
            <p className="text-xs text-neutral-light/50 max-w-xs leading-relaxed mb-6">
              当前分类或标签过滤条件下，暂无已发布的文章数据。
            </p>
            <Button size="sm" variant="outline" onClick={handleResetFilters} className="font-heading rounded-xl">
              清除筛选条件
            </Button>
          </div>
        ) : (
          /* ================= 正常渲染文章列表 (网格布局) ================= */
          <div className="flex flex-col gap-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const coverUrl = article.coverImageUrl ? resolveImageUrl(article.coverImageUrl) : null
                
                return (
                  <Card
                    key={article.id}
                    className="border border-white/5 bg-[#161b22]/40 hover:bg-[#161b22]/70 transition-all duration-[400ms] rounded-2xl flex flex-col overflow-hidden h-[410px] hover:scale-[1.015] hover:border-primary/30 group hover:shadow-xl hover:shadow-primary/5"
                  >
                    {/* 文章封面图区域 */}
                    <div className="relative w-full h-44 bg-zinc-900 overflow-hidden shrink-0">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 border-b border-white/5 text-primary/30">
                          <FileText className="w-12 h-12 stroke-[1.2]" />
                        </div>
                      )}
                      
                      {/* 置顶 & 推荐徽章 */}
                      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        {article.isPinned && (
                          <Chip size="sm" color="accent" className="text-white text-[10px] font-bold h-5 shadow-lg shadow-primary/20">
                            置顶
                          </Chip>
                        )}
                        {article.isFeatured && (
                          <Chip size="sm" color="warning" className="text-white text-[10px] font-bold h-5 shadow-lg shadow-warning/20">
                            精选
                          </Chip>
                        )}
                      </div>

                      {/* 分类徽章 */}
                      {article.categoryName && (
                        <div className="absolute bottom-3 right-3 z-10">
                          <Chip size="sm" className="bg-[#0d1117]/80 backdrop-blur-sm border border-white/10 text-neutral-light text-[10px] font-medium h-5">
                            {article.categoryName}
                          </Chip>
                        </div>
                      )}
                    </div>

                    {/* 卡片主体内容 */}
                    <Card.Content className="p-5 flex-1 flex flex-col justify-between text-left">
                      <div className="flex flex-col gap-2 text-left">
                        {/* 发布时间与阅读量 */}
                        <div className="flex items-center gap-4 text-[10px] text-neutral-light/50 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary/70" />
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-primary/70" />
                            {article.viewCount} 次浏览
                          </span>
                        </div>

                        {/* 标题 */}
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-10 text-left">
                          {article.title}
                        </h3>

                        {/* 摘要描述 */}
                        <p className="text-xs text-neutral-light/60 leading-relaxed line-clamp-3 min-h-[54px] text-left">
                          {article.summary}
                        </p>
                      </div>

                      {/* 卡片底栏跳转与标签 */}
                      <div className="border-t border-white/5 pt-3.5 mt-3.5 flex items-center justify-between">
                        {/* 标签列展示 */}
                        <div className="flex gap-1 overflow-hidden max-w-[60%] shrink-0">
                          {article.tags && article.tags.length > 0 ? (
                            article.tags.slice(0, 2).map((t) => (
                              <span key={t.id} className="text-[9px] bg-white/5 border border-white/10 text-neutral-light/80 px-1.5 py-0.5 rounded-md truncate font-mono">
                                #{t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-neutral-light/30 italic">无标签</span>
                          )}
                        </div>

                        {/* 进入阅读按钮 */}
                        <Link href={`/article/${article.slug}`}>
                          <Button size="sm" variant="ghost" className="text-[11px] text-primary hover:text-primary-400 group-hover:gap-1.5 font-bold font-heading p-0 bg-transparent min-w-0 h-auto gap-0.5 transition-all duration-200">
                            阅读正文 <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card.Content>
                  </Card>
                )
              })}
            </div>

            {/* 3. 自定义分页控制器 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8">
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
                  className="bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 font-heading"
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
                    className={`rounded-xl text-xs min-w-8 h-8 font-heading ${
                      currentPage === pageNumber 
                        ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-light'
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
                  className="bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 font-heading"
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
