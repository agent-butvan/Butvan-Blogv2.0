import apiClient from './api'
import type { ApiResponse } from '@/types/common'
import type { ClientRoute, ArticleSimple, CategorySimple } from '@/types/route'

/**
 * 客户端路由 & 跳转目标数据获取层
 *
 * 为热点属性面板提供跳转目标下拉框的数据：
 * - 客户端路由（硬编码，与 blog-client 页面路由保持一致）
 * - 文章简化列表（从后端公开 API 获取）
 * - 分类简化列表（从后端公开 API 获取）
 */

// ==================== 客户端路由（硬编码） ====================

/** blog-client 的所有公开页面路由 */
const STATIC_CLIENT_ROUTES: ClientRoute[] = [
  { path: '/', label: '首页', category: '页面', dynamic: false },
  { path: '/about', label: '关于', category: '页面', dynamic: false },
  { path: '/guestbook', label: '留言板', category: '页面', dynamic: false },
  { path: '/articles', label: '文章列表', category: '页面', dynamic: false },
  { path: '/categories', label: '分类列表', category: '页面', dynamic: false },
  { path: '/articles/[slug]', label: '文章详情', category: '动态路由', dynamic: true },
  { path: '/categories/[slug]', label: '分类文章', category: '动态路由', dynamic: true },
]

/** 获取全部客户端可跳转路由（含页面 + 动态路由分组） */
export async function fetchClientRoutes(): Promise<ClientRoute[]> {
  return STATIC_CLIENT_ROUTES
}

// ==================== 文章简化列表 ====================

/** 获取已发布文章的简化列表（仅 id / title / slug，供下拉框选择） */
export async function fetchArticlesSimple(): Promise<ArticleSimple[]> {
  try {
    const res = await apiClient.get<ApiResponse<ArticleSimple[]>>('/articles/simple')
    return res.data?.data ?? []
  } catch {
    // 公开接口可能不可用，返回空数组不阻断 UI
    console.warn('获取文章简化列表失败，下拉框将为空')
    return []
  }
}

// ==================== 分类简化列表 ====================

/** 获取可见分类的简化列表（仅 id / name / slug，供下拉框选择） */
export async function fetchCategoriesSimple(): Promise<CategorySimple[]> {
  try {
    const res = await apiClient.get<ApiResponse<CategorySimple[]>>('/categories/simple')
    return res.data?.data ?? []
  } catch {
    // 公开接口可能不可用，返回空数组不阻断 UI
    console.warn('获取分类简化列表失败，下拉框将为空')
    return []
  }
}
