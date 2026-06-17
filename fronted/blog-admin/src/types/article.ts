import type { ArticleStatus, ArticleVisibility, ContentType } from "./common";

/**
 * 文章相关类型定义
 */

/** 文章列表项（表格/卡片展示用） */
export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl?: string;
  categoryName?: string;
  authorName: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  contentType: ContentType;
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 文章详情（编辑/阅读用） */
export interface ArticleDetail extends ArticleItem {
  content: string;
  contentHtml?: string;
  categoryId?: number;
  tagIds: number[];
  tagNames: string[];
  password?: string;
  isAllowComment: boolean;
  wordCount: number;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  template?: string;
  extra?: Record<string, unknown>;
  deletedAt?: string;
}

/** 创建/更新文章请求体 */
export interface ArticleSaveDTO {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  categoryId?: number;
  tagIds?: number[];
  status: ArticleStatus;
  visibility?: ArticleVisibility;
  password?: string;
  isPinned?: boolean;
  isFeatured?: boolean;
  isAllowComment?: boolean;
  contentType?: ContentType;
  template?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  extra?: Record<string, unknown>;
}

/** 文章查询参数 */
export interface ArticleQuery extends Record<string, unknown> {
  page: number;
  size: number;
  keyword?: string;
  status?: ArticleStatus;
  categoryId?: number;
  tagId?: number;
  contentType?: ContentType;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
