'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react'
import apiClient from '@/lib/api'

/**
 * 友链数据类型
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
 * 友链管理页面
 */
export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 加载友链数据
  const loadFriends = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<any>('/admin/friends')
      if (res.data?.data) {
        setFriends(res.data.data)
      }
    } catch (err) {
      console.error('加载友链失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()
  }, [])

  // 审核通过
  const handleApprove = async (id: number) => {
    try {
      await apiClient.patch(`/admin/friends/${id}/status`, { status: 'APPROVED' })
      loadFriends()
    } catch (err) {
      console.error('审核失败:', err)
    }
  }

  // 审核拒绝
  const handleReject = async (id: number) => {
    try {
      await apiClient.patch(`/admin/friends/${id}/status`, { status: 'REJECTED' })
      loadFriends()
    } catch (err) {
      console.error('审核失败:', err)
    }
  }

  // 删除友链
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个友链吗？')) return
    try {
      await apiClient.delete(`/admin/friends/${id}`)
      loadFriends()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  // 筛选
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || friend.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 分类标签
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'TECH': '技术博客',
      'DESIGN': '设计创意',
      'LIFE': '生活记录',
      'PERSONAL': '个人站点'
    }
    return labels[category] || category
  }

  // 状态标签
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string, text: string }> = {
      'PENDING': { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', text: '待审核' },
      'APPROVED': { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', text: '已通过' },
      'REJECTED': { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', text: '已拒绝' }
    }
    const badge = badges[status] || badges['PENDING']
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>{badge.text}</span>
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-zinc-800 dark:text-zinc-100">
            友链管理
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            管理友链申请与展示
          </p>
        </div>
        <button
          onClick={loadFriends}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw size={14} />
          刷新
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索友链名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">全部状态</option>
          <option value="PENDING">待审核</option>
          <option value="APPROVED">已通过</option>
          <option value="REJECTED">已拒绝</option>
        </select>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{friends.length}</div>
          <div className="text-xs text-zinc-500">总友链数</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-600">
            {friends.filter(f => f.status === 'PENDING').length}
          </div>
          <div className="text-xs text-zinc-500">待审核</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {friends.filter(f => f.status === 'APPROVED').length}
          </div>
          <div className="text-xs text-zinc-500">已通过</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">
            {friends.filter(f => f.status === 'REJECTED').length}
          </div>
          <div className="text-xs text-zinc-500">已拒绝</div>
        </div>
      </div>

      {/* 友链列表 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Filter size={32} className="mb-2" />
            <p>暂无友链数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">友链信息</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">分类</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">状态</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">排序</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredFriends.map((friend) => (
                  <tr key={friend.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🔗</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                            {friend.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                            {friend.description || '暂无描述'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                        {getCategoryLabel(friend.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(friend.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{friend.sortOrder}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {friend.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(friend.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              title="通过"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(friend.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="拒绝"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <a
                          href={friend.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="访问"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(friend.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}