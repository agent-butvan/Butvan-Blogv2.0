/**
 * 通用类型定义 — API 响应、分页、枚举等
 */

/** 后端统一响应体 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/** 分页请求参数 */
export interface PageQuery {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/** 分页响应体 */
export interface PageResult<T> {
  total: number;
  page: number;
  size: number;
  records: T[];
}

/** 文章/评论状态枚举 */
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
export type CommentStatus = "APPROVED" | "PENDING" | "SPAM" | "TRASH";

/** 文章可见性 */
export type ArticleVisibility = "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED";

/** 文章内容类型 */
export type ContentType = "ARTICLE" | "NOTE" | "GALLERY" | "PROJECT";

/** 热区跳转类型 */
export type RedirectType = "INTERNAL" | "EXTERNAL" | "ARTICLE" | "CATEGORY";

/** 导航链接类型 */
export type NavLinkType = "PAGE" | "CATEGORY" | "ARTICLE" | "EXTERNAL" | "NONE";

/** 导航菜单位置 */
export type NavPosition = "HEADER" | "FOOTER" | "SIDEBAR";
