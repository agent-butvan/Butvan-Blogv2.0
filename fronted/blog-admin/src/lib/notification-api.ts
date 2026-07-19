import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { Notification } from "@/types/notification";

/**
 * 分页查询系统通知列表 (GET /admin/notifications/page)
 */
export async function fetchNotifications(
  page: number = 1,
  size: number = 10
): Promise<PageResult<Notification>> {
  const res = await apiClient.get<ApiResponse<PageResult<Notification>>>("/admin/notifications/page", {
    params: { page, size },
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 获取系统未读通知总数 (GET /admin/notifications/unread-count)
 */
export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<ApiResponse<number>>("/admin/notifications/unread-count");
  return res.data?.data ?? 0;
}

/**
 * 将通知标记为已读 (PUT /admin/notifications/{id}/read)
 */
export async function markAsRead(id: number): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>(`/admin/notifications/${id}/read`);
  if (res.data?.code !== 200) {
    throw new Error(res.data?.msg || "标记通知已读失败");
  }
}

/**
 * 一键将所有未读通知标记为已读 (PUT /admin/notifications/read-all)
 */
export async function markAllAsRead(): Promise<void> {
  const res = await apiClient.put<ApiResponse<void>>("/admin/notifications/read-all");
  if (res.data?.code !== 200) {
    throw new Error(res.data?.msg || "一键标记已读失败");
  }
}

/**
 * 根据 ID 删除通知 (DELETE /admin/notifications/{id})
 */
export async function deleteNotification(id: number): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>(`/admin/notifications/${id}`);
  if (res.data?.code !== 200) {
    throw new Error(res.data?.msg || "删除通知失败");
  }
}
