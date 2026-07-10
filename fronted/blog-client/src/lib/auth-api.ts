/**
 * 认证相关 API 接口封装
 *
 * 统一封装邮箱登录、微信二维码登录、用户注册等接口调用，
 * 基于全局 http-client 实现类型安全、错误统一处理、Cookie 自动携带。
 *
 * 使用方式：
 * ```ts
 * import { loginByEmail, getWechatQRCode, registerUser } from '@/lib/auth-api'
 *
 * const { user } = await loginByEmail('admin', '123456')
 * const { qrUrl, wsId } = await getWechatQRCode()
 * await registerUser({ username: 'newuser', password: 'pass', nickname: '新用户' })
 * ```
 */

import { post } from './http-client'

// ---- 类型定义 -----------------------------------------------------------

/** 微信二维码登录响应数据 */
export interface WechatQRCodeData {
  /** 二维码图片 URL */
  qrUrl: string
  /** WebSocket 连接 ID */
  wsId: string
}

/** 邮箱登录响应数据（对应后端 LoginVO） */
export interface LoginData {
  /** 当前登录用户基本信息 */
  user: LoginUserInfo
}

/** 登录用户基本信息 */
export interface LoginUserInfo {
  /** 用户唯一 ID */
  id: number
  /** 用户名 */
  username: string
  /** 用户展示昵称 */
  nickname: string
  /** 用户绑定邮箱 */
  email: string | null
  /** 用户头像 URL */
  avatarUrl: string | null
  /** 绑定的 GitHub 用户名 */
  githubUsername: string | null
  /** 是否开启了双重验证 */
  twoFactorEnabled: boolean
  /** 用户身份角色：ADMIN | AUTHOR */
  role: string
}

/** 用户注册请求参数 */
export interface RegisterParams {
  /** 用户名（3-30 字符，字母数字下划线） */
  username: string
  /** 密码（至少 6 位） */
  password: string
  /** 用户展示昵称 */
  nickname: string
  /** 用户邮箱（可选） */
  email?: string
}

// ---- API 函数 -----------------------------------------------------------

/**
 * 获取微信扫码登录二维码
 *
 * 调用后端 POST /api/weixin/login，返回二维码图片 URL 和 WebSocket ID。
 * 前端需使用 wsId 建立 WebSocket 连接监听扫码事件。
 *
 * @returns 二维码数据（qrUrl + wsId）
 */
export async function getWechatQRCode(): Promise<WechatQRCodeData> {
  return post<WechatQRCodeData>('/weixin/login')
}

/**
 * 邮箱账号登录
 *
 * 调用后端 POST /api/auth/login，Token 通过 httpOnly Cookie 自动设置。
 *
 * @param username 用户名
 * @param password 密码
 * @returns 登录用户信息
 */
export async function loginByEmail(username: string, password: string): Promise<LoginData> {
  return post<LoginData>('/auth/login', { username, password })
}

/**
 * 用户注册
 *
 * 调用后端 POST /api/auth/register，注册成功后需跳转至登录面板。
 *
 * @param params 注册参数
 */
export async function registerUser(params: RegisterParams): Promise<void> {
  await post<void>('/auth/register', params as unknown as Record<string, unknown>)
}
