import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { ApiLogItem, ApiLogQuery } from "@/types/api-log";

/**
 * 分页获取 API 日志列表 (GET /admin/api-logs)
 *
 * @param query 筛选过滤查询参数
 * @returns 分页包装的日志列表
 */
export async function fetchApiLogs(
  query: ApiLogQuery
): Promise<PageResult<ApiLogItem>> {
  const res = await apiClient.get<ApiResponse<PageResult<ApiLogItem>>>("/admin/api-logs", {
    params: query,
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 清空全部 API 测速日志 (DELETE /admin/api-logs)
 */
export async function clearApiLogs(): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>("/admin/api-logs");
  if (!res.data || res.data.code !== 200) {
    throw new Error(res.data?.msg || "清空日志失败");
  }
}

/**
 * 获取服务器历史日志归档包列表 (GET /admin/api-logs/archives)
 */
export async function fetchLogArchives(): Promise<LogArchiveItem[]> {
  const res = await apiClient.get<ApiResponse<LogArchiveItem[]>>("/admin/api-logs/archives");
  return res.data?.data ?? [];
}

/**
 * 物理删除指定的日志归档包 (DELETE /admin/api-logs/archives)
 */
export async function deleteLogArchive(filename: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<void>>("/admin/api-logs/archives", {
    params: { filename },
  });
  if (!res.data || res.data.code !== 200) {
    throw new Error(res.data?.msg || "删除归档日志失败");
  }
}

/**
 * 流式下载归档日志包 (GET /admin/api-logs/archives/download)
 */
export async function downloadLogArchive(filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>("/admin/api-logs/archives/download", {
    params: { filename },
    responseType: "blob",
  });
  // 因为 Axios 对于 responseType 为 'blob' 的请求，返回的内容直接存放在 res.data 里
  return res.data;
}
