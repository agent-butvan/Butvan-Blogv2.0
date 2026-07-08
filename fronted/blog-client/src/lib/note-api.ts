import type { NoteItem, NoteDetail, NotePage } from '@/types/note'
import { get, post } from './http-client'

/**
 * 获取已发布的手记分页列表（前台公开接口）
 *
 * @param page  页码（从 1 开始）
 * @param size  每页数量
 * @param mood  可选的心情筛选
 * @returns 手记分页结果
 */
export async function fetchPublicNotes(
  page: number = 1,
  size: number = 10,
  mood?: string,
): Promise<NotePage> {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('size', String(size))
  if (mood) params.append('mood', mood)

  const data = await get<NotePage>(`/notes?${params.toString()}`)
  return data ?? { records: [], total: 0, page: 1, size: 10 }
}

/**
 * 根据 slug 获取手记详情（前台公开接口）
 *
 * @param slug 手记 URL 友好标识
 * @returns 手记完整详情（含正文 HTML）
 */
export async function fetchNoteBySlug(slug: string): Promise<NoteDetail> {
  return await get<NoteDetail>(`/notes/${slug}`)
}

/**
 * 对手记进行点赞/取消点赞（Toggle 机制）
 *
 * @param noteId 手记唯一 ID
 * @returns 后端返回的最新点赞总数
 */
export async function likeNote(noteId: number): Promise<number> {
  return await post<number>(`/notes/${noteId}/like`)
}
