/**
 * 图片 URL 解析工具函数
 *
 * 统一管理所有图片 URL 的拼接逻辑，
 * 避免在多个组件中硬编码 `${baseURL}/uploads/...`。
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/**
 * 解析相对路径图片 URL 为完整可访问地址
 *
 * @param url 图片相对路径（如 /uploads/uuid.png）或完整 URL
 * @returns 可访问的完整图片 URL，url 为空时返回空字符串
 *
 * @example
 * resolveImageUrl('/uploads/abc.png')  // => 'http://localhost:8080/uploads/abc.png'
 * resolveImageUrl('https://cdn.example.com/img.png')  // => 'https://cdn.example.com/img.png'
 * resolveImageUrl(undefined)  // => ''
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return ''
  // 已经是绝对 URL（含协议头）则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // 相对路径拼接后端基础 URL
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return `${API_BASE}/${url}`
}
