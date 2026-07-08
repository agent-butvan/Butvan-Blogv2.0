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
import type { NoteDetail, NoteItem } from '@/types/note'
import gsap from 'gsap'

// ==================== Mock 数据（测试用）====================

const MOCK_NOTES: (NoteItem & Partial<NoteDetail>)[] = [
  {
    id: 101, title: '在焦虑与代码中缓慢前行', slug: 'mock-anxiety-code',
    summary: '继续写代码，继续跑步，继续睡不着的时候翻来覆去。生活不是完美的闭环，而是由无数碎裂的片段拼凑而成的叙事。',
    content: `## 在焦虑与代码中缓慢前行\n\n继续写代码，继续跑步，继续睡不着的时候翻来覆去。\n\n生活不是完美的闭环，而是由无数碎裂的片段拼凑而成的叙事。有时候我觉得自己像是一个被推着走的齿轮，在既定的轨道上重复着相似的节奏。\n\n### 关于焦虑\n\n焦虑似乎成了现代人的标配。它不是一种病，而是一种状态——一种对未来的不确定性和对当下的无力感交织而成的复杂情绪。\n\n> "焦虑是自由的眩晕。" —— 克尔凯郭尔\n\n### 代码与生活\n\n写代码的时候，世界变得简单了。输入、处理、输出，一切都有明确的因果。但生活不是这样，生活充满了模糊的边界和无法预测的变量。\n\n也许最好的方式就是接受这种不确定性，在焦虑中前行，在代码中寻找片刻的宁静。`,
    contentHtml: `<h2>在焦虑与代码中缓慢前行</h2><p>继续写代码，继续跑步，继续睡不着的时候翻来覆去。</p><p>生活不是完美的闭环，而是由无数碎裂的片段拼凑而成的叙事。有时候我觉得自己像是一个被推着走的齿轮，在既定的轨道上重复着相似的节奏。</p><h3>关于焦虑</h3><p>焦虑似乎成了现代人的标配。它不是一种病，而是一种状态——一种对未来的不确定性和对当下的无力感交织而成的复杂情绪。</p><blockquote><p>"焦虑是自由的眩晕。" —— 克尔凯郭尔</p></blockquote><h3>代码与生活</h3><p>写代码的时候，世界变得简单了。输入、处理、输出，一切都有明确的因果。但生活不是这样，生活充满了模糊的边界和无法预测的变量。</p><p>也许最好的方式就是接受这种不确定性，在焦虑中前行，在代码中寻找片刻的宁静。</p>`,
    coverImageUrls: [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800',
    ],
    mood: '忙碌', weather: '多云', location: '杭州 · 西溪',
    authorName: 'Butvan', isPinned: true,
    viewCount: 342, likeCount: 28, commentCount: 6,
    wordCount: 256, readingTime: 2,
    publishedAt: '2026-07-03T10:30:00Z', createdAt: '2026-07-03T10:00:00Z',
  },
  {
    id: 102, title: '关于"白"的某种偏执', slug: 'mock-white-obsession',
    summary: '原研哉对"白"的理解深刻影响了我。在网页设计中，留白不是空间的浪费，而是赋予了存在的物体以重力。极简并非空无一物，而是让每一像素都有其存在的理由。',
    content: `## 关于"白"的某种偏执\n\n原研哉在《设计中的设计》里说："白不是一种颜色，而是一种感受性。"\n\n这句话在我做前端开发的过程中反复回响。我们总是倾向于填满每一个像素，仿佛空白是一种罪过。但实际上，留白才是设计的灵魂。\n\n### 留白的力量\n\n留白不是"没有东西"，而是"有意的缺席"。它让重要的内容得以呼吸，让用户的视线有所停留。\n\n> "少即是多" —— Mies van der Rohe\n\n### 我的实践\n\n在这个博客项目中，我尝试了大量使用留白。标题周围的 padding，段落之间的 margin，卡片之间的 gap——这些都是经过深思熟虑的。\n\n不是为了"好看"，而是为了让阅读体验更舒适，让信息层次更清晰。\n\n### 结语\n\n白，是一种态度。是对复杂世界的简化，是对本质的回归。`,
    contentHtml: `<h2>关于"白"的某种偏执</h2><p>原研哉在《设计中的设计》里说："白不是一种颜色，而是一种感受性。"</p><p>这句话在我做前端开发的过程中反复回响。我们总是倾向于填满每一个像素，仿佛空白是一种罪过。但实际上，留白才是设计的灵魂。</p><h3>留白的力量</h3><p>留白不是"没有东西"，而是"有意的缺席"。它让重要的内容得以呼吸，让用户的视线有所停留。</p><blockquote><p>"少即是多" —— Mies van der Rohe</p></blockquote><h3>我的实践</h3><p>在这个博客项目中，我尝试了大量使用留白。标题周围的 padding，段落之间的 margin，卡片之间的 gap——这些都是经过深思熟虑的。</p><p>不是为了"好看"，而是为了让阅读体验更舒适，让信息层次更清晰。</p><h3>结语</h3><p>白，是一种态度。是对复杂世界的简化，是对本质的回归。</p>`,
    coverImageUrls: [
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800',
    ],
    mood: '思考中', weather: '晴', location: '上海 · 静安寺',
    authorName: 'Butvan', isPinned: false,
    viewCount: 521, likeCount: 43, commentCount: 12,
    wordCount: 312, readingTime: 3,
    publishedAt: '2026-06-14T15:20:00Z', createdAt: '2026-06-14T15:00:00Z',
  },
  {
    id: 103, title: '凌晨三点的逻辑空洞', slug: 'mock-logic-void',
    summary: '当所有的变量都已就绪，唯独缺失了那一点点灵感。或许最好的代码不在屏幕里，而在那些发呆的间隙。',
    content: `## 凌晨三点的逻辑空洞\n\n又是一个失眠的夜晚。打开电脑，面对着一堆已经写好的代码，却迟迟无法继续。\n\n所有的变量都已就绪，所有的函数都已定义，唯独缺失了那一点点灵感——那个能把所有碎片串联起来的线索。\n\n### 灵感的悖论\n\n灵感这个东西很奇妙。你越是刻意寻找，它越是躲着你。反而是当你放弃寻找，去做别的事情的时候，它突然就出现了。\n\n就像现在，我只是坐在这里发呆，看着窗外的夜色，突然就想通了那个困扰我一整天的问题。\n\n### 发呆的价值\n\n或许最好的代码不在屏幕里，而在那些发呆的间隙。在那些看似"浪费时间"的时刻，大脑其实在后台默默地工作着，把散落的知识点连接成网络。\n\n所以，允许自己发呆吧。那是创造力在酝酿。`,
    contentHtml: `<h2>凌晨三点的逻辑空洞</h2><p>又是一个失眠的夜晚。打开电脑，面对着一堆已经写好的代码，却迟迟无法继续。</p><p>所有的变量都已就绪，所有的函数都已定义，唯独缺失了那一点点灵感——那个能把所有碎片串联起来的线索。</p><h3>灵感的悖论</h3><p>灵感这个东西很奇妙。你越是刻意寻找，它越是躲着你。反而是当你放弃寻找，去做别的事情的时候，它突然就出现了。</p><p>就像现在，我只是坐在这里发呆，看着窗外的夜色，突然就想通了那个困扰我一整天的问题。</p><h3>发呆的价值</h3><p>或许最好的代码不在屏幕里，而在那些发呆的间隙。在那些看似"浪费时间"的时刻，大脑其实在后台默默地工作着，把散落的知识点连接成网络。</p><p>所以，允许自己发呆吧。那是创造力在酝酿。</p>`,
    coverImageUrls: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800',
    ],
    mood: '平静', weather: '阴', location: '',
    authorName: 'Butvan', isPinned: false,
    viewCount: 128, likeCount: 16, commentCount: 3,
    wordCount: 198, readingTime: 2,
    publishedAt: '2026-05-20T03:15:00Z', createdAt: '2026-05-20T03:00:00Z',
  },
]

/**
 * 根据 slug 从 Mock 数据中查找手记（测试用）
 */
function getMockNoteBySlug(slug: string): (NoteItem & Partial<NoteDetail>) | null {
  return MOCK_NOTES.find(n => n.slug === slug) || null
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

  // Ref 定义
  const articleContentRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)

  // ==================== 数据加载 ====================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // 先尝试从后端获取数据
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
        console.warn('从后端加载手记详情失败，尝试使用 Mock 数据:', err instanceof Error ? err.message : String(err))
        
        // 如果后端请求失败，尝试使用 Mock 数据（仅开发环境）
        if (process.env.NODE_ENV === 'development') {
          const mockNote = getMockNoteBySlug(slug)
          if (mockNote) {
            console.log('使用 Mock 数据:', mockNote.title)
            // Mock 数据不需要 profile，设置默认值
            setProfile({ nickname: '可梵', avatarUrl: '' } as ProfileVO)
            setNote(mockNote as NoteDetail)
            setLikeCount(mockNote.likeCount || 0)
            return
          }
        }
        
        // 如果 Mock 数据也找不到，显示错误
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

            {/* 3. PC端右侧空占位（保持对称布局，无TOC） */}
            <aside className="hidden lg:block sticky top-28 w-[210px] pr-2 z-20 animate-detail-item opacity-0 select-none">
              {/* 手记不需要目录树，保留空占位以维持布局平衡 */}
            </aside>

          </div>
        )}

      </div>

      {/* 赞赏弹窗 */}
      <RewardModal open={rewardOpen} onClose={() => setRewardOpen(false)} />
    </main>
  )
}
