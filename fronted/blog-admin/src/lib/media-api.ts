import apiClient from "./api";

export interface MediaQuery {
  page?: number;
  size?: number;
  fileType?: string;
  keyword?: string;
  sourceType?: string;
}

export interface MediaItem {
  id: number;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileType: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  bucketName: string;
  uploaderId?: number;
  sourceType?: string;
  sourceId?: number;
  sourceDetail?: string;
  createdAt: string;
}

/**
 * 分页检索已上传的媒体资源列表
 */
export async function fetchMediaList(params: MediaQuery) {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.size) query.append("size", String(params.size));
  if (params.fileType) query.append("fileType", params.fileType);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.sourceType) query.append("sourceType", params.sourceType);

  const res = await apiClient.get(`/admin/media?${query.toString()}`);
  return res.data.data;
}

/**
 * 彻底物理删除单条媒体资源及对应本地磁盘文件
 */
export async function deleteMediaItem(id: number) {
  const res = await apiClient.delete(`/admin/media/${id}`);
  return res.data;
}

/**
 * 上传单条媒体图片或文件（含来源模块标记）
 */
export async function uploadMediaFile(file: File, sourceType?: string, sourceId?: number, sourceDetail?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (sourceType) formData.append("sourceType", sourceType);
  if (sourceId) formData.append("sourceId", String(sourceId));
  if (sourceDetail) formData.append("sourceDetail", sourceDetail);

  const res = await apiClient.post("/admin/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
