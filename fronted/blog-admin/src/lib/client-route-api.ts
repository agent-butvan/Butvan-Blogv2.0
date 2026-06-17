import { fetchArticlesSimple as getArticlesSimple, fetchCategoriesSimple as getCategoriesSimple } from './article-api'
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
  { path: '/', label: '用户端首页', category: '页面', dynamic: false },
  { path: '/about', label: '关于', category: '页面', dynamic: false },
  { path: '/guestbook', label: '留言板', category: '页面', dynamic: false },
  { path: '/article', label: '文章列表', category: '页面', dynamic: false },
  { path: '/categories', label: '分类列表', category: '页面', dynamic: false },
  { path: '/article/[slug]', label: '文章详情', category: '动态路由', dynamic: true },
  { path: '/categories/[slug]', label: '分类文章', category: '动态路由', dynamic: true },
]

/** 获取全部客户端可跳转路由（含页面 + 动态路由分组） */
export async function fetchClientRoutes(): Promise<ClientRoute[]> {
  return STATIC_CLIENT_ROUTES
}

// ==================== 文章简化列表 ====================

/** 获取已发布文章的简化列表（仅 id / title / slug，供下拉框选择） */
export async function fetchArticlesSimple(): Promise<ArticleSimple[]> {
  return getArticlesSimple();
}

// ==================== 分类简化列表 ====================

/** 获取可见分类的简化列表（仅 id / name / slug，供下拉框选择） */
export async function fetchCategoriesSimple(): Promise<CategorySimple[]> {
  return getCategoriesSimple();
}
