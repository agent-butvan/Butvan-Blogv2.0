/**
 * 友链类型定义
 */

export interface FriendLink {
  id: number
  name: string
  url: string
  avatarUrl: string | null
  description: string | null
  category: string
  sortOrder: number
  createdAt: string
}

export interface FriendLinkApply {
  name: string
  url: string
  avatarUrl?: string
  description: string
  category: string
  email: string
  remark?: string
}

export const FRIEND_CATEGORIES = [
  { value: 'TECH', label: '技术博客', color: '#4CAF50' },
  { value: 'DESIGN', label: '设计创意', color: '#009688' },
  { value: 'LIFE', label: '生活记录', color: '#8BC34A' },
  { value: 'PERSONAL', label: '个人站点', color: '#FF9800' },
] as const