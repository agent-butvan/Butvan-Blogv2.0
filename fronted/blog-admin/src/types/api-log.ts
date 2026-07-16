/**
 * API 日志数据项
 */
export interface ApiLogItem {
  id: number;
  apiName: string;
  method: string;
  uri: string;
  ip: string;
  costTime: number;
  createdAt: string;
}

/**
 * API 日志查询参数
 */
export interface ApiLogQuery {
  page?: number;
  size?: number;
  keyword?: string;
}
