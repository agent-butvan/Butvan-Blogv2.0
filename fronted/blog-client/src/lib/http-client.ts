/**
 * 全局 HTTP 客户端 — 基于 fetch 的统一请求封装
 *
 * 设计理念（参照大厂规范）：
 * - 零依赖：仅使用浏览器原生 fetch，避免引入 axios 等额外依赖
 * - 类型安全：所有响应泛型化，调用方无需手动 as 断言
 * - 统一错误：所有错误（HTTP / 业务码 / 网络）统一转为 AppError，便于上层集中处理
 * - 超时控制：内置 AbortController 超时机制，默认 15 秒
 * - SSR 兼容：函数本身纯逻辑，不依赖浏览器 API
 * - Cookie 自动携带：所有请求自动添加 credentials: 'include'，支持 httpOnly Cookie 鉴权
 * - 401 自动续期：Access Token 过期时自动调用 /auth/refresh 换取新 Token 并重试原始请求
 *
 * 使用方式：
 * ```ts
 * import { request, get, post, upload } from '@/lib/http-client'
 *
 * const data = await get<FriendLink[]>('/friends')
 * const result = await post<void>('/friends/apply', formData)
 * const path = await upload('/public/upload/image', file)
 * ```
 */

import { AppError, classifyError, classifyNetworkError } from './error-handler'

// ---- 配置常量 -----------------------------------------------------------

/** 后端 API 基地址
 * 使用相对路径，兼容所有部署环境：
 * - 开发环境：通过 Next.js rewrites 代理到 localhost:8080
 * - 生产环境：通过 Nginx 反向代理到后端服务
 * 如需直连后端（如局域网调试），设置环境变量 NEXT_PUBLIC_API_BASE_URL */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

/** 默认请求超时（毫秒） */
const DEFAULT_TIMEOUT = 15000

/** 上传请求超时（毫秒，允许更长的上传时间） */
const UPLOAD_TIMEOUT = 60000

// ---- Cookie 模式下的 401 自动续期机制 ------------------------------------

/** 是否正在刷新 Token */
let isRefreshing = false
/** 等待刷新完成的请求队列 */
let refreshSubscribers: Array<(success: boolean) => void> = []

/**
 * 通知所有等待刷新完成的请求
 */
function notifySubscribers(success: boolean) {
  refreshSubscribers.forEach(cb => cb(success))
  refreshSubscribers = []
}

/**
 * 处理 401 未授权：尝试静默刷新 Access Token，成功后重试原始请求
 * <p>多个并发请求同时收到 401 时，只有第一个触发 refresh，其余排队等待</p>
 *
 * @param retryFn 重试原始请求的函数
 * @returns 重试后的响应，或刷新失败时的 401 响应
 */
async function handle401WithRefresh(retryFn: () => Promise<Response>): Promise<Response> {
  if (isRefreshing) {
    // 已有 refresh 在进行中，排队等待
    return new Promise<Response>((resolve) => {
      refreshSubscribers.push((success) => {
        if (success) resolve(retryFn())
        else resolve(new Response(JSON.stringify({ code: 401, msg: '登录已过期' }), { status: 401 }))
      })
    })
  }

  isRefreshing = true
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    const success = refreshRes.ok && (refreshRes.status === 200 || refreshRes.status === 204)
    notifySubscribers(success)

    if (success) {
      // refresh 成功，重试原始请求
      return retryFn()
    }

    // refresh 也失败 → 清除登录态
    clearAuthState()
    return refreshRes
  } catch {
    notifySubscribers(false)
    clearAuthState()
    return new Response(JSON.stringify({ code: 401, msg: '登录已过期' }), { status: 401 })
  } finally {
    isRefreshing = false
  }
}

/**
 * 清除本地登录态（localStorage + 广播事件）
 * AuthProvider 会监听 auth-change 事件自动更新全局状态
 */
function clearAuthState() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user_info')
  window.dispatchEvent(new Event('auth-change'))
}

// ---- 请求选项类型 --------------------------------------------------------

/** 扩展请求选项 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** 请求超时时间（毫秒），默认 15000 */
  timeout?: number
  /** 请求体（自动序列化为 JSON），与 FormData 互斥 */
  body?: BodyInit | Record<string, unknown> | null
  /** 是否跳过业务状态码校验（仅检查 HTTP status），默认 false */
  skipBusinessCheck?: boolean
  /** 自定义基础 URL（覆盖全局 API_BASE） */
  baseUrl?: string
}

// ---- 后端统一响应体类型 --------------------------------------------------

/** 后端统一响应包装结构 */
interface ApiResponse<T = unknown> {
  code: number
  msg: string
  message?: string
  data: T
}

// ---- 核心请求函数 --------------------------------------------------------

/**
 * 统一请求函数 — 所有 API 调用的底层入口
 *
 * 自动处理：
 * 1. URL 拼接（baseUrl + endpoint）
 * 2. JSON Content-Type 请求头
 * 3. 请求体序列化（普通对象 → JSON 字符串）
 * 4. 超时控制（AbortController）
 * 5. HTTP 状态码校验
 * 6. 业务状态码校验（code === 200）
 * 7. 错误分类与抛出（统一转为 AppError）
 *
 * @template T 响应数据 data 字段的类型
 * @param endpoint API 路径（如 "/friends"）
 * @param options  扩展请求选项
 * @returns 响应体中的 data 字段
 * @throws AppError 所有错误统一抛出 AppError
 */
export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    skipBusinessCheck = false,
    body,
    headers: customHeaders,
    baseUrl: customBaseUrl,
    ...restOptions
  } = options

  // 构建完整 URL
  const base = customBaseUrl ?? API_BASE
  const url = `${base}${endpoint}`

  // 构建请求头
  const headers: Record<string, string> = { ...(customHeaders as Record<string, string>) }

  // Cookie 模式下无需手动注入 Authorization，浏览器自动携带 httpOnly Cookie

  // 处理请求体
  let requestBody: BodyInit | undefined
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer || typeof body === 'string') {
      // FormData / Blob / ArrayBuffer / 字符串 → 直接传递（不设 Content-Type，让浏览器自动带 boundary）
      requestBody = body
    } else if (typeof body === 'object') {
      // 普通对象 → JSON 序列化
      headers['Content-Type'] = 'application/json;charset=UTF-8'
      requestBody = JSON.stringify(body)
    } else {
      requestBody = body as BodyInit
    }
  } else if (!headers['Content-Type'] && restOptions.method?.toUpperCase() !== 'GET') {
    // POST/PUT 等但没有显式 Content-Type 且无 body → 默认 JSON
    headers['Content-Type'] = 'application/json;charset=UTF-8'
  }

  // 超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // 构建 fetch 参数（所有请求自动携带 credentials，让浏览器携带 httpOnly Cookie）
  const fetchInit: RequestInit = {
    ...restOptions,
    headers,
    body: requestBody,
    signal: controller.signal,
    credentials: 'include',
  }

  try {
    const response = await fetch(url, fetchInit)

    // 尝试解析 JSON 响应体
    let bodyData: ApiResponse<T> | null = null
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        bodyData = await response.json()
      } catch {
        // JSON 解析失败 → 非 JSON 响应
      }
    }

    // 校验 HTTP 状态码
    if (!response.ok) {
      // 401 未授权：尝试静默刷新 Token 后重试
      if (response.status === 401) {
        clearTimeout(timeoutId)
        const retryResponse = await handle401WithRefresh(() => {
          // 重建 AbortController 用于重试
          const retryController = new AbortController()
          setTimeout(() => retryController.abort(), timeout)
          return fetch(url, { ...fetchInit, signal: retryController.signal })
        })

        // 重试成功，解析并返回响应
        if (retryResponse.ok) {
          let retryBodyData: ApiResponse<T> | null = null
          const retryContentType = retryResponse.headers.get('content-type') || ''
          if (retryContentType.includes('application/json')) {
            try { retryBodyData = await retryResponse.json() } catch { /* 非 JSON */ }
          }
          if (skipBusinessCheck) {
            return (retryBodyData?.data ?? retryBodyData ?? null) as unknown as T
          }
          if (retryBodyData && typeof retryBodyData.code === 'number') {
            if (retryBodyData.code !== 200 && retryBodyData.code !== 0) {
              throw classifyError(retryResponse, retryBodyData)
            }
            return retryBodyData.data as T
          }
          return retryBodyData as unknown as T
        }

        // 重试也失败（refresh 已清除登录态）
        let retryErrorBody: ApiResponse<T> | null = null
        const retryErrContentType = retryResponse.headers.get('content-type') || ''
        if (retryErrContentType.includes('application/json')) {
          try { retryErrorBody = await retryResponse.json() } catch { /* 非 JSON */ }
        }
        throw classifyError(retryResponse, retryErrorBody)
      }
      throw classifyError(response, bodyData)
    }

    // 跳过业务码校验时直接返回响应体
    if (skipBusinessCheck) {
      return (bodyData?.data ?? bodyData ?? null) as unknown as T
    }

    // 校验后端统一响应体中的业务状态码
    if (bodyData && typeof bodyData.code === 'number') {
      if (bodyData.code !== 200 && bodyData.code !== 0) {
        throw classifyError(response, bodyData)
      }
      // 业务码正常，返回 data 字段
      return bodyData.data as T
    }

    // 非标准响应（无 code 字段），直接返回整个响应体
    return bodyData as unknown as T
  } catch (error) {
    clearTimeout(timeoutId)

    // 已经是 AppError 则直接抛出
    if (error instanceof AppError) {
      throw error
    }

    // 原生网络错误 → 分类后抛出
    if (error instanceof Error) {
      // AbortError → 超时
      if (error.name === 'AbortError') {
        throw new AppError('请求超时，请稍后重试', {
          type: 'TIMEOUT',
          detail: `请求 ${endpoint} 超过 ${timeout}ms`,
        })
      }
      throw classifyNetworkError(error)
    }

    // 兜底
    throw new AppError('请求异常，请稍后重试', {
      type: 'SERVER',
      detail: String(error),
    })
  }
}

// ---- 便捷方法 ------------------------------------------------------------

/**
 * GET 请求
 *
 * @param endpoint API 路径
 * @param options  扩展选项（自动设置 method: GET）
 * @returns 响应 data 字段
 */
export function get<T = unknown>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method'>,
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

/**
 * POST 请求（JSON body）
 *
 * @param endpoint API 路径
 * @param body     请求体（自动 JSON 序列化）
 * @param options  扩展选项（自动设置 method: POST）
 * @returns 响应 data 字段
 */
export function post<T = unknown>(
  endpoint: string,
  body?: Record<string, unknown> | null,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'POST', body })
}

/**
 * 文件上传请求（FormData body）
 *
 * @param endpoint API 路径
 * @param formData FormData 对象
 * @param options  扩展选项（自动设置 method: POST，timeout 延长至 60 秒）
 * @returns 响应 data 字段
 */
export function upload<T = string>(
  endpoint: string,
  formData: FormData,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
    timeout: options?.timeout ?? UPLOAD_TIMEOUT,
  })
}

export default request
