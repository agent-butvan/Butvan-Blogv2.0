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
  /** 登录成功后写入 Token 和用户信息 */
  login: (token: string, userInfo: UserInfo) => void
  /** 退出登录，清除本地凭证与状态 */
  logout: () => void
  /** 局部更新用户信息（如头像更新后刷新展示） */
  refreshUser: (info: Partial<UserInfo>) => void
}

// ==================== Context 定义 ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== localStorage 工具函数 ====================

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'user_info'

/** 从 localStorage 安全读取并解析用户信息 */
function readUserFromStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const infoStr = localStorage.getItem(USER_INFO_KEY)
    if (!token || !infoStr) return null
    const parsed = JSON.parse(infoStr)
    // 脏数据保护：缺少有效 nickname 视为无效
    if (!parsed || !parsed.nickname) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
      return null
    }
    // 兼容旧数据：若缺少 email 字段，尝试从 username 推导
    if (!parsed.email && parsed.username?.includes('@')) {
      parsed.email = parsed.username
    }
    return parsed as UserInfo
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
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

  /** 从 localStorage 恢复登录态 */
  const syncFromStorage = useCallback(() => {
    const restored = readUserFromStorage()
    setUser(restored)
    setIsLoading(false)
  }, [])

  /** 初始化 + 监听 auth-change 事件 */
  useEffect(() => {
    syncFromStorage()
    const handler = () => syncFromStorage()
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [syncFromStorage])

  /** 登录 — 写入 localStorage 并更新状态 */
  const login = useCallback((token: string, userInfo: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    setUser(userInfo)
    // 广播通知其他组件
    window.dispatchEvent(new Event('auth-change'))
  }, [])

  /** 退出登录 — 清除凭证并重置状态 */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
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
