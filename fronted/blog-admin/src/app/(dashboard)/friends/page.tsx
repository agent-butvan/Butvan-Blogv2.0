'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  X,
  Check,
  XIcon,
  Trash2,
  ExternalLink,
  Link2,
  Globe,
  Mail,
  Calendar,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import {
  Avatar,
  Chip,
  Tooltip,
  Spinner,
  Dropdown,
  Button
} from '@heroui/react'
import { cn } from '@heroui/react'
import apiClient from '@/lib/api'
import { toast } from '@/lib/toast'
import ConfirmModal from '@/components/common/ConfirmModal'

/**
 * 友链数据类型定义
 */
interface FriendLink {
  id: number
  name: string
  url: string
  avatarUrl: string | null
  description: string | null
  category: string
  email: string | null
  status: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 状态 Tab 定义 - 紧凑过滤切换
 */
const STATUS_TABS = [
  { label: '全部', value: 'all', color: 'text-zinc-700 dark:text-zinc-300' },
  { label: '待审核', value: 'PENDING', color: 'text-amber-600 dark:text-amber-400' },
  { label: '已通过', value: 'APPROVED', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: '已拒绝', value: 'REJECTED', color: 'text-red-600 dark:text-red-400' }
]

/**
 * 分类映射表
 */
const CATEGORY_MAP: Record<string, { label: string; color: 'accent' | 'success' | 'warning' | 'danger' | 'default' }> = {
  TECH: { label: '技术博客', color: 'accent' },
  DESIGN: { label: '设计创意', color: 'warning' },
  LIFE: { label: '生活记录', color: 'success' },
  PERSONAL: { label: '个人站点', color: 'default' }
}

/**
 * 状态 Chip 配置
 */
const STATUS_CHIP: Record<string, { label: string; color: 'warning' | 'success' | 'danger'; variant: 'soft' | 'primary' }> = {
  PENDING: { label: '待审核', color: 'warning', variant: 'soft' },
  APPROVED: { label: '已通过', color: 'success', variant: 'soft' },
  REJECTED: { label: '已拒绝', color: 'danger', variant: 'soft' }
}

/**
 * 解析头像地址，兼容后端返回的相对上传路径
 */
const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return ''
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) return avatarUrl
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
  const host = apiBase.replace(/\/api$/, '')
  return avatarUrl.startsWith('/') ? `${host}${avatarUrl}` : avatarUrl
}

/**
 * 友链管理页面
 * - 深度集成 HeroUI v3 组件库
 * - 卡片流式布局，紧凑间距
 * - Tab 状态过滤 + 搜索
 */
export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [currentTab, setCurrentTab] = useState('all')
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<number, boolean>>({})

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    friendId: number | null
    friendName: string
    type: 'approve' | 'reject' | 'delete'
  }>({ open: false, friendId: null, friendName: '', type: 'approve' })

  /** 加载友链数据 */
  const loadFriends = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<any>('/admin/friends')
      if (res.data?.data) {
        setFriends(res.data.data)
      }
    } catch (err: any) {
      console.error('加载友链失败:', err)
      toast.error(err.message || '加载友链列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()
  }, [])

  /** 触发搜索 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchVal.trim())
  }

  /** 清空搜索 */
  const handleClearSearch = () => {
    setSearchVal('')
    setSearchQuery('')
  }

  /** 切换 Tab */
  const handleTabChange = (status: string) => {
    setCurrentTab(status)
  }

  /** 设置操作加载状态 */
  const setActionLoading = (id: number, isLoading: boolean) => {
    setActionLoadingMap(prev => ({ ...prev, [id]: isLoading }))
  }

  /** 审核通过 */
  const handleApprove = async (id: number) => {
    setActionLoading(id, true)
    try {
      await apiClient.patch(`/admin/friends/${id}/status`, { status: 'APPROVED' })
      toast.success('友链已审核通过')
      loadFriends()
    } catch (err: any) {
      toast.error(err.message || '审核操作失败')
    } finally {
      setActionLoading(id, false)
    }
  }

  /** 审核拒绝 */
  const handleReject = async (id: number) => {
    setActionLoading(id, true)
    try {
      await apiClient.patch(`/admin/friends/${id}/status`, { status: 'REJECTED' })
      toast.success('友链已拒绝')
      loadFriends()
    } catch (err: any) {
      toast.error(err.message || '审核操作失败')
    } finally {
      setActionLoading(id, false)
    }
  }

  /** 删除友链 */
  const handleDelete = async (id: number) => {
    setActionLoading(id, true)
    try {
      await apiClient.delete(`/admin/friends/${id}`)
      toast.success('友链已删除')
      loadFriends()
    } catch (err: any) {
      toast.error(err.message || '删除操作失败')
    } finally {
      setActionLoading(id, false)
    }
  }

  /** 打开确认弹窗 */
  const openConfirm = (friend: FriendLink, type: 'approve' | 'reject' | 'delete') => {
    setConfirmModal({ open: true, friendId: friend.id, friendName: friend.name, type })
  }

  /** 执行确认操作 */
  const handleConfirmAction = () => {
    if (!confirmModal.friendId) return
    switch (confirmModal.type) {
      case 'approve':
        handleApprove(confirmModal.friendId)
        break
      case 'reject':
        handleReject(confirmModal.friendId)
        break
      case 'delete':
        handleDelete(confirmModal.friendId)
        break
    }
    setConfirmModal(prev => ({ ...prev, open: false, friendId: null }))
  }

  /** 统计各状态数量 */
  const stats = useMemo(() => ({
    total: friends.length,
    pending: friends.filter(f => f.status === 'PENDING').length,
    approved: friends.filter(f => f.status === 'APPROVED').length,
    rejected: friends.filter(f => f.status === 'REJECTED').length
  }), [friends])

  /** 过滤后的友链列表 */
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => {
      const matchesSearch = !searchQuery ||
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.url.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = currentTab === 'all' || friend.status === currentTab
      return matchesSearch && matchesStatus
    })
  }, [friends, searchQuery, currentTab])

  /** 确认弹窗配置 */
  const confirmConfig = {
    approve: {
      title: '确认通过此友链？',
      description: `"${confirmModal.friendName}" 将被标记为已通过状态，在前台友链页面展示。`,
      confirmLabel: '确认通过',
      variant: 'primary' as const
    },
    reject: {
      title: '确认拒绝此友链？',
      description: `"${confirmModal.friendName}" 将被标记为已拒绝状态，不会在前台展示。`,
      confirmLabel: '确认拒绝',
      variant: 'warning' as const
    },
    delete: {
      title: '确认删除此友链？',
      description: `"${confirmModal.friendName}" 将被永久删除，此操作不可撤销。`,
      confirmLabel: '确认删除',
      variant: 'danger' as const
    }
  }

  const currentConfirm = confirmConfig[confirmModal.type]

  return (
    <div className="space-y-4">
      {/* ── 头部：标题 + 内联统计 ── */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">友链管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / FRIEND LINKS (共 {stats.total} 个友链)
          </p>
        </div>
        {/* 刷新按钮 */}
        <Tooltip delay={0}>
          <button
            onClick={loadFriends}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
          </button>
          <Tooltip.Content>
            <p>刷新列表</p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      {/* ── 内联统计条 ── */}
      <div className="flex items-center gap-4 text-[11px] font-mono select-none">
        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          总计 <span className="font-bold text-zinc-700 dark:text-zinc-200">{stats.total}</span>
        </span>
        <span className="flex items-center gap-1.5 text-amber-600/80 dark:text-amber-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          待审核 <span className="font-bold">{stats.pending}</span>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600/80 dark:text-emerald-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          已通过 <span className="font-bold">{stats.approved}</span>
        </span>
        <span className="flex items-center gap-1.5 text-red-600/80 dark:text-red-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          已拒绝 <span className="font-bold">{stats.rejected}</span>
        </span>
      </div>

      {/* ── 过滤区：Tab + 搜索 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50">
        {/* 状态 Tabs */}
        <div className="flex items-center gap-1 select-none overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? stats.total :
              tab.value === 'PENDING' ? stats.pending :
                tab.value === 'APPROVED' ? stats.approved : stats.rejected
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap outline-none border-0 flex items-center gap-1.5',
                  currentTab === tab.value
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200'
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  'text-[10px] font-mono',
                  currentTab === tab.value ? 'text-white/70' : 'text-zinc-400 dark:text-zinc-550'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 flex-1 w-full sm:w-60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索友链名称、描述或地址..."
              className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-150 outline-none placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-0 leading-normal"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            搜索
          </button>
        </form>
      </div>

      {/* ── 友链列表 ── */}
      {loading ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-16 text-center select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Spinner size="sm" color="current" />
            <span className="text-[11px] font-medium tracking-wide">正在加载友链列表...</span>
          </div>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-16 text-center text-zinc-400 select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2">
            <Link2 size={20} className="text-zinc-300 dark:text-zinc-800" />
            <span className="text-[11px]">
              {searchQuery ? '未找到匹配的友链数据' : '暂无友链数据'}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFriends.map((friend) => {
            const isPending = friend.status === 'PENDING'
            const isApproved = friend.status === 'APPROVED'
            const isRejected = friend.status === 'REJECTED'
            const isActionLoading = actionLoadingMap[friend.id] || false
            const categoryInfo = CATEGORY_MAP[friend.category] || CATEGORY_MAP.PERSONAL
            const statusInfo = STATUS_CHIP[friend.status] || STATUS_CHIP.PENDING

            return (
              <div
                key={friend.id}
                className="group rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-start gap-3.5">
                  {/* 头像区 - 固定44px尺寸 */}
                  <div className="shrink-0 w-[44px] h-[44px]">
                    <Avatar size="md" className="w-full h-full ring-1 ring-zinc-200/40 dark:ring-zinc-800 transition-all duration-300 group-hover:ring-primary/30">
                      {friend.avatarUrl ? (
                        <Avatar.Image
                          alt={friend.name}
                          src={resolveAvatarUrl(friend.avatarUrl)}
                          className="!w-full !h-full object-cover"
                        />
                      ) : null}
                      <Avatar.Fallback className="!w-full !h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                        <Globe size={16} />
                      </Avatar.Fallback>
                    </Avatar>
                  </div>

                  {/* 主体信息 */}
                  <div className="flex-1 min-w-0">
                    {/* 第一行：名称 + 状态 + 分类 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-neutral-dark dark:text-zinc-200 leading-snug truncate max-w-[180px]">
                        {friend.name}
                      </span>
                      <Chip
                        size="sm"
                        color={statusInfo.color}
                        variant={statusInfo.variant}
                      >
                        {statusInfo.label}
                      </Chip>
                      <Chip
                        size="sm"
                        color={categoryInfo.color}
                        variant="soft"
                      >
                        {categoryInfo.label}
                      </Chip>
                      {friend.sortOrder > 0 && (
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 bg-zinc-100/60 dark:bg-zinc-900 px-1.5 py-0.5 rounded select-none">
                          #{friend.sortOrder}
                        </span>
                      )}
                    </div>

                    {/* 描述 */}
                    {friend.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-1 leading-relaxed">
                        {friend.description}
                      </p>
                    )}

                    {/* 元数据行 */}
                    <div className="flex flex-wrap items-center gap-3.5 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                      <a
                        href={friend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer truncate max-w-[240px]"
                        title={friend.url}
                      >
                        <Globe size={11} className="shrink-0" />
                        <span className="truncate">{friend.url.replace(/^https?:\/\//, '')}</span>
                      </a>
                      {friend.email && (
                        <a
                          href={`mailto:${friend.email}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Mail size={11} className="shrink-0" />
                          <span>{friend.email}</span>
                        </a>
                      )}
                      <span className="flex items-center gap-1" title="申请时间">
                        <Calendar size={11} className="shrink-0" />
                        <span>
                          {new Date(friend.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 右侧操作区 - 固定宽度防止挤压 */}
                  <div className="flex items-center gap-1 shrink-0 select-none w-[140px] justify-end">
                    {/* 操作加载指示 */}
                    {isActionLoading && (
                      <Spinner size="sm" color="current" className="text-primary mr-1" />
                    )}

                    {/* 待审核：通过 / 拒绝 */}
                    {isPending && (
                      <>
                        <Tooltip delay={0}>
                          <button
                            onClick={() => openConfirm(friend, 'approve')}
                            disabled={isActionLoading}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Check size={15} />
                          </button>
                          <Tooltip.Content>
                            <p>审核通过</p>
                          </Tooltip.Content>
                        </Tooltip>
                        <Tooltip delay={0}>
                          <button
                            onClick={() => openConfirm(friend, 'reject')}
                            disabled={isActionLoading}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <XIcon size={15} />
                          </button>
                          <Tooltip.Content>
                            <p>拒绝申请</p>
                          </Tooltip.Content>
                        </Tooltip>
                      </>
                    )}

                    {/* 访问链接 */}
                    <Tooltip delay={0}>
                      <a
                        href={friend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <Tooltip.Content>
                        <p>访问网站</p>
                      </Tooltip.Content>
                    </Tooltip>

                    {/* 更多操作下拉 */}
                    <Dropdown>
                      <Button
                        aria-label="更多操作"
                        variant="tertiary"
                        size="sm"
                        isIconOnly
                        className="h-7 w-7 min-w-0 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        isDisabled={isActionLoading}
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                      <Dropdown.Popover>
                        <Dropdown.Menu
                          onAction={(key) => {
                            if (key === 'delete') openConfirm(friend, 'delete')
                            if (key === 'approve' && isPending) openConfirm(friend, 'approve')
                            if (key === 'reject' && isPending) openConfirm(friend, 'reject')
                          }}
                        >
                          {isPending && (
                            <>
                              <Dropdown.Item id="approve" textValue="审核通过">
                                <Check size={14} className="text-emerald-500" />
                                <span className="ml-2 text-xs">审核通过</span>
                              </Dropdown.Item>
                              <Dropdown.Item id="reject" textValue="拒绝申请">
                                <XIcon size={14} className="text-red-400" />
                                <span className="ml-2 text-xs">拒绝申请</span>
                              </Dropdown.Item>
                            </>
                          )}
                          <Dropdown.Item id="delete" textValue="删除友链" variant="danger">
                            <Trash2 size={14} />
                            <span className="ml-2 text-xs">删除友链</span>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 底部信息 ── */}
      {!loading && filteredFriends.length > 0 && (
        <div className="flex items-center justify-between pt-1 select-none">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            SHOWING {filteredFriends.length} OF {friends.length} RECORDS
          </span>
        </div>
      )}

      {/* ── 确认弹窗 ── */}
      <ConfirmModal
        open={confirmModal.open}
        title={currentConfirm.title}
        description={currentConfirm.description}
        confirmLabel={currentConfirm.confirmLabel}
        variant={currentConfirm.variant}
        loading={confirmModal.friendId ? (actionLoadingMap[confirmModal.friendId] || false) : false}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false, friendId: null }))}
      />
    </div>
  )
}