'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button, Spinner } from '@heroui/react'
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
import { resolveImageUrl, API_BASE } from '@/lib/image-url'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'
import gsap from 'gsap'

// ==================== 本地类型定义 ====================

interface TagItem {
  id: number
  name: string
  slug: string
}

interface ArticleItem {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  coverImageUrl: string
  publishedAt: string
  viewCount: number
  isPinned: boolean
  isFeatured: boolean
  categoryId: number
  categoryName: string
  tags?: TagItem[]
  wordCount: number
  readTime: number
  isAllowComment?: boolean
}

interface CategoryItem {
  id: number
  name: string
  slug: string
}

/**
 * 前台文章列表页组件
 *
 * 实现了紧凑优雅的静谧深海视觉风格。
 * 具备分类筛选、标签筛选、分页以及 API 数据加载与 Mock 数据降级的双通道安全模式。
 */
export default function ArticleListPage() {
  // 状态定义
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  
  // 过滤与分页状态
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  
  // 加载与错误状态
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
   * 从后端获取分类与标签列表
   */
  const loadFilterData = async () => {
    try {
      // 1. 获取分类
      const catRes = await fetch(`${API_BASE}/categories/simple`, { cache: 'no-store' })
      if (catRes.ok) {
        const catJson = await catRes.json()
        if (catJson.code === 200 || catJson.code === 0) {
          setCategories(catJson.data || [])
        }
      }

      // 2. 获取标签
      const tagRes = await fetch(`${API_BASE}/tags/simple`, { cache: 'no-store' })
      if (tagRes.ok) {
        const tagJson = await tagRes.json()
        if (tagJson.code === 200 || tagJson.code === 0) {
          setTags(tagJson.data || [])
        }
      }
    } catch (err) {
      console.warn('获取筛选数据失败', err)
    }
  }

  /**
   * 拉取已发布的文章列表，支持过滤和分页
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
      const res = await fetch(`${API_BASE}/articles?${params.toString()}`, { cache: 'no-store' })
      
      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`)
      }
      
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        const data = json.data
        if (data) {
          setArticles(data.content || [])
          setTotalPages(data.totalPages || 1)
          setTotalCount(data.totalElements || 0)
        } else {
          setArticles([])
          setTotalPages(1)
          setTotalCount(0)
        }
      } else {
        throw new Error(json.msg || '后端返回异常')
      }
    } catch (err) {
      console.warn('获取文章列表失败:', err instanceof Error ? err.message : String(err))
      setError('获取文章列表失败，请稍后再试')
      setArticles([])
      setTotalPages(1)
      setTotalCount(0)
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

  // 1. 页头与过滤器仅在页面首次加载挂载时执行一次入场动画，此后状态在过滤/分页时不受影响
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-header-item', 
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' }
      )
      gsap.fromTo('.animate-filter-item',
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.25 }
      )
    })

    return () => ctx.revert()
  }, [])

  // 2. 每次文章列表（数据）变动时，仅让文章列表和分页器播放入场动画
  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-list-item',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      )
      gsap.fromTo('.animate-pagination',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.3 }
      )
    })

    return () => ctx.revert()
  }, [loading, articles])


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
    <main className="relative min-h-[calc(100vh+250px)] w-full bg-transparent text-zinc-900 dark:text-zinc-50 font-body selection:bg-[#727BBA]/20 transition-colors duration-200 flex flex-col justify-between items-center">
      {/* 顶部动态主导航栏 */}
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* 顶部极简居中人文页头 */}
      <header className="relative w-full max-w-5xl px-4 pt-20 pb-8 text-center flex flex-col items-center select-none">
        <div className="relative flex flex-col items-center">
          <span className="animate-header-item opacity-0 absolute -top-4 -right-10 [writing-mode:vertical-rl] text-[9px] font-serif font-bold text-[#727BBA]/60 dark:text-[#727BBA]/50 tracking-[0.3em] uppercase border-r border-[#727BBA]/20 pr-1 h-10">
            ARCHIVE
          </span>

          <h1 className="animate-header-item opacity-0 text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-[0.1em] flex items-center gap-2">
            文章归档
          </h1>

          {/* 极简点线修饰 */}
          <div className="animate-header-item opacity-0 flex items-center gap-2 mt-3">
            <div className="w-1 h-1 rounded-full bg-[#727BBA]/40"></div>
            <div className="w-12 h-px bg-[#727BBA]/20"></div>
            <div className="w-1 h-1 rounded-full bg-[#727BBA]/40"></div>
          </div>
        </div>

        <p className="animate-header-item opacity-0 mt-5 font-serif italic text-sm md:text-base text-[#727BBA] dark:text-[#8E97D5] tracking-wide font-medium">
          文字是思考的锚点
        </p>

        <div className="animate-header-item opacity-0 mt-4 flex items-start gap-2 max-w-lg mx-auto">
          <span className="text-[#727BBA]/40 font-serif text-lg leading-none">“</span>
          <p className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200 font-serif text-center italic font-medium">
            按时间顺序排布的思考、笔记与技术沉淀。在这里，你可以找到所有历史文章的快照。
          </p>
          <span className="text-[#727BBA]/40 font-serif text-lg leading-none self-end">”</span>
        </div>
      </header>

      {/* 主体筛选区与文章列表 (保证充盈 100vh 视口空间) */}
      <section className="w-full max-w-5xl px-6 py-8 flex-1 min-h-[calc(100vh-14rem)] flex flex-col justify-between">
        
        {/* 1. 高级过滤器 (分类 & 标签) - 极简人文字标流设计 */}
        <div className="flex flex-col gap-6 py-6 px-4 border-b border-zinc-200/50 dark:border-zinc-800/40 text-left w-full max-w-3xl mx-auto">
          {/* 分类筛选 */}
          <div className="animate-filter-item opacity-0 flex flex-wrap items-baseline gap-y-3 select-none">
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
          <div className="animate-filter-item opacity-0 flex flex-wrap items-baseline gap-y-3 select-none">
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
        {error ? (
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
        ) : loading && articles.length === 0 ? (
          /* ================= 骨架屏局部加载状态 (仅在首次无数据加载时展示) ================= */
          <div className="flex flex-col gap-8 text-left w-full max-w-3xl mx-auto animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3.5 px-6 py-6 sm:px-8 sm:py-7 border-b border-zinc-200/30 dark:border-zinc-800/30 last:border-0 w-full"
              >
                {/* 标题骨架 */}
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                
                {/* 描述摘要骨架 */}
                <div className="space-y-2 mt-2">
                  <div className="h-4 w-full bg-zinc-200/60 dark:bg-zinc-800/50 rounded-md" />
                  <div className="h-4 w-5/6 bg-zinc-200/60 dark:bg-zinc-800/50 rounded-md" />
                </div>
                
                {/* 元数据行骨架 */}
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-850 rounded-md" />
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-850 rounded-md" />
                  <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-850 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : !loading && articles.length === 0 ? (
          /* ================= 空数据状态 (极简文字流设计，杜绝卡片式布局) ================= */
          <div className="py-24 flex flex-col items-center justify-center text-center select-none animate-header-item">
            <p className="text-sm font-serif italic text-zinc-400 dark:text-zinc-500 tracking-wider">
              暂无相关文章
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 text-[11px] text-[#727BBA] hover:text-[#727BBA]/85 font-semibold tracking-wider underline underline-offset-4 cursor-pointer transition-colors"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          /* ================= 正常渲染文章列表 (当有数据时，loading 状态仅作柔和变暗过渡) ================= */
          <div className="flex flex-col gap-8 text-left w-full max-w-3xl mx-auto">
            <div 
              ref={containerRef}
              onMouseLeave={handleMouseLeave}
              className={`flex flex-col relative isolate w-full transition-all duration-300 ${
                loading ? 'opacity-35 blur-[0.5px] pointer-events-none' : 'opacity-100'
              }`}
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
                    className="animate-list-item opacity-0 rounded-2xl transition-colors duration-300"
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
                      <p className="text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed line-clamp-2 font-serif font-medium">
                        {article.summary || '暂无摘要'}
                      </p>

                      {/* 元数据行 */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 font-mono sm:gap-x-6">
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
              <div className="animate-pagination opacity-0 flex justify-center items-center gap-1.5 mt-8 select-none">
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
      
      {/* 全站统一页脚 */}
      <Footer />
    </main>
  )
}
