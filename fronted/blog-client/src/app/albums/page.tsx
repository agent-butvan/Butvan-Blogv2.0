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

// ==================== 演示数据（测试滚动交互用） ====================
const DEMO_PHOTOS: PhotoWallItem[] = [
  // 7月6日
  { id: 101, fileUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', width: 800, height: 450, caption: '山间晨雾', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-07-06T08:00:00' },
  { id: 102, fileUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800', width: 800, height: 533, caption: '林间光影', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-07-06T09:00:00' },
  { id: 103, fileUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', width: 800, height: 533, caption: '绿野仙踪', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-07-06T10:00:00' },
  // 7月5日
  { id: 104, fileUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800', width: 800, height: 533, caption: '城市夜幕', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-07-05T20:00:00' },
  { id: 105, fileUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800', width: 800, height: 534, caption: '霓虹街头', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-07-05T21:00:00' },
  { id: 106, fileUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', width: 800, height: 533, caption: '地铁光影', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-07-05T22:00:00' },
  { id: 107, fileUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', width: 800, height: 533, caption: '雨后街道', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-07-05T23:00:00' },
  // 7月3日
  { id: 108, fileUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', width: 800, height: 450, caption: '远山呼唤', albumTitle: '旅行记忆', albumSlug: 'travel', createdAt: '2026-07-03T14:00:00' },
  { id: 109, fileUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', width: 800, height: 533, caption: '湖心小筑', albumTitle: '旅行记忆', albumSlug: 'travel', createdAt: '2026-07-03T15:00:00' },
  { id: 110, fileUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', width: 800, height: 600, caption: '山巅之上', albumTitle: '旅行记忆', albumSlug: 'travel', createdAt: '2026-07-03T16:00:00' },
  // 6月30日
  { id: 111, fileUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', width: 800, height: 534, caption: '金色海岸', albumTitle: '夏日海滩', albumSlug: 'beach', createdAt: '2026-06-30T10:00:00' },
  { id: 112, fileUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', width: 800, height: 533, caption: '浪花轻拍', albumTitle: '夏日海滩', albumSlug: 'beach', createdAt: '2026-06-30T11:00:00' },
  { id: 113, fileUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800', width: 800, height: 533, caption: '日落海滩', albumTitle: '夏日海滩', albumSlug: 'beach', createdAt: '2026-06-30T18:00:00' },
  { id: 114, fileUrl: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800', width: 800, height: 1200, caption: '沙滩脚印', albumTitle: '夏日海滩', albumSlug: 'beach', createdAt: '2026-06-30T19:00:00' },
  // 6月25日
  { id: 115, fileUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', width: 800, height: 534, caption: '翠谷漫步', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-25T09:00:00' },
  { id: 116, fileUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800', width: 800, height: 400, caption: '瀑布飞泻', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-25T10:00:00' },
  { id: 117, fileUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=800', width: 800, height: 533, caption: '森林浴', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-25T11:00:00' },
  // 6月20日
  { id: 118, fileUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800', width: 800, height: 600, caption: '雪山晨曦', albumTitle: '旅行记忆', albumSlug: 'travel', createdAt: '2026-06-20T06:00:00' },
  { id: 119, fileUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', width: 800, height: 600, caption: '登顶之乐', albumTitle: '旅行记忆', albumSlug: 'travel', createdAt: '2026-06-20T08:00:00' },
  // 6月15日
  { id: 120, fileUrl: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800', width: 800, height: 533, caption: '日式庭院', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-06-15T13:00:00' },
  { id: 121, fileUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', width: 800, height: 400, caption: '老街一角', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-06-15T14:00:00' },
  { id: 122, fileUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', width: 800, height: 534, caption: '城市天际线', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-06-15T17:00:00' },
  { id: 123, fileUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', width: 800, height: 533, caption: '暮色都市', albumTitle: '城市掠影', albumSlug: 'city', createdAt: '2026-06-15T19:00:00' },
  // 6月10日
  { id: 124, fileUrl: 'https://images.unsplash.com/photo-1445264918150-66a2371142a2?w=800', width: 800, height: 533, caption: '秋日私语', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-10T08:00:00' },
  { id: 125, fileUrl: 'https://images.unsplash.com/photo-1442850473887-0fb77cd0b337?w=800', width: 800, height: 500, caption: '金色大道', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-10T09:00:00' },
  { id: 126, fileUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800', width: 800, height: 533, caption: '鹿鸣山林', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-10T10:00:00' },
  // 6月5日
  { id: 127, fileUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800', width: 800, height: 534, caption: '春暖花开', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-05T07:00:00' },
  { id: 128, fileUrl: 'https://images.unsplash.com/photo-1444021465936-c6ca81bf39ce?w=800', width: 800, height: 533, caption: '花海徜徉', albumTitle: '自然风光', albumSlug: 'nature', createdAt: '2026-06-05T08:00:00' },
  // 6月1日
  { id: 129, fileUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', width: 800, height: 533, caption: '烛光晚餐', albumTitle: '生活碎片', albumSlug: 'life', createdAt: '2026-06-01T19:00:00' },
  { id: 130, fileUrl: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800', width: 800, height: 533, caption: '咖啡时光', albumTitle: '生活碎片', albumSlug: 'life', createdAt: '2026-06-01T15:00:00' },
  { id: 131, fileUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800', width: 800, height: 533, caption: '运动时刻', albumTitle: '生活碎片', albumSlug: 'life', createdAt: '2026-06-01T07:00:00' },
]

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

    // 演示数据：直接使用，保证页面始终可展示
    let photos: PhotoWallItem[] = DEMO_PHOTOS
    console.log('[Albums] 初始演示数据:', DEMO_PHOTOS.length, '张')

    try {
      const [profileData, photoData] = await Promise.all([
        fetchProfile('butvan'),
        fetchPublicPhotos(1, 50).catch(() => null),
      ])
      setProfile(profileData)

      // 如果后端有足够多的真实数据（>10张）则使用真实数据，否则使用演示数据
      if (photoData?.records?.length && photoData.records.length > 10) {
        console.log('[Albums] 使用后端数据:', photoData.records.length, '张')
        photos = photoData.records
      } else {
        console.log('[Albums] 后端数据不足（', photoData?.records?.length || 0, '张），使用演示数据（31张）')
      }
    } catch (err) {
      // 即使 API 全部失败也不影响演示数据展示
      console.warn('API 数据加载失败，使用演示数据:', err)
    }

    console.log('[Albums] 最终照片数:', photos.length)
    setAllPhotos(photos)
    setTotal(photos.length)
    const groups = groupByDay(photos)
    console.log('[Albums] 分组后簇数量:', groups.length)
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

    setLoading(false)
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

      // 背景文字视差
      setBgOffset1(-progress * 500)
      setBgOffset2(progress * 300)

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
          className="absolute text-[35vw] font-extrabold text-zinc-100 dark:text-zinc-900 whitespace-nowrap leading-none select-none"
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
          className="absolute text-[35vw] font-extrabold whitespace-nowrap leading-none select-none"
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
