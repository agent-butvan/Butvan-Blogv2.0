'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Eye,
  Heart,
  MessageSquare,
  MapPin,
  AlertCircle,
  Smile,
  Brain,
  Coffee,
  HeartHandshake,
  Star,
  Waves,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  ArrowUpRight,
} from 'lucide-react'
import { Spinner } from '@heroui/react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import { fetchPublicNotes } from '@/lib/note-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import type { ProfileVO } from '@/types/profile'
import type { NoteItem } from '@/types/note'
import gsap from 'gsap'

// ==================== 心情图标映射 ====================

const MOOD_ICONS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  '开心':   { icon: Smile,          label: '开心',   color: 'text-amber-500' },
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
  '风':  { icon: Wind,      label: '风' },
}

const MOOD_FILTER_OPTIONS = [
  { value: '', label: '全部', icon: null },
  ...Object.entries(MOOD_ICONS).map(([key, val]) => ({ value: key, label: val.label, icon: val.icon })),
]

// ==================== 错位栅格布局模式 ====================

/** 基于卡片索引的 12 列栅格定位模式（5 种循环） */
const GRID_PATTERNS = [
  { gridColumn: '1 / 6',  marginTop: '4rem' },   // 左侧宽卡
  { gridColumn: '7 / 12', marginTop: '12rem' },  // 右侧宽卡（更大间距）
  { gridColumn: '2 / 6',  marginTop: '8rem' },   // 左侧窄卡（居中偏左）
  { gridColumn: '8 / 13', marginTop: '10rem' },  // 右侧窄卡（居中偏右）
  { gridColumn: '3 / 10', marginTop: '14rem' },  // 中央全宽卡（最大间距）
]

/** 根据索引获取栅格定位样式 */
const getCardGridStyle = (index: number) => {
  return GRID_PATTERNS[index % GRID_PATTERNS.length]
}

// ==================== 页面组件 ====================

/**
 * 手记 — 错位叙事页面
 *
 * 设计理念：
 * - 非对称 12 列栅格布局，卡片错位排布，打破传统列表沉闷感
 * - 每张卡片自带「书卷感」：压缩配图区 + 正文排版 + 极细页脚
 * - 滚动视差：奇偶卡片反向微动，营造空间纵深感
 * - GSAP 滚动入场动画
 * - 悬浮微交互：卡片抬升 + 阴影扩散
 */
export default function NotesFragmentsPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // 分页 & 筛选
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [moodFilter, setMoodFilter] = useState('')

  const pageSize = 10
  const canvasRef = useRef<HTMLDivElement>(null)

  /** 加载手记列表 */
  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchPublicNotes(page, pageSize, moodFilter || undefined)
      const records = data.records || []

      setNotes(records)
      setTotal(data.total || 0)
      setTotalPages(Math.ceil((data.total || 0) / pageSize))
    } catch (err) {
      console.warn('加载手记列表失败:', err)
      setError('暂时无法加载手记，请稍后再试')
      setNotes([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, moodFilter])

  // 挂载 & 依赖变动
  useEffect(() => {
    fetchProfile('butvan').then(setProfile)
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // ==================== 滚动视差效果 ====================

  useEffect(() => {
    if (notes.length === 0) return

    // 尊重用户 reduced-motion 偏好，跳过视差效果
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) return

    const wrappers = document.querySelectorAll<HTMLElement>('.fragment-card-wrapper')
    let rafId: number

    const handleScroll = () => {
      wrappers.forEach((wrapper, i) => {
        // 奇偶卡片移动方向相反，营造错位纵深感（参考 ai_studio_code 设计稿的速度参数）
        const speed = (i % 2 === 0) ? 0.08 : -0.08
        const yPos = window.pageYOffset * speed
        wrapper.style.transform = `translateY(${yPos}px)`
      })
    }

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // 初始调用一次确保位置正确
    handleScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [notes])

  // ==================== 响应式栅格布局（桌面端应用错位样式）====================

  useEffect(() => {
    if (notes.length === 0) return

    const applyGridStyles = () => {
      const isDesktop = window.innerWidth >= 768 // md breakpoint
      const wrappers = document.querySelectorAll<HTMLElement>('.fragment-card-wrapper')
      
      wrappers.forEach((wrapper, i) => {
        if (isDesktop) {
          // 桌面端：应用错位栅格样式
          const gridStyle = getCardGridStyle(i)
          wrapper.style.gridColumn = gridStyle.gridColumn
          wrapper.style.marginTop = gridStyle.marginTop
        } else {
          // 移动端：全宽统一间距
          wrapper.style.gridColumn = '1 / -1'
          wrapper.style.marginTop = '2rem'
        }
      })
    }

    // 初始应用
    applyGridStyles()

    // 监听窗口大小变化
    window.addEventListener('resize', applyGridStyles)

    return () => {
      window.removeEventListener('resize', applyGridStyles)
    }
  }, [notes])

  // ==================== GSAP：页头 & 筛选栏入场动画（仅挂载时执行一次）====================

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-header-item',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
      )
    })

    return () => ctx.revert()
  }, [])

  // ==================== GSAP：卡片列表入场动画（每次数据变化时平滑渐入）====================

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.fragment-card-wrapper',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: 'power3.out' },
      )
      gsap.fromTo('.animate-pagination',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.25 },
      )
    })

    return () => ctx.revert()
  }, [loading, notes])

  // ==================== 格式化日期 ====================

  const formatShortDate = (isoString: string): string => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    } catch {
      return isoString
    }
  }

  // ==================== 渲染 ====================

  return (
    <main className="relative min-h-screen w-full bg-transparent text-zinc-900 dark:text-zinc-50 font-body selection:bg-[#727BBA]/20 transition-colors duration-200 flex flex-col items-center">
      <Navbar profile={profile} />
      <SidebarWidget />

      {/* ========== 页头：错位叙事标题区 ========== */}
      <header className="relative w-full max-w-5xl px-4 pt-24 pb-14 text-center flex flex-col items-center select-none">
        <div className="relative inline-block">
          {/* 标题主体 */}
          <h1 className="animate-header-item opacity-0 text-2xl md:text-3xl font-serif font-semibold text-zinc-900 dark:text-zinc-50 tracking-[0.25em] indent-[0.25em]">
            流年碎片
          </h1>

          {/* 右侧竖排英文装饰标签 */}
          <span className="animate-header-item opacity-0 absolute -right-14 md:-right-16 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] text-[10px] font-heading font-bold text-[#727BBA]/50 dark:text-[#727BBA]/40 tracking-[0.4em] uppercase border-r border-[#727BBA]/15 pr-1.5 h-12">
            Fragments
          </span>
        </div>

        {/* 副标题 */}
        <p className="animate-header-item opacity-0 mt-5 font-serif text-xs md:text-sm text-zinc-400 dark:text-zinc-500 tracking-[0.2em]">
          每一行代码，都是一次对时间的装帧
        </p>

        {/* 装饰分隔点 */}
        <div className="animate-header-item opacity-0 flex items-center gap-2 mt-5">
          <div className="w-1 h-1 rounded-full bg-[#727BBA]/30" />
          <div className="w-10 h-px bg-[#727BBA]/15" />
          <div className="w-1 h-1 rounded-full bg-[#727BBA]/30" />
        </div>
      </header>

      {/* ========== 心情筛选器 ========== */}
      <section className="w-full max-w-5xl px-6 pb-8">
        <div className="animate-header-item opacity-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 select-none pb-6 border-b border-zinc-200/30 dark:border-zinc-800/30">
          <span className="text-[10px] font-heading font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mr-2">
            心境
          </span>
          {MOOD_FILTER_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value || 'all'}
                onClick={() => { setMoodFilter(opt.value); setPage(1) }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[44px] ${
                  moodFilter === opt.value
                    ? 'text-[#727BBA] font-bold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {Icon && <Icon size={13} />}
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ========== 主体：错位栅格卡片区 ========== */}
      <section className="w-full max-w-[1300px] px-4 md:px-8 pb-24">

        {/* 加载状态 */}
        {loading && notes.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3">
            <Spinner size="lg" color="accent" />
            <p className="text-xs font-heading text-zinc-400 dark:text-zinc-600 tracking-wider animate-pulse">
              正在加载手记...
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600">共 {total} 篇</p>
          </div>
        )}

        {/* 异常状态 */}
        {error && !loading && notes.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">加载失败</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-6">{error}</p>
            <button
              onClick={loadNotes}
              className="rounded-xl px-5 py-2.5 text-xs font-bold bg-[#727BBA] text-white hover:bg-[#727BBA]/90 transition-colors cursor-pointer"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && notes.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center select-none">
            <p className="text-sm font-serif italic text-zinc-400 dark:text-zinc-500 tracking-wider">
              暂无手记，敬请期待
            </p>
          </div>
        )}

        {/* ===== 错位栅格画布 ===== */}
        {notes.length > 0 && (
          <>
            <div
              ref={canvasRef}
              className={`relative grid grid-cols-12 gap-0 transition-opacity duration-300 ${
                loading ? 'opacity-50 blur-[0.5px]' : 'opacity-100'
              }`}
            >
              {/* 中央装饰竖线（虚线节奏） */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px pointer-events-none -z-10"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(114,123,186,0.1) 3%, rgba(114,123,186,0.1) 6%, transparent 6%, transparent 12%)',
                  backgroundSize: '1px 12px',
                }}
              />

              {notes.map((note, i) => {
                const gridStyle = getCardGridStyle(i)
                const moodCfg = note.mood ? MOOD_ICONS[note.mood] : null
                const weatherCfg = note.weather ? WEATHER_ICONS[note.weather] : null
                const MoodIcon = moodCfg?.icon
                const WeatherIcon = weatherCfg?.icon
                const publishedDate = note.publishedAt || note.createdAt
                
                // 获取图片数组（优先使用 coverImageUrls，否则回退到单图）
                const images = note.coverImageUrls && note.coverImageUrls.length > 0 
                  ? note.coverImageUrls 
                  : (note.coverImageUrl ? [note.coverImageUrl] : [])
                const hasImages = images.length > 0

                return (
                  <div
                    key={note.id}
                    className="fragment-card-wrapper mb-16 md:mb-0 cursor-pointer"
                  >
                    <Link
                      href={`/notes/${note.slug}`}
                      aria-label={`阅读手记：${note.title}`}
                      className="fragment-card group block bg-white dark:bg-zinc-900/90 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-colors duration-200 motion-safe:transition-all motion-safe:duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:hover:-translate-y-2.5 motion-safe:hover:scale-[1.02] hover:shadow-[8px_16px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[8px_16px_40px_rgba(0,0,0,0.25)] relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#727BBA]"
                    >
                      {/* ===== 配图区：三图拼贴布局 ===== */}
                      {hasImages ? (
                        <div className="relative h-[280px] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                          {/* 心境标签：有配图时在图片区域右上角 */}
                          {moodCfg && MoodIcon && (
                            <div className="absolute top-0 right-6 z-10">
                              <div className={`flex flex-col items-center gap-1 px-2 py-3 ${moodCfg.color} bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm`}>
                                <MoodIcon size={14} />
                                <span className="text-[10px] font-bold tracking-widest [writing-mode:vertical-rl] text-zinc-700 dark:text-zinc-200" style={{ writingMode: 'vertical-rl' }}>
                                  {moodCfg.label}
                                </span>
                              </div>
                            </div>
                          )}

                          {images.length === 1 ? (
                            /* 单图模式：全宽展示 */
                            <img
                              src={resolveImageUrl(images[0])}
                              alt={note.title}
                              className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : images.length === 2 ? (
                            /* 双图模式：左右平分展示 */
                            <div className="grid grid-cols-2 h-full gap-px bg-white/20 dark:bg-zinc-900/20">
                              <div className="relative overflow-hidden">
                                <img
                                  src={resolveImageUrl(images[0])}
                                  alt={`${note.title} - 1`}
                                  className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                              <div className="relative overflow-hidden">
                                <img
                                  src={resolveImageUrl(images[1])}
                                  alt={`${note.title} - 2`}
                                  className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          ) : (
                            /* 三图及以上拼贴模式：左侧2/3两图纵向堆叠，右侧1/3一张全高大图 */
                            <div className="grid grid-cols-3 h-full gap-px bg-white/20 dark:bg-zinc-900/20">
                              {/* 左侧两图纵向堆叠 */}
                              <div className="col-span-2 grid grid-rows-2 gap-px bg-white/20 dark:bg-zinc-900/20">
                                <div className="relative overflow-hidden">
                                  <img
                                    src={resolveImageUrl(images[0])}
                                    alt={`${note.title} - 1`}
                                    className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="relative overflow-hidden">
                                  <img
                                    src={resolveImageUrl(images[1])}
                                    alt={`${note.title} - 2`}
                                    className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                                    loading="lazy"
                                  />
                                </div>
                              </div>
                              {/* 右侧大图 */}
                              <div className="col-span-1 relative overflow-hidden">
                                <img
                                  src={resolveImageUrl(images[2])}
                                  alt={`${note.title} - 3`}
                                  className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          )}
                          {/* 底部渐变叠加层，提升文字可读性 */}
                          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/50 dark:from-zinc-900/50 to-transparent pointer-events-none" />
                        </div>
                      ) : null /* 无配图时完全隐藏封面区域 */}

                      {/* ===== 正文区 ===== */}
                      <div className="relative px-7 py-6 pr-16">
                        {/* 无配图时的心境标签和日期：右侧垂直排列 */}
                        {!hasImages && moodCfg && MoodIcon && (
                          <div className="absolute top-6 right-7 flex flex-col items-center gap-2">
                            <div className={`flex flex-col items-center gap-1 px-2 py-2 ${moodCfg.color} bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm`}>
                              <MoodIcon size={14} />
                              <span className="text-[10px] font-bold tracking-widest [writing-mode:vertical-rl] text-zinc-700 dark:text-zinc-200" style={{ writingMode: 'vertical-rl' }}>
                                {moodCfg.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light tracking-wide rotate-0">
                              {formatShortDate(publishedDate)}
                            </span>
                          </div>
                        )}

                        {/* 有配图时的日期：右上角 */}
                        {hasImages && (
                          <span className="absolute top-6 right-7 text-[11px] text-zinc-500 dark:text-zinc-500 font-light tracking-wide">
                            {formatShortDate(publishedDate)}
                          </span>
                        )}

                        {/* 标题 */}
                        <h2 className="font-serif text-lg md:text-xl font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-[#727BBA] transition-colors duration-300 mb-3.5 leading-snug pr-20">
                          {note.title}
                        </h2>

                        {/* 摘要 */}
                        {note.summary && (
                          <p className="font-serif text-[13px] md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed text-pretty mb-5 line-clamp-3">
                            {note.summary}
                          </p>
                        )}

                        {/* 天气/位置 标签行 */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {WeatherIcon && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60">
                              <WeatherIcon size={11} />
                              {weatherCfg?.label}
                            </span>
                          )}
                          {note.location && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                              <MapPin size={10} />
                              {note.location}
                            </span>
                          )}
                        </div>

                        {/* ===== 卡片页脚 ===== */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-medium">
                          {/* 左侧：浏览数据 */}
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1">
                              <Eye size={11} strokeWidth={1.5} />
                              {note.viewCount}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Heart size={11} strokeWidth={1.5} />
                              {note.likeCount}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare size={11} strokeWidth={1.5} />
                              {note.commentCount}
                            </span>
                          </div>

                          {/* 右侧：阅读引导 */}
                          <span className="inline-flex items-center gap-1 text-[#727BBA] dark:text-[#727BBA]/80 group-hover:gap-2 transition-all duration-300">
                            <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity duration-300">阅读</span>
                            <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              )}
            </div>

            {/* ===== 分页 ===== */}
            {totalPages > 1 && (
              <div className="animate-pagination opacity-0 flex justify-center items-center gap-1.5 mt-16 select-none">
                <button
                  onClick={() => { if (page > 1) { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
                  disabled={page === 1}
                  className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-350 px-3 py-1.5 text-xs font-heading transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`rounded-xl text-xs min-w-8 h-8 font-heading transition-all cursor-pointer ${
                      page === p
                        ? 'bg-[#727BBA] text-white font-bold shadow-lg shadow-[#727BBA]/25'
                        : 'bg-zinc-50/40 border border-zinc-200/50 dark:bg-zinc-900/60 dark:border-zinc-800/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-350'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { if (page < totalPages) { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
                  disabled={page === totalPages}
                  className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-350 px-3 py-1.5 text-xs font-heading transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </section>
      
      {/* 全站统一页脚 */}
      <Footer />
    </main>
  )
}
