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
  /** 向服务端发送文本消息（如发送 "close" 指令请求关闭会话） */
  send: (message: string) => void
}

function buildWsUrl(wsId: string): string {
  // 1. 优先读取显式环境变量 (process.env.NEXT_PUBLIC_WS_URL)
  const envWsUrl = process.env.NEXT_PUBLIC_WS_URL
  if (envWsUrl && envWsUrl.trim() !== '') {
    const cleanBase = envWsUrl.replace(/\/$/, '')
    const cleanId = wsId.startsWith('/') ? wsId : `/${wsId}`
    return `${cleanBase}${cleanId.startsWith('/ws/') ? cleanId : `/ws${cleanId}`}`
  }

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    const isHttps = protocol === 'https:'
    const wsProto = isHttps ? 'wss' : 'ws'
    const cleanId = wsId.startsWith('/') ? wsId : `/${wsId}`
    const path = cleanId.startsWith('/ws/') ? cleanId : `/ws${cleanId}`

    // 2. 本地纯 HTTP 开发模式 (http://localhost:3000 或 http://127.0.0.1:3000)
    if (!isHttps && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return `ws://localhost:8080${path}`
    }

    // 3. 线上生产环境或 HTTPS 环境：
    // 使用纯域名 hostname（绝对无端口混入），配合 Nginx 同源反代 /ws/
    return `${wsProto}://${hostname}${path}`
  }

  // 服务端渲染兜底
  return `ws://localhost:8080/ws/${wsId}`
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
      const ws = wsRef.current
      wsRef.current = null
      ws.onclose = null
      ws.onerror = null
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close()
      } else if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  /** 向服务端发送文本消息 */
  const send = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message)
    } else {
      console.warn('[WS] 连接未就绪，无法发送消息:', message)
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

  return { status, lastMessage, connect, disconnect, send }
}
