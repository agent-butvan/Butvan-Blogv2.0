import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { NoteItem, NoteDetail, NoteSaveDTO, NoteQuery } from "@/types/note";

/**
 * 获取手记分页列表 (GET /admin/notes)
 *
 * @param query 筛选过滤查询参数
 * @returns 分页包装的手记简述列表
 */
export async function fetchNotes(
  query: NoteQuery
): Promise<PageResult<NoteItem>> {
  const res = await apiClient.get<ApiResponse<PageResult<NoteItem>>>("/admin/notes", {
    params: query,
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 根据手记 ID 或 slug 获取手记详情 (GET /admin/notes/{idOrSlug})
 *
 * @param idOrSlug 手记唯一主键 ID 或 slug
 * @returns 手记完整详情数据
 */
export async function fetchNoteDetail(idOrSlug: number | string): Promise<NoteDetail> {
  const res = await apiClient.get<ApiResponse<NoteDetail>>(`/admin/notes/${idOrSlug}`);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "获取手记详情失败");
  }
  return res.data.data;
}

/**
 * 新增手记 (POST /admin/notes)
 *
 * @param dto 创建手记提交的内容载荷
 * @returns 持久化后的手记详情
 */
export async function createNote(dto: NoteSaveDTO): Promise<NoteDetail> {
  const res = await apiClient.post<ApiResponse<NoteDetail>>("/admin/notes", dto);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "新建手记失败");
  }
  return res.data.data;
}

/**
 * 编辑更新手记 (PUT /admin/notes/{id})
 *
 * @param id  手记唯一主键 ID
 * @param dto 更新手记提交的内容载荷
 * @returns 更新持久化后的手记详情
 */
export async function updateNote(
  id: number | string,
  dto: NoteSaveDTO
): Promise<NoteDetail> {
  const res = await apiClient.put<ApiResponse<NoteDetail>>(`/admin/notes/${id}`, dto);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "更新手记失败");
  }
  return res.data.data;
}

/**
 * 根据 ID 逻辑删除手记 (DELETE /admin/notes/{id})
 *
 * @param id 待删除手记主键 ID
 */
export async function deleteNote(id: number | string): Promise<void> {
  await apiClient.delete(`/admin/notes/${id}`);
}
