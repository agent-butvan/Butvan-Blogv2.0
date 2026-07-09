'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ==================== 类型定义 ====================

/** 前端统一用户信息结构 */
export interface UserInfo {
  /** 用户展示昵称 */
  nickname: string
  /** 用户头像 URL（相对路径或完整 URL） */
  avatarUrl?: string | null
  /** 登录用户名 */
  username?: string | null
  /** 用户绑定邮箱 */
  email?: string | null
}

/** AuthContext 提供的完整 API */
interface AuthContextType {
  /** 当前登录用户信息，未登录时为 null */
  user: UserInfo | null
  /** 是否已登录（计算属性） */
  isLoggedIn: boolean
  /** 初始化是否加载中 */
  isLoading: boolean
  /** 登录成功后写入用户信息（Token 通过 httpOnly Cookie 自动管理） */
  login: (userInfo: UserInfo) => void
  /** 退出登录，调用后端清除 Cookie 并清除本地状态 */
  logout: () => Promise<void>
  /** 局部更新用户信息（如头像更新后刷新展示） */
  refreshUser: (info: Partial<UserInfo>) => void
}

// ==================== Context 定义 ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== localStorage 工具函数 ====================

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
const USER_INFO_KEY = 'user_info'

/** 从 localStorage 安全读取并解析用户信息 */
function readUserFromStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const infoStr = localStorage.getItem(USER_INFO_KEY)
    if (!infoStr) return null
    const parsed = JSON.parse(infoStr)
    // 脏数据保护：缺少有效 nickname 视为无效
    if (!parsed || !parsed.nickname) {
      localStorage.removeItem(USER_INFO_KEY)
      return null
    }
    // 兼容旧数据：若缺少 email 字段，尝试从 username 推导
    if (!parsed.email && parsed.username?.includes('@')) {
      parsed.email = parsed.username
    }
    return parsed as UserInfo
  } catch {
    localStorage.removeItem(USER_INFO_KEY)
    return null
  }
}

/** 通过 /auth/check 接口尝试恢复会话（Cookie 有效但 localStorage 无数据时） */
async function restoreSessionFromServer(): Promise<UserInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json?.code !== 200 || !json.data) return null
    const d = json.data
    // 将 CurrentUserVO 映射为 UserInfo
    if (!d.nickname) return null
    return {
      nickname: d.nickname,
      avatarUrl: d.avatarUrl || null,
      username: d.username || null,
      email: d.email || null,
    } as UserInfo
  } catch {
    return null
  }
}

// ==================== Provider 组件 ====================

/**
 * 全局认证状态 Provider
 *
 * 集中管理前台用户的登录态，消除各组件重复的 initAuth / handleLogout 逻辑。
 * 内部统一监听 window 'auth-change' 事件，保证跨组件状态同步。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /** 从 localStorage 恢复登录态，若无数据则尝试通过 Cookie 从服务端恢复 */
  const syncFromStorage = useCallback(async () => {
    const restored = readUserFromStorage()
    if (restored) {
      setUser(restored)
      setIsLoading(false)
      return
    }
    // localStorage 无用户信息，尝试通过 refresh_token Cookie 恢复会话
    const serverUser = await restoreSessionFromServer()
    if (serverUser) {
      // 恢复成功，写回 localStorage 并更新状态
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(serverUser))
      setUser(serverUser)
    }
    setIsLoading(false)
  }, [])

  /** 初始化 + 监听 auth-change 事件 */
  useEffect(() => {
    syncFromStorage()
    const handler = () => syncFromStorage()
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [syncFromStorage])

  /** 登录 — 写入 localStorage 并更新状态（Token 通过 httpOnly Cookie 自动管理） */
  const login = useCallback((userInfo: UserInfo) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    setUser(userInfo)
    // 广播通知其他组件
    window.dispatchEvent(new Event('auth-change'))
  }, [])

  /** 退出登录 — 调用后端清除 Cookie + 清除本地状态 */
  const logout = useCallback(async () => {
    try {
      // 调用后端 logout 接口，清除 httpOnly Cookie + Redis 黑名单
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // 网络失败时忽略，仍然清除本地状态
    }
    localStorage.removeItem(USER_INFO_KEY)
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }, [])

  /** 局部更新用户信息（如头像、昵称变更后调用） */
  const refreshUser = useCallback((info: Partial<UserInfo>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...info }
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: user !== null,
      isLoading,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ==================== Hook ====================

/**
 * 获取全局认证状态
 *
 * 必须在 AuthProvider 子树内调用，否则抛出异常。
 *
 * @example
 * const { user, isLoggedIn, logout } = useAuth()
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth() 必须在 <AuthProvider> 内部使用')
  }
  return context
}
