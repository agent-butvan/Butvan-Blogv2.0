'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** WebSocket 连接状态 */
export type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'closed'

/** 后端推送的 WebSocket 消息结构（对应 WebSocketMessageBase） */
export interface WsMessage {
  /** 状态码：200=成功，500=异常 */
  code: number
  /** 事件标识，如 "weixin"、"login" */
  event: string
  /** 消息描述 */
  message: string
  /** 扩展数据（如 token exchange code 等，后端可选下发） */
  data?: Record<string, unknown>
}

/** useWebSocket 返回值 */
interface UseWebSocketReturn {
  /** 当前连接状态 */
  status: WsStatus
  /** 最近一条服务端推送消息 */
  lastMessage: WsMessage | null
  /** 建立连接（传入后端返回的 wsId） */
  connect: (wsId: string) => void
  /** 主动断开连接 */
  disconnect: () => void
}

/**
 * 构建 WebSocket 连接地址
 *
 * 开发环境直连后端（Next.js rewrite 不支持 WS 代理），
 * 生产环境同源（由 Nginx 等反向代理统一转发）。
 */
function buildWsUrl(wsId: string): string {
  // 1. 优先使用显式配置的 WebSocket 基地址 (如 ws://localhost:8080/ws 或 wss://domain.com/ws)
  const wsBase = process.env.NEXT_PUBLIC_WS_BASE_URL
  if (wsBase) {
    const formattedBase = wsBase.endsWith('/') ? wsBase : `${wsBase}/`
    return `${formattedBase}${wsId}`
  }

  // 开发环境：直连后端 Spring Boot
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
  const protocol = backendUrl.startsWith('https') ? 'wss' : 'ws'

  // 如果配置了 NEXT_PUBLIC_API_BASE_URL 且非相对路径，从中提取 host
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
  if (apiBase && apiBase.startsWith('http')) {
    const host = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '')
    const wsProto = host.startsWith('https') ? 'wss' : 'ws'
    return `${wsProto}://${new URL(host).host}/ws/${wsId}`
  }

  // 开发环境默认：直连 localhost:8080
  try {
    const url = new URL(backendUrl)
    return `${protocol}://${url.host}/ws/${wsId}`
  } catch {
    // 兜底：同源
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    return `${wsProto}://${window.location.host}/ws/${wsId}`
  }
}

/**
 * WebSocket 连接管理 Hook
 *
 * 封装原生 WebSocket 的连接建立、消息监听、自动清理等生命周期，
 * 专用于微信扫码登录等需要服务端实时推送的场景。
 *
 * @example
 * const { status, lastMessage, connect, disconnect } = useWebSocket()
 *
 * // 获取二维码后建立连接
 * connect(wsId)
 *
 * // 监听消息
 * useEffect(() => {
 *   if (lastMessage?.event === 'weixin') {
 *     // 处理扫码事件
 *   }
 * }, [lastMessage])
 *
 * // 组件卸载时自动断开
 */
export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus] = useState<WsStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  /** 主动断开连接 */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // 先标记为 closed 再关闭，避免 onClose 重复触发状态变更
      setStatus('closed')
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  /** 建立 WebSocket 连接 */
  const connect = useCallback((wsId: string) => {
    // 先断开已有连接
    disconnect()

    const url = buildWsUrl(wsId)
    setStatus('connecting')

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WsMessage
        setLastMessage(data)
      } catch {
        console.warn('[WS] 消息解析失败:', event.data)
      }
    }

    ws.onerror = () => {
      console.error('[WS] 连接异常')
      setStatus('closed')
    }

    ws.onclose = () => {
      setStatus((prev) => (prev === 'closed' ? prev : 'disconnected'))
      wsRef.current = null
    }
  }, [disconnect])

  /** 组件卸载时自动清理 */
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { status, lastMessage, connect, disconnect }
}
