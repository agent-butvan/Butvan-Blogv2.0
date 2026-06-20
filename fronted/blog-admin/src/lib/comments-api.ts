import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { CommentItem, CommentQuery } from "@/types/comment";

/**
 * 后台分页获取评论列表 (GET /admin/comments)
 *
 * @param query 筛选过滤查询参数
 * @returns 分页包装的评论 VO 列表
 */
export async function fetchAdminComments(
  query: CommentQuery
): Promise<PageResult<CommentItem>> {
  const res = await apiClient.get<ApiResponse<PageResult<CommentItem>>>("/admin/comments", {
    params: query,
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 后台更新评论状态 (PUT /admin/comments/{id}/status)
 *
 * @param id 评论唯一主键 ID
 * @param status 新的发布/审核状态 ("APPROVED" | "PENDING" | "SPAM" | "TRASH")
 */
export async function updateCommentStatus(
  id: number | string,
  status: string
): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/admin/comments/${id}/status`, {
    status,
  });
  if (res.data && res.data.code !== 200) {
    throw new Error(res.data.msg || "修改评论状态失败");
  }
}

/**
 * 后台管理员快捷回复评论 (POST /admin/comments/{id}/reply)
 *
 * @param id 被回复评论的 ID
 * @param content 回复的文本正文内容
 * @returns 产生保存后的评论回复子对象
 */
export async function replyComment(
  id: number | string,
  content: string
): Promise<CommentItem> {
  const res = await apiClient.post<ApiResponse<CommentItem>>(`/admin/comments/${id}/reply`, {
    content,
  });
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "快捷回复评论失败");
  }
  return res.data.data;
}

/**
 * 后台将某条评论标记为博主本人所写 (PUT /admin/comments/{id}/author)
 *
 * @param id 评论的主键 ID
 */
export async function markCommentAsAuthor(id: number | string): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/admin/comments/${id}/author`);
  if (res.data && res.data.code !== 200) {
    throw new Error(res.data.msg || "标记为作者失败");
  }
}

/**
 * 后台物理彻底删除评论记录 (DELETE /admin/comments/{id})
 *
 * @param id 待删除评论的主键 ID
 */
export async function deleteComment(id: number | string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/admin/comments/${id}`);
  if (res.data && res.data.code !== 200) {
    throw new Error(res.data.msg || "删除评论失败");
  }
}
