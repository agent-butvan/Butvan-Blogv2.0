/**
 * 手记相关类型定义（前台公开接口）
 */

/** 手记列表项（前台公开接口返回） */
export interface NoteItem {
  id: number
  title: string
  slug: string
  summary?: string
  coverImageUrl?: string
  mood?: string
  weather?: string
  location?: string
  authorName: string
  isPinned: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  createdAt: string
}

/** 手记详情（前台公开接口返回，含正文） */
export interface NoteDetail extends NoteItem {
  content: string
  contentHtml?: string
  wordCount: number
  readingTime: number
}

/** 手记分页结果 */
export interface NotePage {
  records: NoteItem[]
  total: number
  page: number
  size: number
}
