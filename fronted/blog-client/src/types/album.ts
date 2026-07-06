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
