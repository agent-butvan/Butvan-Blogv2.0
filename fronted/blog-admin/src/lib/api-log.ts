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
