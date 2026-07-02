/**
 * 全局错误处理器 — 统一前端错误分类、日志与用户提示
 *
 * 设计理念（参照大厂规范）：
 * - 错误分 5 级：NETWORK（网络）、AUTH（认证）、FORBIDDEN（权限）、BUSINESS（业务）、SERVER（服务端）
 * - 每级错误对应统一的用户提示文案，避免到处硬编码 toast 消息
 * - 支持 SSR 安全：仅浏览器端调用 toast
 * - 上层可按需按错误类型做差异化降级处理
 */

// ---- 错误常量 ----------------------------------------------------------

/** HTTP 错误码 → 用户提示文案映射 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数有误，请检查填写内容',
  401: '登录已过期，请重新登录',
  403: '暂无权限执行该操作',
  404: '请求的资源不存在',
  405: '不支持的请求方法',
  408: '请求超时，请稍后重试',
  409: '数据冲突，请刷新后重试',
  422: '数据校验未通过，请检查输入',
  429: '操作过于频繁，请稍后再试',
  500: '服务器繁忙，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂不可用，请稍后重试',
  504: '网关超时，请稍后重试',
}

/** 网络错误 → 用户提示文案 */
const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  'Failed to fetch': '网络连接失败，请检查网络后重试',
  'NetworkError': '网络异常，请检查网络连接',
  'AbortError': '请求已取消',
  'TimeoutError': '请求超时，请稍后重试',
}

// ---- 错误类型枚举 --------------------------------------------------------

/** 错误类型（业务语义分类） */
export type ErrorType = 'NETWORK' | 'AUTH' | 'FORBIDDEN' | 'BUSINESS' | 'SERVER' | 'TIMEOUT'

// ---- 自定义错误类 --------------------------------------------------------

/**
 * 应用层统一错误对象
 *
 * 继承原生 Error，附加业务字段:
 * - code: 后端业务状态码（如 40001）
 * - status: HTTP 状态码
 * - type: 错误语义分类
 * - detail: 原始错误信息（保留用于调试）
 */
export class AppError extends Error {
  /** 业务状态码 */
  code: number
  /** HTTP 状态码 */
  status: number
  /** 错误语义分类 */
  type: ErrorType
  /** 原始错误详情（调试用，不展示给用户） */
  detail: string

  constructor(
    message: string,
    options: {
      code?: number
      status?: number
      type?: ErrorType
      detail?: string
    } = {},
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options.code ?? -1
    this.status = options.status ?? 0
    this.type = options.type ?? 'SERVER'
    this.detail = options.detail ?? message
  }
}

// ---- 错误分类 -----------------------------------------------------------

/**
 * 根据 HTTP 状态码和 Response 体，将原始错误分类为 AppError
 *
 * @param response Fetch Response 对象（可能为 null）
 * @param body     已解析的响应体 JSON（可能为 null）
 * @returns 分类后的 AppError
 */
export function classifyError(
  response: Response | null,
  body: { code?: number; msg?: string; message?: string } | null,
): AppError {
  const status = response?.status ?? 0

  // 1. 认证类错误 — 401
  if (status === 401) {
    return new AppError(
      body?.msg || body?.message || HTTP_ERROR_MESSAGES[401],
      {
        code: body?.code ?? 401,
        status: 401,
        type: 'AUTH',
        detail: body?.msg || `HTTP 401`,
      },
    )
  }

  // 2. 权限类错误 — 403
  if (status === 403) {
    return new AppError(
      body?.msg || body?.message || HTTP_ERROR_MESSAGES[403],
      {
        code: body?.code ?? 403,
        status: 403,
        type: 'FORBIDDEN',
        detail: body?.msg || `HTTP 403`,
      },
    )
  }

  // 3. 服务端错误 — 5xx
  if (status >= 500) {
    return new AppError(
      body?.msg || body?.message || HTTP_ERROR_MESSAGES[status] || '服务器内部错误',
      {
        code: body?.code ?? status,
        status,
        type: 'SERVER',
        detail: body?.msg || `HTTP ${status}`,
      },
    )
  }

  // 4. 客户端 HTTP 错误 — 4xx（非 401/403）
  if (status >= 400) {
    return new AppError(
      body?.msg || body?.message || HTTP_ERROR_MESSAGES[status] || `请求失败 (${status})`,
      {
        code: body?.code ?? status,
        status,
        type: 'BUSINESS',
        detail: body?.msg || `HTTP ${status}`,
      },
    )
  }

  // 5. 响应 OK 但业务 code ≠ 200
  if (body && typeof body.code === 'number' && body.code !== 200 && body.code !== 0) {
    return new AppError(
      body.msg || body.message || '业务处理失败',
      {
        code: body.code,
        status,
        type: 'BUSINESS',
        detail: body.msg || `业务码 ${body.code}`,
      },
    )
  }

  // 6. 兜底：未知错误
  return new AppError('未知错误，请稍后重试', { type: 'SERVER' })
}

/**
 * 将网络异常（fetch 抛出的原生错误）分类为 AppError
 *
 * @param error 原始 JavaScript 错误对象
 * @returns 分类后的 AppError
 */
export function classifyNetworkError(error: Error): AppError {
  const name = error.name

  // 超时
  if (name === 'AbortError' || name === 'TimeoutError') {
    return new AppError(
      NETWORK_ERROR_MESSAGES[name] || '请求超时',
      { type: 'TIMEOUT', detail: error.message },
    )
  }

  // 网络不通
  const msg = error.message || ''
  for (const [key, userMsg] of Object.entries(NETWORK_ERROR_MESSAGES)) {
    if (msg.includes(key)) {
      return new AppError(userMsg, { type: 'NETWORK', detail: msg })
    }
  }

  return new AppError('网络异常，请稍后重试', { type: 'NETWORK', detail: msg })
}

// ---- 全局错误处理入口 ----------------------------------------------------

/**
 * 统一错误处理入口 — 日志 + 用户提示
 *
 * 使用方式：
 * ```ts
 * try { await request('/api/xxx') }
 * catch (err) { handleError(err) }
 * ```
 *
 * 上层如需自定义降级逻辑，可先判断 err.type 再做差异化处理：
 * ```ts
 * catch (err) {
 *   handleError(err)               // 统一 toast + log
 *   if (err instanceof AppError && err.type === 'AUTH') {
 *     router.push('/login')        // 额外：跳转登录
 *   }
 * }
 * ```
 *
 * @param error   捕获到的错误对象
 * @param options 自定义配置
 */
export function handleError(
  error: unknown,
  options: {
    /** 是否静默（仅 log，不 toast），默认 false */
    silent?: boolean
    /** 兜底提示文案 */
    fallbackMessage?: string
  } = {},
): AppError {
  // 确保错误是 AppError 实例
  let appError: AppError
  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    appError = classifyNetworkError(error)
  } else if (typeof error === 'string') {
    appError = new AppError(error, { type: 'BUSINESS', detail: error })
  } else {
    appError = new AppError('发生未知错误', { type: 'SERVER' })
  }

  // 使用兜底文案
  if (options.fallbackMessage && !appError.message) {
    appError.message = options.fallbackMessage
  }

  // 日志（开发环境输出详细堆栈）
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[AppError] type=${appError.type} status=${appError.status} code=${appError.code}`,
      '\n  message:', appError.message,
      '\n  detail:', appError.detail,
    )
  } else {
    console.error(`[AppError] ${appError.type}:`, appError.message)
  }

  // 用户提示（仅浏览器端）
  if (!options.silent && typeof window !== 'undefined') {
    showErrorToast(appError)
  }

  return appError
}

/**
 * 根据错误类型显示对应的 Toast 提示
 *
 * 不同类型使用不同的 toast 变体：
 * - AUTH / FORBIDDEN → danger（红色，严重）
 * - NETWORK / TIMEOUT → warning（橙色，网络问题）
 * - BUSINESS → danger（红色，业务错误）
 * - SERVER → danger（红色，服务端错误）
 */
function showErrorToast(error: AppError): void {
  // 动态导入 toast 以避免 SSR 时出错（toast 依赖浏览器 API）
  import('@heroui/react').then(({ toast }) => {
    const message = error.message || '操作失败，请稍后重试'

    switch (error.type) {
      case 'AUTH':
      case 'FORBIDDEN':
        toast.danger(message)
        break
      case 'NETWORK':
      case 'TIMEOUT':
        // HeroUI v3 没有 toast.warning，使用 danger + 网络图标语义
        toast.danger(message)
        break
      case 'BUSINESS':
      case 'SERVER':
      default:
        toast.danger(message)
        break
    }
  }).catch(() => {
    // toast 不可用时静默降级（SSR 环境或旧浏览器）
    console.warn('[ErrorHandler] toast 不可用，跳过用户提示')
  })
}
