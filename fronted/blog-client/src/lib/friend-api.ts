import type { FriendLink, FriendLinkApply } from '@/types/friend'
import { get, post, upload } from './http-client'

/**
 * 获取已批准的友链列表
 */
export async function fetchFriendLinks(category?: string): Promise<FriendLink[]> {
  const params = category ? `?category=${category}` : ''
  const data = await get<FriendLink[]>(`/friends${params}`)
  return data || []
}

/**
 * 申请友链
 */
export async function applyFriendLink(data: FriendLinkApply): Promise<void> {
  await post<void>('/friends/apply', data as unknown as Record<string, unknown>)
}

/**
 * 公开上传图片（用于友链头像等无需登录的场景）
 * @param file 图片文件
 * @returns 相对路径 /uploads/filename.ext
 */
export async function uploadPublicImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const relativePath = await upload<string>('/public/upload/image', formData)
  return relativePath
}

/**
 * 从 URL 抓取网站元数据（标题、描述、favicon）
 * @param url 目标网站地址
 * @returns 网站元数据
 */
export async function fetchWebMeta(url: string): Promise<{ title: string; description: string; faviconUrl: string; domain: string; success: boolean; errorMsg?: string }> {
  const data = await post<{ title: string; description: string; faviconUrl: string; domain: string; success: boolean; errorMsg?: string }>('/friends/fetch-meta', { url })
  return data
}