'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  AlertCircle,
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
  X,
  Lock,
} from 'lucide-react'
import { Button, Spinner, toast } from '@heroui/react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import HtmlRenderer from '@/components/common/HtmlRenderer'
import CommentSection from '@/components/comment/CommentSection'
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

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [note, setNote] = useState<NoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 交互
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [rewardOpen, setRewardOpen] = useState(false)

  const heartRef = useRef<HTMLButtonElement>(null)

  // 顶部滚动进度条
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 加载数据
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

  // GSAP 入场动画
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

  // 比心动效
  const playHeartAnim = () => {
    if (heartRef.current) {
      gsap.timeline()
        .to(heartRef.current, { scale: 1.35, rotation: -12, duration: 0.15, ease: 'power1.out' })
        .to(heartRef.current, { scale: 0.9, rotation: 8, duration: 0.1 })
        .to(heartRef.current, { scale: 1.15, rotation: -4, duration: 0.1 })
        .to(heartRef.current, { scale: 1, rotation: 0, duration: 0.15, ease: 'power2.out' })
    }
  }

  // 点赞
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

  // 复制分享
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('手记链接已复制到剪贴板')
    } catch {
      toast.danger('复制链接失败')
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

  const moodCfg = note?.mood ? MOOD_ICONS[note.mood] : null
  const weatherCfg = note?.weather ? WEATHER_ICONS[note.weather] : null
  const MoodIcon = moodCfg?.icon
  const WeatherIcon = weatherCfg?.icon

  return (
    <main className="relative min-h-screen w-full bg-transparent text-zinc-900 dark:text-zinc-50 font-body transition-colors duration-200 flex flex-col items-center">
      <Navbar profile={profile} />
      <SidebarWidget />

      {/* 沉浸式阅读进度条 */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-[#727BBA] shadow-[0_0_8px_rgba(114,123,186,0.6)] z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="w-full max-w-5xl px-6 py-10 flex flex-col gap-6">
        {loading ? (
          /* ================= 加载状态 ================= */
          <div className="py-36 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" color="accent" />
            <p className="text-xs font-heading text-zinc-400 dark:text-zinc-600 tracking-wider animate-pulse">
              正在加载手记...
            </p>
          </div>
        ) : error || !note ? (
          /* ================= 异常状态 ================= */
          <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">无法加载手记</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-6">
              {error || '加载异常，找不到相关内容。'}
            </p>
            <Button size="sm" onClick={() => router.push('/notes')} className="font-heading rounded-xl px-5 bg-[#727BBA] text-white">
              返回手记列表
            </Button>
          </div>
        ) : (
          /* ================= 详情核心渲染 ================= */
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-[auto_1fr_210px] gap-8 items-start justify-center">
            {/* 1. PC端左侧悬浮操作栏 */}
            <aside className="hidden lg:flex sticky top-28 flex-col items-center gap-5 w-12 z-20 animate-detail-item opacity-0 select-none">
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
              {/* 面包屑导航 */}
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
                  <span className="truncate max-w-40 select-none text-zinc-500 dark:text-zinc-400 leading-none">{note.title}</span>
                </div>
              </div>

              {/* 页头：心情/天气/位置信息条 */}
              <div className="animate-detail-item opacity-0 flex flex-wrap items-center gap-2 mb-4 select-none">
                {MoodIcon && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-current/5 border border-current/15 ${moodCfg?.color}`}>
                    <MoodIcon size={14} />
                    {moodCfg?.label}
                  </span>
                )}
                {WeatherIcon && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                    <WeatherIcon size={14} />
                    {weatherCfg?.label}
                  </span>
                )}
                {note.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                    <MapPin size={13} />
                    {note.location}
                  </span>
                )}
              </div>

              {/* 标题 & 元数据 */}
              <header className="animate-detail-item opacity-0 border-b border-zinc-200/50 dark:border-zinc-900/60 pb-7 select-none">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] md:leading-[1.3] font-bold text-zinc-900 dark:text-white tracking-wide mb-5">
                  {note.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{formatDate(note.publishedAt || note.createdAt)}</span>
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

              {/* 配图 */}
              {note.coverImageUrl && (
                <div className="animate-detail-item opacity-0 mt-6 rounded-2xl overflow-hidden border border-zinc-200/30 dark:border-zinc-800/30">
                  <img
                    src={resolveImageUrl(note.coverImageUrl)}
                    alt={note.title}
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}

              {/* 正文内容 */}
              <div className="animate-detail-item opacity-0 py-8">
                <HtmlRenderer html={note.contentHtml || note.content} />
              </div>

              {/* 移动端底部悬浮栏 */}
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
              <div className="animate-detail-item opacity-0 mt-10 p-5 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-150/20 dark:bg-zinc-900/25 flex flex-col gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-serif leading-relaxed select-none">
                <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#727BBA]" />
                  <span>关于版权</span>
                </div>
                <p>作者：<strong>{profile?.nickname || '可梵'}</strong></p>
                <p>本文链接：<span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 underline select-all break-all">{typeof window !== 'undefined' ? window.location.href : ''}</span></p>
                <p>版权声明：本博客所有内容除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-[#727BBA] underline font-bold">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源。</p>
              </div>

              {/* 返回手记列表 */}
              <div className="animate-detail-item opacity-0 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-900/60 text-center select-none">
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
          </div>
        )}
      </div>

      {/* 赞赏弹窗 */}
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
