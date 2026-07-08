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
 * 手记详情页 — 单栏叙事布局
 *
 * 与文章详情页的区别：
 * - 无 TOC 右侧栏、无 PC 左侧浮动操作栏
 * - 日期大号日记风格展示
 * - 心情/天气/位置标签更突出
 * - 操作行内联于正文下方
 * - 无上一篇/下一篇导航
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
          setNote(noteData)
          setLikeCount(noteData.likeCount || 0)
        } else {
          setError('手记不存在或已被删除')
        }
      } catch (err: any) {
        console.warn('加载手记详情失败:', err)
        setError('无法加载手记详情，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    if (slug) loadData()
  }, [slug])

  // 从 localStorage 检查点赞状态
  useEffect(() => {
    if (note?.id && typeof window !== 'undefined') {
      try {
        const likedList = JSON.parse(localStorage.getItem('liked_notes') || '[]')
        if (Array.isArray(likedList) && likedList.includes(note.id)) {
          setLiked(true)
        }
      } catch { /* ignore */ }
    }
  }, [note])

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

  /** 简短日期：06.06（日记风格） */
  const formatShortDate = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
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

      <div className="w-full max-w-3xl px-6 py-10">
        {loading ? (
          <DetailLoadingState message="正在加载手记..." />
        ) : error || !note ? (
          <DetailErrorState
            title="无法加载手记"
            message={error || '加载异常，找不到相关内容。'}
            backPath="/notes"
            backText="返回手记列表"
          />
        ) : (
          /* ================= 单栏叙事布局 ================= */
          <article className="flex flex-col">
            {/* 面包屑导航 */}
            <div className="animate-detail-item opacity-0 flex items-center justify-between w-full mb-6 text-xs text-zinc-400 dark:text-zinc-500 font-mono h-6 select-none">
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
                <span className="truncate max-w-40 select-none text-zinc-500 dark:text-zinc-400 leading-none">{note.title}</span>
              </div>
            </div>

            {/* 心情 / 天气 / 位置标签行 — 突出展示 */}
            <div className="animate-detail-item opacity-0 flex flex-wrap items-center gap-3 mb-5 select-none">
              {MoodIcon && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded ${moodCfg?.color} bg-current/5 border-current/20`}>
                  <MoodIcon size={14} />
                  {moodCfg?.label}
                </span>
              )}
              {WeatherIcon && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded">
                  <WeatherIcon size={13} />
                  {weatherCfg?.label}
                </span>
              )}
              {note.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded">
                  <MapPin size={12} />
                  {note.location}
                </span>
              )}
            </div>

            {/* 日期 — 大号日记风格 */}
            <div className="animate-detail-item opacity-0 mb-3 select-none">
              <span className="text-5xl md:text-6xl font-serif font-bold text-[#727BBA] tracking-wide">
                {formatShortDate(note.publishedAt || note.createdAt)}
              </span>
            </div>

            {/* 标题 */}
            <h1 className="animate-detail-item opacity-0 font-serif text-2xl sm:text-3xl md:text-[34px] md:leading-[1.25] font-bold text-zinc-900 dark:text-white tracking-wide mb-5">
              {note.title}
            </h1>

            {/* 元数据行 — 轻量展示 */}
            <div className="animate-detail-item opacity-0 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono pb-7 border-b border-zinc-200/50 dark:border-zinc-900/60 select-none">
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

            {/* 正文内容 */}
            <div className="animate-detail-item opacity-0 py-8">
              <HtmlRenderer html={note.contentHtml || note.content} />
            </div>

            {/* 操作行 — PC & 移动端共用，内联于正文下方 */}
            <div className="animate-detail-item opacity-0 flex items-center justify-center gap-8 py-6 border-y border-zinc-200/30 dark:border-zinc-900/40 mt-4 mb-2 select-none">
              {/* 点赞 */}
              <button
                ref={heartRef}
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  liked
                    ? 'bg-rose-50/80 text-rose-500 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                    : 'bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/60 hover:text-rose-500 hover:border-rose-200'
                }`}
                title="点赞"
              >
                <Heart size={17} fill={liked ? 'currentColor' : 'none'} className="transition-colors" />
                <span>点赞</span>
                <span className="text-[11px] font-mono opacity-60">{likeCount}</span>
              </button>

              {/* 赞赏 */}
              <button
                onClick={() => setRewardOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/60 hover:text-[#727BBA] hover:border-[#727BBA]/40 transition-all duration-300 cursor-pointer"
                title="赞赏作者"
              >
                <Coffee size={16} />
                <span>赞赏</span>
              </button>

              {/* 分享 */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/60 hover:text-[#727BBA] hover:border-[#727BBA]/40 transition-all duration-300 cursor-pointer"
                title="分享链接"
              >
                <Share2 size={15} />
                <span>分享</span>
              </button>
            </div>

            {/* 版权声明 */}
            <div className="animate-detail-item opacity-0">
              <Copyright authorName={profile?.nickname || '可梵'} />
            </div>

            {/* 返回手记时间轴 */}
            <div className="animate-detail-item opacity-0 mt-8 text-center select-none">
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 bg-zinc-150/15 dark:bg-zinc-900/15 hover:bg-[#E9EEE8]/30 dark:hover:bg-[#727BBA]/5 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/20 transition-all duration-300 text-sm font-serif text-zinc-500 dark:text-zinc-400 hover:text-[#727BBA] cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>返回手记时间轴</span>
              </Link>
            </div>

            {/* 评论区 */}
            <CommentSection articleId={note.id} isAllowComment={true} />

          </article>
        )}
      </div>

      {/* 赞赏弹窗 */}
      <RewardModal open={rewardOpen} onClose={() => setRewardOpen(false)} />
    </main>
  )
}
