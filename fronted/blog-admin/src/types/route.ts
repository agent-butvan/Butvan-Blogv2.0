/**
 * 路由与跳转目标类型定义
 *
 * 用于热点属性面板中的跳转目标下拉框：
 * - 客户端页面路由（硬编码的 blog-client 页面列表）
 * - 文章列表（从后端 API 获取的简化版）
 * - 分类列表（从后端 API 获取的简化版）
 */

/** 客户端页面路由项 */
export interface ClientRoute {
  /** 路由路径，如 /about */
  path: string
  /** 人类可读的标签，如「关于」 */
  label: string
  /** 分组：页面 / 动态路由 */
  category: string
  /** 是否为动态路由（如 /articles/[slug]） */
  dynamic: boolean
}

/** 文章简化列表项（仅用于下拉框选择） */
export interface ArticleSimple {
  /** 文章 ID */
  id: number
  /** 文章标题 */
  title: string
  /** URL 友好的唯一标识 */
  slug: string
}

/** 分类简化列表项（仅用于下拉框选择） */
export interface CategorySimple {
  /** 分类 ID */
  id: number
  /** 分类名 */
  name: string
  /** URL 友好的唯一标识 */
  slug: string
}
