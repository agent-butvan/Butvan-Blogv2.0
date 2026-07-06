/**
 * 相册相关类型定义
 */

/** 相册列表项（公开接口返回） */
export interface AlbumItem {
  id: number
  title: string
  slug: string
  description?: string
  coverImageUrl?: string
  photoCount: number
  createdAt: string
}

/** 相册照片 */
export interface AlbumPhoto {
  id: number
  mediaId: number
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  width?: number
  height?: number
  altText?: string
  caption?: string
  sortOrder: number
  createdAt: string
}

/** 相册详情（含照片列表） */
export interface AlbumDetail extends AlbumItem {
  coverImageId?: number
  status: string
  sortOrder: number
  viewCount: number
  photos: AlbumPhoto[]
  updatedAt: string
}

/** 照片墙条目（跨相册聚合，按时间排列，公开接口返回） */
export interface PhotoWallItem {
  id: number
  fileUrl: string
  width?: number
  height?: number
  caption?: string
  albumTitle: string
  albumSlug: string
  createdAt: string
}

/** 照片墙分页结果 */
export interface PhotoWallPage {
  records: PhotoWallItem[]
  total: number
  page: number
  size: number
}
