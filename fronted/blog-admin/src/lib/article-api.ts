import apiClient from "./api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { ArticleItem, ArticleDetail, ArticleSaveDTO, ArticleQuery } from "@/types/article";

/**
 * 获取文章分页列表 (GET /articles)
 *
 * @param query 筛选过滤查询参数
 * @returns 分页包装的文章简述列表
 */
export async function fetchArticles(
  query: ArticleQuery
): Promise<PageResult<ArticleItem>> {
  const res = await apiClient.get<ApiResponse<PageResult<ArticleItem>>>("/articles", {
    params: query,
  });
  return res.data?.data ?? { total: 0, page: 1, size: 10, records: [] };
}

/**
 * 根据文章 ID 获取文章详情 (GET /articles/{id})
 *
 * @param id 文章唯一主键 ID
 * @returns 文章完整详情数据
 */
export async function fetchArticleDetail(id: number | string): Promise<ArticleDetail> {
  const res = await apiClient.get<ApiResponse<ArticleDetail>>(`/articles/${id}`);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "获取文章详情失败");
  }
  return res.data.data;
}

/**
 * 新增文章 (POST /articles)
 *
 * @param dto 创建文章提交的内容载荷
 * @returns 持久化后的文章详情
 */
export async function createArticle(dto: ArticleSaveDTO): Promise<ArticleDetail> {
  const res = await apiClient.post<ApiResponse<ArticleDetail>>("/articles", dto);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "新建文章失败");
  }
  return res.data.data;
}

/**
 * 编辑更新文章 (PUT /articles/{id})
 *
 * @param id  文章唯一主键 ID
 * @param dto 更新文章提交的内容载荷
 * @returns 更新持久化后的文章详情
 */
export async function updateArticle(
  id: number | string,
  dto: ArticleSaveDTO
): Promise<ArticleDetail> {
  const res = await apiClient.put<ApiResponse<ArticleDetail>>(`/articles/${id}`, dto);
  if (!res.data?.data) {
    throw new Error(res.data?.msg || "更新文章失败");
  }
  return res.data.data;
}

/**
 * 根据 ID 逻辑删除文章 (DELETE /articles/{id})
 *
 * @param id 待删除文章主键 ID
 */
export async function deleteArticle(id: number | string): Promise<void> {
  await apiClient.delete(`/articles/${id}`);
}

/**
 * 获取可见分类的简化列表 (GET /categories/simple)
 * 用于文章表单分类下拉或路由跳转下拉
 *
 * @returns 简化分类列表
 */
export async function fetchCategoriesSimple(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/categories/simple");
  return res.data?.data ?? [];
}

/**
 * 获取标签列表 (GET /tags)
 *
 * @returns 标签列表
 */
export async function fetchTags(): Promise<any> {
  const res = await apiClient.get<ApiResponse<any>>("/tags");
  return res.data?.data;
}

/**
 * 获取极简标签列表 (GET /tags/simple)
 *
 * @returns 极简标签列表
 */
export async function fetchTagsSimple(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/tags/simple");
  return res.data?.data ?? [];
}

/**
 * 获取已发布文章的极简列表 (GET /articles/simple)
 * 用于路由跳转下拉
 *
 * @returns 简化文章列表
 */
export async function fetchArticlesSimple(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/articles/simple");
  return res.data?.data ?? [];
}

