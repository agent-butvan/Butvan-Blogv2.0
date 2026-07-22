'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import PhotoLightbox from '@/components/album/PhotoLightbox'
import { fetchPublicPhotos } from '@/lib/album-api'
import { fetchProfile } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import type { ProfileVO } from '@/types/profile'
import type { PhotoWallItem } from '@/types/album'

// ==================== 设计稿还原：「视界。回响」沉浸式艺术空间 ====================
//
// 核心交互机制（纵滚横移）：
// - scroll-wrapper 高度 = 簇数量 × 视口宽度系数，撑出纵向滚动空间
// - sticky-viewport 固定在视口，内部 track 随 scroll 横向平移
// - 叠加 sin 波动的 Y 轴偏移，制造曲线路径感
//
// 星群簇交互：
// - 每簇 3-4 张照片 3D 堆叠（rotate + translateZ）
// - hover 时向四方弹性爆发，同时去色→彩色过渡
// - 簇间超大间距（50vw），营造孤独艺术感
//
// 视差背景层：
// - 巨型英文水印随滚动多速平移
// - 透视网格线增强纵深感
// ===================================================================

/** 按天分组后的簇数据 */
interface PhotoCluster {
  dayKey: string
  dayLabel: string
  chapterNum: number
  photos: PhotoWallItem[]
}

export default function AlbumsPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [allPhotos, setAllPhotos] = useState<PhotoWallItem[]>([])
  const [clusters, setClusters] = useState<PhotoCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // 灯箱
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxPhotos, setLightboxPhotos] = useState<any[]>([])

  // 滚动驱动
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [bgOffset1, setBgOffset1] = useState(0)
  const [bgOffset2, setBgOffset2] = useState(0)

  /** 加载全部照片并按天分组 */
  const loadData = async () => {
    setLoading(true)

    try {
      const [profileData, photoData] = await Promise.all([
        fetchProfile('butvan'),
        fetchPublicPhotos(1, 50).catch(() => null),
      ])
      setProfile(profileData)

      const photos = photoData?.records || []
      setAllPhotos(photos)
      setTotal(photos.length)
      const groups = groupByDay(photos)
      setClusters(groups)

      setLightboxPhotos(photos.map(p => ({
        id: p.id,
        mediaId: 0,
        fileName: p.caption || '照片',
        fileUrl: p.fileUrl,
        mimeType: 'image/jpeg',
        fileSize: 0,
        width: p.width,
        height: p.height,
        altText: p.caption,
        caption: p.caption,
        sortOrder: 0,
        createdAt: p.createdAt,
      })))
    } catch (err) {
      console.warn('API 数据加载失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // 纵滚横移 + 视差
  useEffect(() => {
    if (clusters.length === 0 || loading) return

    const handleScroll = () => {
      const wrapper = scrollWrapperRef.current
      const track = trackRef.current
      if (!wrapper || !track) return

      const scrollTop = window.pageYOffset
      const scrollHeight = wrapper.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrollTop / (scrollHeight || 1)))

      // 轨道横向移动 + sin 波动 Y 偏移
      const maxTrackMove = Math.max(0, track.offsetWidth - window.innerWidth + window.innerWidth * 0.4)
      const waveY = Math.sin(progress * Math.PI * 2) * 50
      track.style.transform = `translateX(-${progress * maxTrackMove}px) translateY(${waveY}px)`

      // 背景文字视差（增强滚动感）
      setBgOffset1(-progress * 1200)  // 向左移动更远
      setBgOffset2(progress * 800)    // 向右移动更远

      // 各簇独立缩放（越靠近中心越大）
      const clusters = track.querySelectorAll<HTMLElement>('.photo-cluster')
      clusters.forEach((cluster) => {
        const rect = cluster.getBoundingClientRect()
        const distanceFromCenter = Math.abs(window.innerWidth / 2 - (rect.left + rect.width / 2))
        const scale = Math.max(0.8, 1.2 - distanceFromCenter / 1000)
        cluster.style.transform = `scale(${scale})`
      })
    }

    // 使用 rAF 节流
    let rafId: number
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll() // 初始调用

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [clusters, loading])

  /** 点击照片打开灯箱 */
  const openLightbox = (photoId: number) => {
    const idx = allPhotos.findIndex(p => p.id === photoId)
    if (idx >= 0) setLightboxIndex(idx)
  }

  // 计算滚动包装器高度（簇数量 × 视口系数）
  const scrollHeight = clusters.length > 0
    ? clusters.length * 100 // vh
    : 100

  return (
    <div className="font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* ========== Navbar & Sidebar ========== */}
      <Navbar profile={profile} />
      <SidebarWidget />

      {/* ========== 背景装饰层 ========== */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
        {/* 巨型视差文字 */}
        <span
          className="absolute text-[60vw] font-extrabold text-zinc-100 dark:text-zinc-900 whitespace-nowrap leading-none select-none"
          style={{
            top: '10%',
            left: '-10%',
            transform: `translateX(${bgOffset1}px) translateZ(-100px)`,
            transition: 'transform 0.1s linear',
          }}
        >
          butvan
        </span>
        <span
          className="absolute text-[60vw] font-extrabold whitespace-nowrap leading-none select-none"
          style={{
            bottom: '5%',
            right: '-5%',
            color: 'rgba(61, 193, 211, 0.04)',
            transform: `translateX(${bgOffset2}px) translateZ(-200px)`,
            transition: 'transform 0.1s linear',
          }}
        >
          albums
        </span>

        {/* 透视网格线 */}
        <div
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'rotateX(60deg)',
          }}
        />
      </div>

      {/* ========== 极简页头 ========== */}
      <header className="fixed top-10 left-10 z-50 select-none mix-blend-difference">
        <div className="w-5 h-0.5 bg-[#3dc1d3]" />
        <p className="text-[0.6rem] tracking-[3px] mt-2.5 text-white/70 font-heading">
          VOLUME. {new Date().getFullYear()}
        </p>
      </header>

      {/* ========== 加载态 ========== */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950">
          <Loader2 size={24} className="animate-spin text-zinc-300 dark:text-zinc-600" />
        </div>
      )}

      {/* ========== 空状态 ========== */}
      {!loading && clusters.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl backdrop-blur-md bg-white/5 dark:bg-zinc-900/10 border border-zinc-200/30 dark:border-zinc-800/30">
            <Camera size={24} className="text-zinc-400" />
            <p className="text-sm font-heading text-zinc-400 dark:text-zinc-500">暂无照片，敬请期待</p>
          </div>
        </div>
      )}

      {/* ========== 核心滚动架构 ========== */}
      {!loading && clusters.length > 0 && (
        <>
          <div
            ref={scrollWrapperRef}
            className="relative"
            style={{ height: `${scrollHeight}vh` }}
          >
            <div
              ref={viewportRef}
              className="sticky top-0 h-screen w-screen flex items-center overflow-hidden"
            >
              <div
                ref={trackRef}
                className="flex items-center"
                style={{
                  paddingLeft: '20vw',
                  willChange: 'transform',
                  transition: 'transform 0.2s cubic-bezier(0.19, 1, 0.22, 1)',
                }}
              >
                {clusters.map((cluster) => (
                  <PhotoClusterCard
                    key={cluster.dayKey}
                    cluster={cluster}
                    onPhotoClick={openLightbox}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========== 底部刻度尺 ========== */}
          <Ruler clustersCount={clusters.length} />
        </>
      )}

      {/* ========== 灯箱 ========== */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}

// ==================== 星群簇组件 ====================

function PhotoClusterCard({
  cluster,
  onPhotoClick,
}: {
  cluster: PhotoCluster
  onPhotoClick: (photoId: number) => void
}) {
  // 每簇最多展示 4 张（设计稿 3-4 张）
  const displayPhotos = cluster.photos.slice(0, 4)

  return (
    <section
      className={`photo-cluster flex-shrink-0 relative group photo-cluster-${cluster.dayKey}`}
      style={{
        width: '280px',
        height: '350px',
        marginRight: '40vw',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 簇元信息 */}
      <div
        className={`absolute -top-20 left-0 opacity-50 transition-all duration-700 select-none cm-${cluster.dayKey}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
        }}
      >
        <span className="text-[0.7rem] tracking-[5px] text-[#3dc1d3] font-heading">
          CHAPTER.{String(cluster.chapterNum).padStart(2, '0')}
        </span>
        <h3 className="font-heading text-[2rem] tracking-[-1px] leading-tight mt-1 text-zinc-900 dark:text-zinc-100">
          {cluster.dayLabel}
        </h3>
      </div>

      {/* 照片卡片堆叠 */}
      {displayPhotos.map((photo, idx) => {
        const transforms = getStackTransform(idx)

        return (
          <div
            key={photo.id}
            className={`art-card ac-${cluster.dayKey} absolute inset-0 bg-white dark:bg-zinc-900 p-1.5 shadow-lg cursor-pointer overflow-hidden`}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              transition: 'all 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
              transform: transforms,
              zIndex: 10 - idx,
            }}
            onClick={() => onPhotoClick(photo.id)}
          >
            <img
              src={resolveImageUrl(photo.fileUrl)}
              alt={photo.caption || photo.albumTitle}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )
      })}

      {/* CSS hover 爆发效果 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .photo-cluster-${cluster.dayKey}:hover .ac-${cluster.dayKey}:nth-child(1) {
            transform: translate(-150px, -70px) rotate(-12deg) scale(1.08) !important;
          }
          .photo-cluster-${cluster.dayKey}:hover .ac-${cluster.dayKey}:nth-child(2) {
            transform: translate(125px, -105px) rotate(8deg) scale(0.9) !important;
          }
          .photo-cluster-${cluster.dayKey}:hover .ac-${cluster.dayKey}:nth-child(3) {
            transform: translate(35px, 125px) rotate(-5deg) scale(1.03) !important;
          }
          .photo-cluster-${cluster.dayKey}:hover .ac-${cluster.dayKey}:nth-child(4) {
            opacity: 1 !important;
            transform: translate(-70px, 140px) rotate(5deg) !important;
          }
          .photo-cluster-${cluster.dayKey}:hover .cm-${cluster.dayKey} {
            opacity: 1 !important;
            transform: translateY(-10px) !important;
          }
          .ac-${cluster.dayKey}:nth-child(4) {
            opacity: 0;
          }
        `
      }} />
    </section>
  )
}

/** 默认堆叠 3D 变换 */
function getStackTransform(index: number): string {
  switch (index) {
    case 0: return 'translateZ(30px) rotate(-2deg)'
    case 1: return 'translateZ(15px) rotate(3deg)'
    case 2: return 'translateZ(0) rotate(-1deg)'
    case 3: return 'translateZ(-10px) rotate(2deg)'
    default: return 'translateZ(-20px) rotate(0deg)'
  }
}

// ==================== 刻度尺组件 ====================

function Ruler({ clustersCount }: { clustersCount: number }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tickCount = Math.max(clustersCount * 4, 40)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, window.pageYOffset / (scrollHeight || 1)))
      setActiveIndex(Math.floor(progress * tickCount))
    }

    let rafId: number
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [tickCount])

  return (
    <div
      className="fixed bottom-12 left-[5vw] flex items-end gap-0 z-50 select-none"
      style={{ width: '90vw', height: 20, justifyContent: 'space-between' }}
    >
      {Array.from({ length: tickCount }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: 1,
            height: i === activeIndex ? 30 : 10,
            background: i === activeIndex ? '#3dc1d3' : '#ddd',
          }}
        />
      ))}
    </div>
  )
}

// ==================== 工具函数 ====================

/** 按天分组，并标注章节编号 */
function groupByDay(photos: PhotoWallItem[]): PhotoCluster[] {
  const map = new Map<string, PhotoWallItem[]>()

  for (const photo of photos) {
    const date = new Date(photo.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(photo)
  }

  let chapterNum = 1
  return Array.from(map.entries()).map(([dayKey, photos]) => ({
    dayKey,
    dayLabel: formatDayLabel(dayKey),
    chapterNum: chapterNum++,
    photos,
  }))
}

function formatDayLabel(key: string): string {
  const [year, month, day] = key.split('-')
  return `${year}年${parseInt(month)}月${parseInt(day)}日`
}
