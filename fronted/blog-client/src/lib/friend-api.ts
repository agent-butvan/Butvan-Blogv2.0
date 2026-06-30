import type { FriendLink, FriendLinkApply } from '@/types/friend'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

/**
 * 获取已批准的友链列表
 */
export async function fetchFriendLinks(category?: string): Promise<FriendLink[]> {
  const params = category ? `?category=${category}` : ''
  const res = await fetch(`${API_BASE}/friends${params}`, { 
    cache: 'no-store' 
  })
  const data = await res.json()
  return data.data || []
}

/**
 * 申请友链
 */
export async function applyFriendLink(data: FriendLinkApply): Promise<void> {
  const res = await fetch(`${API_BASE}/friends/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('申请失败')
  }
}