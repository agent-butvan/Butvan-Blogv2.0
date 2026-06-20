import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";

export interface LikeItem {
  id: number;
  articleId: number;
  articleTitle: string;
  articleSlug: string;
  ipAddress: string;
  userAgent: string;
  userId: number | null;
  userNickname: string;
  userAvatar: string | null;
  createdAt: string;
}

export interface LikeQuery {
  page?: number;
  size?: number;
  keyword?: string;
}

/**
 * 后台分页获取点赞流水记录 (GET /admin/likes)
 *
 * @param query 检索查询参数
 * @returns 分页后的点赞流水记录
 */
export async function fetchAdminLikes(
  query: LikeQuery
): Promise<PageResult<LikeItem>> {
  const res = await apiClient.get<ApiResponse<PageResult<LikeItem>>>("/admin/likes", {
    params: query,
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 后台批量物理删除点赞记录 (DELETE /admin/likes)
 *
 * @param ids 待物理删除的点赞流水记录 ID 集合
 */
export async function deleteLikes(ids: number[]): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>("/admin/likes", {
    data: ids,
  });
  if (res.data && res.data.code !== 200 && res.data.code !== 0) {
    throw new Error(res.data.msg || "批量删除点赞记录失败");
  }
}
