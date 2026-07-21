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

/**
 * 构建 WebSocket 连接地址
 *
 * WebSocket 协议不走 Next.js rewrites 代理，需要浏览器直连后端。
 * 生产环境始终使用 window.location.host（配合 nginx 反向代理 /ws → 后端），
 * 开发环境直连 localhost:8080。
 */
function buildWsUrl(wsId: string): string {
  // 1. 生产环境：始终使用当前页面域名（nginx 负责将 /ws 转发到后端）
  if (typeof window !== 'undefined') {
    const { hostname, protocol, host } = window.location
    const wsProto = protocol === 'https:' ? 'wss' : 'ws'
    // 非本地环境：直接使用当前域名，不带任何硬编码端口
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${wsProto}://${host}/ws/${wsId}`
    }
  }

  // 2. 开发环境兜底：直连 localhost:8080
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
      wsRef.current.close()
      wsRef.current = null
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
