/**
 * 公开用户资料类型定义
 *
 * 用于博客前台首页展示个人信息（头像、简介、社交链接等）
 */

/** 社交链接键值对（如 { "github": "https://...", "twitter": "https://..." }） */
export type SocialLinks = Record<string, string>

/** 公开用户资料 */
export interface ProfileVO {
  /** 用户展示昵称 */
  nickname: string
  /** 用户头像图片的完整 URL */
  avatarUrl?: string
  /** 用户个性化简介/电子签名 */
  bio: string
  /** 社交网络链接 */
  socialLinks: SocialLinks
}
