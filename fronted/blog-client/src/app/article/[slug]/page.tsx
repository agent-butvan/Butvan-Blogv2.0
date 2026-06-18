'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  FolderOpen, 
  Eye, 
  Heart, 
  Coffee, 
  Share2, 
  ChevronRight, 
  Clock, 
  FileText,
  AlertCircle,
  Copy,
  Check,
  X,
  Lock
} from 'lucide-react'
import { Button, Spinner } from '@heroui/react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import HtmlRenderer from '@/components/common/HtmlRenderer'
import CommentSection from '@/components/comment/CommentSection'
import { MOCK_ARTICLES } from '@/lib/mock-data'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'
import type { Article } from '@/lib/mock-data'
import gsap from 'gsap'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

interface TocItem {
  id: string
  text: string
  level: number
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  // 状态定义
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [article, setArticle] = useState<Article | null>(null)
  const [prevArticle, setPrevArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isMocked, setIsMocked] = useState<boolean>(false)

  // 交互状态
  const [liked, setLiked] = useState<boolean>(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [rewardOpen, setRewardOpen] = useState<boolean>(false)
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeTocId, setActiveTocId] = useState<string>('')

  // Ref 定义
  const articleContentRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)

  // 顶部滚动进度条监听
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 获取基本资料与文章详情（双通道降级）
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. 获取用户资料
        const profileData = await fetchProfile('butvan')
        setProfile(profileData)

        // 2. 尝试向后端拉取真实文章详情
        const res = await fetch(`${API_BASE}/articles/${slug}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP_${res.status}`)

        const json = await res.json()
        if (json.code === 200 || json.code === 0) {
          const fetchedArticle = json.data
          if (fetchedArticle) {
            setArticle(fetchedArticle)
            setLikeCount(fetchedArticle.likeCount || 0)
            setIsMocked(false)
            calculatePrevNext(fetchedArticle.id, MOCK_ARTICLES) // 临近文章
          } else {
            throw new Error('未获取到文章内容')
          }
        } else {
          throw new Error(json.msg || '后端加载异常')
        }
      } catch (err: any) {
        console.warn('后端文章详情接口不可用，启用平滑降级使用 Mock 本地数据：', err.message)
        setIsMocked(true)

        // 从全局本地 Mock 中匹配文章
        const matched = MOCK_ARTICLES.find(a => a.slug === slug)
        if (matched) {
          setArticle(matched)
          // 产生一些逼真的随机阅读点赞数
          setLikeCount(Math.floor(matched.viewCount * 0.08) + 12)
          calculatePrevNext(matched.id, MOCK_ARTICLES)
        } else {
          setError('文章不存在或已被作者删除')
        }
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug])

  // 计算上一篇/下一篇
  const calculatePrevNext = (currentId: number, allArticles: Article[]) => {
    const sorted = [...allArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    const index = sorted.findIndex(a => a.id === currentId)
    if (index !== -1) {
      setNextArticle(index > 0 ? sorted[index - 1] : null) // 较新的为下一篇
      setPrevArticle(index < sorted.length - 1 ? sorted[index + 1] : null) // 较旧的为上一篇
    }
  }

  // 1. 动态生成目录 TOC 并绑定随屏点亮 Observer
  useEffect(() => {
    if (loading || !article || !articleContentRef.current) return

    const timer = setTimeout(() => {
      if (!articleContentRef.current) return
      const contentDiv = articleContentRef.current

      // 动态生成目录 TOC
      const headings = contentDiv.querySelectorAll('h2, h3')
      const tocItems: TocItem[] = []
      
      headings.forEach((heading, idx) => {
        const level = parseInt(heading.tagName.substring(1), 10)
        let id = heading.id
        if (!id) {
          id = `toc-heading-${idx}`
          heading.id = id
        }
        tocItems.push({
          id,
          text: (heading as HTMLElement).innerText || '',
          level
        })
      })
      setToc(tocItems)

      // Intersection Observer 大纲目录随屏滚动点亮
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id)
          }
        })
      }, observerOptions)

      headings.forEach(h => observer.observe(h))

      // 临时存储以便清理
      ;(contentDiv as any)._observer = observer
      ;(contentDiv as any)._headings = headings
    }, 50)

    return () => {
      clearTimeout(timer)
      const contentDiv = articleContentRef.current
      if (contentDiv) {
        const observer = (contentDiv as any)._observer
        const headings = (contentDiv as any)._headings
        if (observer && headings) {
          headings.forEach((h: any) => observer.unobserve(h))
          observer.disconnect()
        }
      }
    }
  }, [loading, article])

  // 2. 原来的原生 DOM 代码块高亮增强已移去，目前完全由 HtmlRenderer 与 React 虚拟 DOM 驱动

  // GSAP 入场整体错落动效
  useEffect(() => {
    if (loading || !article) return

    const ctx = gsap.context(() => {
      // 错落向上淡入页头、左边栏、正文、右侧目录
      gsap.fromTo('.animate-detail-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      )
    })

    return () => ctx.revert()
  }, [loading, article])

  // GSAP 点赞比心微动效
  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)

      // 比心弹性缩放和晃动
      if (heartRef.current) {
        gsap.timeline()
          .to(heartRef.current, { scale: 1.35, rotation: -12, duration: 0.15, ease: 'power1.out' })
          .to(heartRef.current, { scale: 0.9, rotation: 8, duration: 0.1 })
          .to(heartRef.current, { scale: 1.15, rotation: -4, duration: 0.1 })
          .to(heartRef.current, { scale: 1, rotation: 0, duration: 0.15, ease: 'power2.out' })
      }
    }
  }

  // 格式化日期
  const formatDate = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return isoString
    }
  }

  // 处理目录点击平滑滚动
  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      const navbarHeight = 70
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
      setActiveTocId(id)
    }
  }

  // 复制当前页面链接分享
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('文章链接已成功复制到剪贴板，快去分享给朋友吧！')
    } catch (err) {
      console.error('链接分享复制失败', err)
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-[#f6f6f6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-body transition-colors duration-200 flex flex-col items-center">
      {/* 顶部主导航 */}
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂 */}
      <SidebarWidget />

      {/* 沉浸式阅读进度指示条 */}
      <div 
        className="fixed top-0 left-0 h-[2.5px] bg-[#727BBA] shadow-[0_0_8px_rgba(114,123,186,0.6)] z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 主体布局架构 */}
      <div className="w-full max-w-5xl px-6 py-10 flex flex-col gap-6">
        

        {loading ? (
          /* ================= 加载状态 ================= */
          <div className="py-36 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" color="accent" />
            <p className="text-xs font-heading text-zinc-400 dark:text-zinc-600 tracking-wider animate-pulse">
              正在加载文章详情，请稍候...
            </p>
          </div>
        ) : error || !article ? (
          /* ================= 异常状态 ================= */
          <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">无法加载文章</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-6">
              {error || '加载异常，找不到相关文章内容。'}
            </p>
            <Button size="sm" onClick={() => router.push('/article')} className="font-heading rounded-xl px-5 bg-[#727BBA] text-white">
              返回文章列表
            </Button>
          </div>
        ) : (
          /* ================= 详情核心渲染 ================= */
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-[auto_1fr_210px] gap-8 items-start justify-center">
            
            {/* 1. PC端左侧 Sticky 悬浮控制操作栏 */}
            <aside className="hidden lg:flex sticky top-28 flex-col items-center gap-5 w-12 z-20 animate-detail-item opacity-0 select-none">
              {/* 点赞比心 */}
              <div className="flex flex-col items-center gap-1">
                <button
                  ref={heartRef}
                  onClick={handleLike}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                    liked 
                      ? 'bg-rose-50/80 border-rose-200 text-rose-500 shadow-md shadow-rose-500/10 dark:bg-rose-950/20 dark:border-rose-900/40' 
                      : 'bg-white/70 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-950'
                  }`}
                  title="点赞"
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} className="transition-colors" />
                </button>
                <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">{likeCount}</span>
              </div>

              {/* 扫码赞赏 */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setRewardOpen(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA] hover:border-[#727BBA]/40 transition-all cursor-pointer"
                  title="赞赏作者"
                >
                  <Coffee size={15} />
                </button>
                <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">赞赏</span>
              </div>

              {/* 分享 */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA] hover:border-[#727BBA]/40 transition-all cursor-pointer"
                  title="分享链接"
                >
                  <Share2 size={14} />
                </button>
                <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">分享</span>
              </div>
            </aside>

            {/* 2. 中央正文阅读区 */}
            <article className="w-full max-w-2xl mx-auto flex flex-col">
              {/* 面包屑与返回：使用 inline-flex 与 leading-none 确保垂直居中对齐，置于正文区内以实现完美的左侧对齐 */}
              <div className="animate-detail-item opacity-0 flex items-center justify-between w-full mb-4 text-xs text-zinc-400 dark:text-zinc-500 font-mono h-6 select-none">
                <Link 
                  href="/article" 
                  className="inline-flex items-center gap-1 hover:text-[#727BBA] transition-colors group cursor-pointer h-full"
                >
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="leading-none">返回归档</span>
                </Link>
                <div className="inline-flex items-center gap-1.5 select-none h-full">
                  <span className="leading-none">文章</span>
                  <ChevronRight size={12} className="text-zinc-400" />
                  <span className="truncate max-w-40 select-none text-zinc-500 dark:text-zinc-400 leading-none">{article?.title}</span>
                </div>
              </div>

              {/* 顶部标题与元数据页头 */}
              <header className="animate-detail-item opacity-0 border-b border-zinc-200/50 dark:border-zinc-900/60 pb-7 select-none">
                {/* 分类标签：改用 span 自定义内边距防贴边 */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {article.categoryName && (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-[#727BBA]/10 text-[#727BBA] text-[10px] font-bold uppercase rounded border border-[#727BBA]/25 tracking-wide">
                      {article.categoryName}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] md:leading-[1.3] font-bold text-zinc-900 dark:text-white tracking-wide mb-5">
                  {article.title}
                </h1>

                {/* 元数据行 */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} strokeWidth={1.5} />
                    <span>{article.viewCount} 次浏览</span>
                  </div>
                  {article.wordCount && (
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} strokeWidth={1.5} />
                      <span>{article.wordCount} 字</span>
                    </div>
                  )}
                  {article.readTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} strokeWidth={1.5} />
                      <span>预计阅读 {article.readTime} 分钟</span>
                    </div>
                  )}
                </div>
              </header>

              {/* 核心正文 Markdown/HTML 内容 */}
              <div 
                ref={articleContentRef}
                className="animate-detail-item opacity-0 py-8"
              >
                <HtmlRenderer html={article.content} />
              </div>

              {/* 标签 */}
              {article.tags && article.tags.length > 0 && (
                <div className="animate-detail-item opacity-0 flex flex-wrap items-center gap-2 py-4 border-y border-zinc-200/30 dark:border-zinc-900/30 mt-6 select-none">
                  <span className="text-[10px] font-heading font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-1">
                    标签：
                  </span>
                  {article.tags.map(t => (
                    <span 
                      key={t.id} 
                      className="px-2.5 py-1 rounded text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-150/40 dark:bg-zinc-900/50 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer select-none"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 移动端/小屏底部悬浮栏 (点赞、赞赏、分享) */}
              <div className="flex lg:hidden items-center justify-around py-4 border-t border-zinc-200/50 dark:border-zinc-900/60 mt-6 text-zinc-500 select-none">
                <button onClick={handleLike} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <Heart size={15} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-rose-500' : ''} />
                  <span>点赞 ({likeCount})</span>
                </button>
                <button onClick={() => setRewardOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <Coffee size={15} />
                  <span>赞赏</span>
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <Share2 size={14} />
                  <span>分享</span>
                </button>
              </div>

              {/* 3. 人文版权协议卡片 */}
              <div className="animate-detail-item opacity-0 mt-10 p-5 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-150/20 dark:bg-zinc-900/25 flex flex-col gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-serif leading-relaxed select-none">
                <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#727BBA]"></span>
                  <span>关于版权</span>
                </div>
                <p>作者：<strong>{profile?.nickname || '可梵'}</strong></p>
                <p>本文链接：<span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 underline select-all break-all">{typeof window !== 'undefined' ? window.location.href : ''}</span></p>
                <p>版权声明：本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-[#727BBA] underline font-bold">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源。</p>
              </div>

              {/* 4. 上一篇/下一篇阅读推荐 */}
              <nav className="animate-detail-item opacity-0 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-900/60 select-none">
                {prevArticle ? (
                  <Link 
                    href={`/article/${prevArticle.slug}`}
                    className="group flex flex-col gap-1.5 p-5 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 bg-zinc-150/15 dark:bg-zinc-900/15 hover:bg-[#E9EEE8]/30 dark:hover:bg-[#727BBA]/5 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/20 transition-all duration-300 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      ← 上一篇
                    </span>
                    <span className="font-serif text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-[#727BBA] line-clamp-1 transition-colors">
                      {prevArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div className="p-5 rounded-2xl border border-zinc-200/20 dark:border-zinc-800/20 bg-zinc-150/10 dark:bg-zinc-900/5 flex items-center justify-center text-[10px] text-zinc-450 dark:text-zinc-600 font-serif italic select-none">
                    无前一篇思考了
                  </div>
                )}

                {nextArticle ? (
                  <Link 
                    href={`/article/${nextArticle.slug}`}
                    className="group flex flex-col gap-1.5 p-5 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 bg-zinc-150/15 dark:bg-zinc-900/15 hover:bg-[#E9EEE8]/30 dark:hover:bg-[#727BBA]/5 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/20 transition-all duration-300 text-right cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      下一篇 →
                    </span>
                    <span className="font-serif text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-[#727BBA] line-clamp-1 transition-colors">
                      {nextArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div className="p-5 rounded-2xl border border-zinc-200/20 dark:border-zinc-800/20 bg-zinc-150/10 dark:bg-zinc-900/5 flex items-center justify-center text-[10px] text-zinc-450 dark:text-zinc-600 font-serif italic select-none">
                    文字已至尽头
                  </div>
                )}
              </nav>

              {/* 5. 评论区交流讨论 */}
              <CommentSection articleId={article.id} isAllowComment={article.isAllowComment ?? true} />

            </article>

            {/* 3. PC端右侧 Sticky 大纲目录树 (TOC) - 常驻 DOM 从而保证 GSAP 能正常做淡入动效 */}
            <aside className="hidden lg:block sticky top-28 w-[210px] pr-2 z-20 animate-detail-item opacity-0 select-none">
              <div className="flex items-center gap-1.5 text-[10px] font-heading font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200/50 dark:border-zinc-950/60 pb-2 mb-3">
                <span>文章目录</span>
              </div>
              {toc.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={`block text-[11px] leading-relaxed transition-all duration-200 hover:text-[#727BBA] cursor-pointer ${
                        item.level === 3 ? 'pl-3.5 border-l border-zinc-200 dark:border-zinc-900 text-zinc-450 dark:text-zinc-500' : 'font-medium text-zinc-600 dark:text-zinc-400'
                      } ${
                        activeTocId === item.id 
                          ? '!text-[#727BBA] font-extrabold !border-[#727BBA] translate-x-1.5' 
                          : ''
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-450 dark:text-zinc-500 italic">暂无目录</p>
              )}
            </aside>

          </div>
        )}

      </div>

      {/* 扫码赞赏模态浮层 */}
      {rewardOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl w-full max-w-sm p-6 relative flex flex-col items-center gap-5 shadow-xl select-none mx-4">
            <button 
              onClick={() => setRewardOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white mb-1">给作者来杯咖啡</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic">您的鼓励是最好的赞赏</p>
            </div>
            
            {/* 模拟收款码区 */}
            <div className="relative w-36 h-36 border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-zinc-350 dark:text-zinc-650 text-[10px] font-mono p-3 text-center select-none">
                <Lock size={16} />
                <span>[ 演示扫码区 ]</span>
                <span className="scale-75 select-none opacity-80">支持微信/支付宝</span>
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-serif text-center max-w-[240px]">
              感谢您的赞同与支持。本博客以知识共享、无广告为初衷，坚持创作高水准内容。
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
