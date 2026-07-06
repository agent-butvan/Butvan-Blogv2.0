import type { AlbumItem, AlbumDetail } from '@/types/album'
import { get } from './http-client'

/**
 * 获取已发布的相册列表（公开接口）
 */
export async function fetchPublicAlbums(): Promise<AlbumItem[]> {
  const data = await get<AlbumItem[]>('/public/albums')
  return data || []
}

/**
 * 根据 slug 获取相册详情（公开接口，含照片列表）
 */
export async function fetchAlbumBySlug(slug: string): Promise<AlbumDetail> {
  return await get<AlbumDetail>(`/public/albums/${slug}`)
}
