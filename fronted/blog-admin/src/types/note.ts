/**
 * 手记相关类型定义（管理端）
 */

/** 手记状态 */
export type NoteStatus = "DRAFT" | "PUBLISHED";

/** 手记列表项 */
export interface NoteItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl?: string;
  mood?: string;
  weather?: string;
  location?: string;
  authorName: string;
  status: NoteStatus;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 手记详情 */
export interface NoteDetail extends NoteItem {
  content: string;
  contentHtml?: string;
  wordCount: number;
  readingTime: number;
}

/** 创建/更新手记请求体 */
export interface NoteSaveDTO {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  /** 多图封面 URL 数组 */
  coverImageUrls?: string[];
  mood?: string;
  weather?: string;
  location?: string;
  status: NoteStatus;
  isPinned?: boolean;
}

/** 手记查询参数 */
export interface NoteQuery {
  page: number;
  size: number;
  keyword?: string;
  status?: NoteStatus;
  mood?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
