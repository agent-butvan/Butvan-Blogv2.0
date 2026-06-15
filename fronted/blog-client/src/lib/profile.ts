import type { ProfileVO } from '@/types/profile'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

/**
 * 获取公开用户资料
 *
 * 调用后端免认证接口 GET /api/profile/public/{username}，
 * 用于博客首页展示个人头像、简介、社交链接等信息。
 *
 * @param username 登录用户名（默认 butvan）
 * @returns 公开资料对象，失败时返回 null
 */
export async function fetchProfile(username = 'butvan'): Promise<ProfileVO | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/public/${encodeURIComponent(username)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    // 后端统一返回 { code: number, msg: string, data: T }
    if (json.code === 200 || json.code === 0) {
      return json.data as ProfileVO
    }
    return null
  } catch {
    console.warn('获取用户公开资料失败，将使用默认信息')
    return null
  }
}

/**
 * 获取指定展示位置的动态导航列表
 *
 * @param position 导航展示位置，例如 'FOOTER' 或 'HEADER'
 * @returns 动态导航树形结构数组
 */
export async function fetchNavigations(position = 'FOOTER'): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/navigations?position=${position}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    if (json.code === 200 || json.code === 0) {
      return json.data || []
    }
    return []
  } catch {
    console.warn('获取页脚导航链接失败，将渲染空栏')
    return []
  }
}
