import type { AlbumItem, AlbumDetail, PhotoWallPage } from '@/types/album'
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

/**
 * 分页获取已发布相册中的全部照片（时间线照片墙，公开接口）
 *
 * @param page 页码（1-based）
 * @param size 每页大小（最大50）
 * @returns 照片墙分页结果
 */
export async function fetchPublicPhotos(page: number = 1, size: number = 20): Promise<PhotoWallPage> {
  return await get<PhotoWallPage>(`/public/photos?page=${page}&size=${size}`)
}
