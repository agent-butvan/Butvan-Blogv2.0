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
    console.warn(`获取${position}导航链接失败，将渲染空栏`)
    return []
  }
}

/**
 * 获取站点公开配置项的值
 *
 * 调用后端免认证接口 GET /api/site-config/public/{key}，
 * 用于查询站点级全局配置（如背景图片URL等）。
 *
 * @param configKey 配置键，如 'background_image_url'
 * @returns 配置值字符串，不存在或失败时返回空字符串
 */
export async function fetchSiteConfig(configKey: string): Promise<string> {
  try {
    const data = await get<{ configKey: string; configValue: string }>(
      `/site-config/public/${encodeURIComponent(configKey)}`
    )
    return data?.configValue || ''
  } catch (err) {
    console.warn(`[站点配置] 获取 ${configKey} 失败:`, err instanceof Error ? err.message : err)
    return ''
  }
}
