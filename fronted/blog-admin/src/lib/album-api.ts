import apiClient from "./api";

// ==================== 类型定义 ====================

/** 相册列表项 */
export interface AlbumItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverImageId?: number;
  coverImageUrl?: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  viewCount: number;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 相册详情（含照片列表） */
export interface AlbumDetail extends AlbumItem {
  photos: AlbumPhotoItem[];
}

/** 相册照片 */
export interface AlbumPhotoItem {
  id: number;
  mediaId: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  sortOrder: number;
  createdAt: string;
}

/** 相册保存参数 */
export interface AlbumSaveParams {
  title: string;
  slug?: string;
  description?: string;
  coverImageId?: number;
  status?: string;
  sortOrder?: number;
}

/** 相册查询参数 */
export interface AlbumQueryParams {
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
}

/** 分页结果 */
export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}

// ==================== API 方法 ====================

/**
 * 分页查询相册列表（管理后台）
 */
export async function fetchAlbumList(params: AlbumQueryParams): Promise<PageResult<AlbumItem>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.size) query.append("size", String(params.size));
  if (params.status) query.append("status", params.status);
  if (params.keyword) query.append("keyword", params.keyword);

  const res = await apiClient.get(`/admin/albums?${query.toString()}`);
  return res.data.data;
}

/**
 * 获取相册详情（管理后台）
 */
export async function fetchAlbumDetail(id: number): Promise<AlbumDetail> {
  const res = await apiClient.get(`/admin/albums/${id}`);
  return res.data.data;
}

/**
 * 创建相册
 */
export async function createAlbum(params: AlbumSaveParams): Promise<AlbumDetail> {
  const res = await apiClient.post("/admin/albums", params);
  return res.data.data;
}

/**
 * 更新相册
 */
export async function updateAlbum(id: number, params: AlbumSaveParams): Promise<AlbumDetail> {
  const res = await apiClient.put(`/admin/albums/${id}`, params);
  return res.data.data;
}

/**
 * 删除相册
 */
export async function deleteAlbum(id: number): Promise<void> {
  await apiClient.delete(`/admin/albums/${id}`);
}

/**
 * 向相册添加照片
 */
export async function addPhotoToAlbum(albumId: number, mediaId: number, caption?: string): Promise<AlbumDetail> {
  const res = await apiClient.post(`/admin/albums/${albumId}/photos`, {
    mediaId,
    caption: caption || "",
  });
  return res.data.data;
}

/**
 * 从相册移除照片
 */
export async function removePhotoFromAlbum(albumId: number, photoId: number): Promise<void> {
  await apiClient.delete(`/admin/albums/${albumId}/photos/${photoId}`);
}

/**
 * 调整相册照片排序
 */
export async function sortAlbumPhotos(albumId: number, items: { photoId: number; sortOrder: number }[]): Promise<void> {
  await apiClient.put(`/admin/albums/${albumId}/photos/sort`, { items });
}
