'use client'

import React, { useEffect, useRef } from 'react'
import { ArrowUpRight, Globe, MessageSquarePlus } from 'lucide-react'
import type { FriendLink } from '@/types/friend'
import { FRIEND_CATEGORIES } from '@/types/friend'
import { resolveImageUrl } from '@/lib/image-url'
import gsap from 'gsap'

interface FriendLinksProps {
  friends: FriendLink[]
  onFriendClick: (friend: FriendLink) => void
}

/**
 * 友链目录组件
 * 按分类纵向分组的编辑式列表布局，紧凑信息密度
 * 取代旧版 SVG 大树可视化——更可读、更紧凑、更贴合站点设计语言
 */
export default function FriendLinks({ friends, onFriendClick }: FriendLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 入场动画：分类分组与友链行交错出现
  useEffect(() => {
    if (!containerRef.current || friends.length === 0) return

    const ctx = gsap.context(() => {
      // 分类分组入场
      gsap.fromTo('.friend-section',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' }
      )

      // 友链行交错滑入
      gsap.fromTo('.friend-row',
        { x: -10, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.035,
          ease: 'power2.out',
          delay: 0.12
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [friends])

  // 解析头像地址
  const resolveAvatar = (url: string | null) => resolveImageUrl(url || '')

  // 提取域名展示
  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  // 按分类分组（保持 FRIEND_CATEGORIES 顺序）
  const groupedFriends = FRIEND_CATEGORIES.map(cat => ({
    ...cat,
    friends: friends.filter(f => f.category === cat.value)
  })).filter(g => g.friends.length > 0)

  // 空状态
  if (friends.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 mb-3">
          <MessageSquarePlus size={18} />
        </div>
        <p className="text-sm font-heading font-semibold text-zinc-700 dark:text-zinc-300">还没有友链加入</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">成为第一个友链，让这里热闹起来</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4">
      {groupedFriends.map((group) => (
        <section key={group.value} className="friend-section mb-9 last:mb-0">
          {/* 分类标题行 */}
          <div className="flex items-baseline gap-2.5 mb-2 pb-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[-1px]"
              style={{ backgroundColor: group.color }}
              aria-hidden="true"
            />
            <h2 className="font-heading font-semibold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
              {group.label}
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              {group.friends.length.toString().padStart(2, '0')}
            </span>
          </div>

          {/* 友链列表 */}
          <ul className="divide-y divide-zinc-100/80 dark:divide-zinc-900/80">
            {group.friends.map((friend) => {
              const avatarUrl = resolveAvatar(friend.avatarUrl)
              const domain = extractDomain(friend.url)

              return (
                <li key={friend.id}>
                  <button
                    type="button"
                    onClick={() => onFriendClick(friend)}
                    className="friend-row group w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors duration-200 cursor-pointer text-left"
                  >
                    {/* 头像 */}
                    <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                          {friend.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* 名称 + 描述 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#727BBA] dark:group-hover:text-[#727BBA] transition-colors duration-200">
                        {friend.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {friend.description || domain}
                      </p>
                    </div>

                    {/* 域名（PC 端可见） */}
                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[150px] shrink-0">
                      <Globe size={10} className="shrink-0" />
                      <span className="truncate">{domain}</span>
                    </span>

                    {/* 访问箭头 */}
                    <span
                      className="shrink-0 w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:border-[#727BBA] group-hover:text-[#727BBA] group-hover:bg-[#727BBA]/5 transition-all duration-200"
                      aria-hidden="true"
                    >
                      <ArrowUpRight
                        size={12}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                      />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
