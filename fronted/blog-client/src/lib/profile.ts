import type { ProfileVO } from '@/types/profile'
import { get } from './http-client'

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
    const data = await get<ProfileVO>(`/profile/public/${encodeURIComponent(username)}`)
    return data
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
    const data = await get<any[]>(`/navigations?position=${position}`)
    return data || []
  } catch {
    console.warn('获取页脚导航链接失败，将渲染空栏')
    return []
  }
}
