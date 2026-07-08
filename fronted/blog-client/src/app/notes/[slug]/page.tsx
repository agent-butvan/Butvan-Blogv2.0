'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  Clock,
  MapPin,
  ChevronRight,
  Share2,
  Coffee,
  Smile,
  Brain,
  HeartHandshake,
  Star,
  Waves,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
} from 'lucide-react'
import { toast } from '@heroui/react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import HtmlRenderer from '@/components/common/HtmlRenderer'
import CommentSection from '@/components/comment/CommentSection'
import ScrollProgress from '@/components/detail/ScrollProgress'
import DetailLoadingState from '@/components/detail/DetailLoadingState'
import DetailErrorState from '@/components/detail/DetailErrorState'
import Copyright from '@/components/detail/Copyright'
import RewardModal from '@/components/detail/RewardModal'
import { fetchNoteBySlug } from '@/lib/note-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import type { ProfileVO } from '@/types/profile'
import type { NoteDetail } from '@/types/note'
import gsap from 'gsap'

// ==================== 类型定义 ====================

interface TocItem {
  id: string
  text: string
  level: number
}

// ==================== 图标映射 ====================

const MOOD_ICONS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  '开心':   { icon: Smile,         label: '开心',   color: 'text-amber-500' },
  '思考中': { icon: Brain,          label: '思考中', color: 'text-purple-500' },
  '忙碌':   { icon: Coffee,         label: '忙碌',   color: 'text-rose-500' },
  '放松':   { icon: Waves,          label: '放松',   color: 'text-sky-500' },
  '感动':   { icon: HeartHandshake, label: '感动',   color: 'text-pink-500' },
  '平静':   { icon: Star,           label: '平静',   color: 'text-emerald-500' },
}

const WEATHER_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  '晴':  { icon: Sun,       label: '晴' },
  '多云': { icon: CloudSun,  label: '多云' },
  '阴':  { icon: Cloud,     label: '阴' },
  '雨':  { icon: CloudRain, label: '雨' },
  '雪':  { icon: Snowflake, label: '雪' },
  '风':  { icon: Wind,       label: '风' },
}

// ==================== 页面组件 ====================

/**
 * 手记详情页 — 三栏布局（与文章详情页一致）
 *
 * 布局结构：
 * - 左侧：PC端 Sticky 悬浮操作栏（点赞、赞赏、分享）
 * - 中间：正文阅读区
 * - 右侧：无 TOC（手记不需要目录）
 */
export default function NoteDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [note, setNote] = useState<NoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 交互状态
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [rewardOpen, setRewardOpen] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeTocId, setActiveTocId] = useState<string>('')

  // Ref 定义
  const articleContentRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)

  // ==================== 数据加载 ====================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [profileData, noteData] = await Promise.all([
          fetchProfile('butvan'),
          fetchNoteBySlug(slug),
        ])
        setProfile(profileData)
        if (noteData) {
          setNote(noteData as NoteDetail)
          setLikeCount(noteData.likeCount || 0)
        } else {
          throw new Error('手记不存在')
        }
      } catch (err) {
        console.warn('加载手记详情失败:', err instanceof Error ? err.message : String(err))
        setError(err instanceof Error ? err.message : '无法加载手记详情，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    if (slug) loadData()
  }, [slug])

  // 从 localStorage 检查点赞状态
  useEffect(() => {
    if (!note?.id || typeof window === 'undefined') return
    
    try {
      const likedList = JSON.parse(localStorage.getItem('liked_notes') || '[]')
      if (Array.isArray(likedList) && likedList.includes(note.id)) {
        setLiked(true)
      }
    } catch { /* ignore */ }
  }, [note?.id])

  // ==================== GSAP 入场动画 ====================

  useEffect(() => {
    if (loading || !note) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-detail-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
      )
    })
    return () => ctx.revert()
  }, [loading, note])

  // 动态生成目录 TOC 并绑定随屏点亮 Observer
  useEffect(() => {
    if (loading || !note || !articleContentRef.current) return

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

      headings.forEach((heading) => {
        observer.observe(heading)
      })

      return () => {
        observer.disconnect()
        clearTimeout(timer)
      }
    }, 100)
  }, [loading, note])

  // 动态标题
  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} | 手记 · 可梵的个人博客`
    }
  }, [note])

  // ==================== 交互逻辑 ====================

  /** 比心动效 */
  const playHeartAnim = () => {
    if (heartRef.current) {
      gsap.timeline()
        .to(heartRef.current, { scale: 1.35, rotation: -12, duration: 0.15, ease: 'power1.out' })
        .to(heartRef.current, { scale: 0.9, rotation: 8, duration: 0.1 })
        .to(heartRef.current, { scale: 1.15, rotation: -4, duration: 0.1 })
        .to(heartRef.current, { scale: 1, rotation: 0, duration: 0.15, ease: 'power2.out' })
    }
  }

  /** 点赞切换 */
  const handleLike = () => {
    if (!note?.id) return
    if (liked) {
      setLiked(false)
      setLikeCount(prev => Math.max(0, prev - 1))
      if (typeof window !== 'undefined') {
        try {
          const list = JSON.parse(localStorage.getItem('liked_notes') || '[]')
          localStorage.setItem('liked_notes', JSON.stringify(list.filter((id: number) => id !== note.id)))
        } catch { /* ignore */ }
      }
      toast.success('点赞已取消')
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)
      if (typeof window !== 'undefined') {
        try {
          const list = JSON.parse(localStorage.getItem('liked_notes') || '[]')
          if (!list.includes(note.id)) {
            list.push(note.id)
            localStorage.setItem('liked_notes', JSON.stringify(list))
          }
        } catch { /* ignore */ }
      }
      toast.success('点赞成功！')
      playHeartAnim()
    }
  }

  /** 复制分享链接 */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('手记链接已复制到剪贴板')
    } catch {
      toast.danger('复制链接失败')
    }
  }

  /** 处理目录点击平滑滚动 */
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

  // ==================== 格式化 ====================

  /** 完整日期：2026年6月6日 */
  const formatFullDate = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return isoString
    }
  }

  const moodCfg = note?.mood ? MOOD_ICONS[note.mood] : null
  const weatherCfg = note?.weather ? WEATHER_ICONS[note.weather] : null
  const MoodIcon = moodCfg?.icon
  const WeatherIcon = weatherCfg?.icon

  // ==================== 渲染 ====================

  return (
    <main className="relative min-h-screen w-full bg-transparent text-zinc-900 dark:text-zinc-50 font-body transition-colors duration-200 flex flex-col items-center">
      <Navbar profile={profile} />
      <SidebarWidget />

      {/* 沉浸式阅读进度条 */}
      <ScrollProgress />

      {/* 主体布局架构 */}
      <div className="w-full max-w-5xl px-6 py-10 flex flex-col gap-6">
        {loading ? (
          <DetailLoadingState message="正在加载手记详情，请稍候..." />
        ) : error || !note ? (
          <DetailErrorState
            title="无法加载手记"
            message={error || '加载异常，找不到相关内容。'}
            backPath="/notes"
            backText="返回手记列表"
          />
        ) : (
          /* ================= 详情核心渲染（三栏布局）================== */
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
              {/* 面包屑与返回 */}
              <div className="animate-detail-item opacity-0 flex items-center justify-between w-full mb-4 text-xs text-zinc-400 dark:text-zinc-500 font-mono h-6 select-none">
                <Link 
                  href="/notes" 
                  className="inline-flex items-center gap-1 hover:text-[#727BBA] transition-colors group cursor-pointer h-full"
                >
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="leading-none">返回时间轴</span>
                </Link>
                <div className="inline-flex items-center gap-1.5 select-none h-full">
                  <span className="leading-none">手记</span>
                  <ChevronRight size={12} className="text-zinc-400" />
                  <span className="truncate max-w-40 select-none text-zinc-500 dark:text-zinc-400 leading-none">{note?.title}</span>
                </div>
              </div>

              {/* 顶部标题与元数据页头 */}
              <header className="animate-detail-item opacity-0 border-b border-zinc-200/50 dark:border-zinc-900/60 pb-7 select-none">
                {/* 心情 / 天气 / 位置标签行 */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {MoodIcon && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold border rounded ${moodCfg?.color} bg-current/5 border-current/20`}>
                      <MoodIcon size={12} />
                      {moodCfg?.label}
                    </span>
                  )}
                  {WeatherIcon && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded">
                      <WeatherIcon size={11} />
                      {weatherCfg?.label}
                    </span>
                  )}
                  {note.location && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded">
                      <MapPin size={10} />
                      {note.location}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] md:leading-[1.3] font-bold text-zinc-900 dark:text-white tracking-wide mb-5">
                  {note.title}
                </h1>

                {/* 元数据行 */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{formatFullDate(note.publishedAt || note.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} strokeWidth={1.5} />
                    <span>{note.viewCount} 次浏览</span>
                  </div>
                  {note.wordCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} strokeWidth={1.5} />
                      <span>{note.wordCount} 字</span>
                    </div>
                  )}
                  {note.readingTime > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} strokeWidth={1.5} />
                      <span>预计阅读 {note.readingTime} 分钟</span>
                    </div>
                  )}
                </div>
              </header>

              {/* 配图 — 全宽展示 */}
              {note.coverImageUrl && (
                <div className="animate-detail-item opacity-0 mt-8 rounded-2xl overflow-hidden border border-zinc-200/30 dark:border-zinc-800/30">
                  <img
                    src={resolveImageUrl(note.coverImageUrl)}
                    alt={note.title}
                    className="w-full max-h-[420px] object-cover"
                  />
                </div>
              )}

              {/* 核心正文 Markdown/HTML 内容 */}
              <div 
                ref={articleContentRef}
                className="animate-detail-item opacity-0 py-8"
              >
                <HtmlRenderer html={note.contentHtml || note.content} />
              </div>

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

              {/* 版权声明 */}
              <div className="animate-detail-item opacity-0">
                <Copyright authorName={profile?.nickname || '可梵'} />
              </div>

              {/* 返回手记时间轴按钮 */}
              <nav className="animate-detail-item opacity-0 mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-900/60 select-none">
                <Link 
                  href="/notes"
                  className="group flex flex-col gap-1.5 p-5 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 bg-zinc-150/15 dark:bg-zinc-900/15 hover:bg-[#E9EEE8]/30 dark:hover:bg-[#727BBA]/5 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/20 transition-all duration-300 text-left cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    ← 返回手记时间轴
                  </span>
                  <span className="font-serif text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-[#727BBA] line-clamp-1 transition-colors">
                    浏览更多手记内容
                  </span>
                </Link>
              </nav>

              {/* 评论区交流讨论 */}
              <CommentSection articleId={note.id} isAllowComment={true} />

            </article>

            {/* 3. PC端右侧 Sticky 大纲目录树 (TOC) */}
            <aside className="hidden lg:block sticky top-28 w-[210px] pr-2 z-20 animate-detail-item opacity-0 select-none">
              <div className="flex items-center gap-1.5 text-[10px] font-heading font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200/50 dark:border-zinc-950/60 pb-2 mb-3">
                <span>手记目录</span>
              </div>
              {toc.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden pr-1">
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

      {/* 赞赏弹窗 */}
      <RewardModal open={rewardOpen} onClose={() => setRewardOpen(false)} />
    </main>
  )
}
