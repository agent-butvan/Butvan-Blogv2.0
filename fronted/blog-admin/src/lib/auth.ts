/**
 * 认证工具模块 — Token 存储、用户信息管理
 * 注意：仅在浏览器端可用（依赖 localStorage）
 */

const TOKEN_KEY = "access_token";
const USER_KEY = "user_info";

/** 用户基本信息 */
export interface AuthUser {
  id: number;
  username: string;
  nickname: string;
  avatarUrl?: string;
  role: "ADMIN" | "AUTHOR";
}

/**
 * 保存 JWT Token 到 localStorage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 获取存储的 JWT Token
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 保存用户信息
 */
export function setUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 获取存储的用户信息
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * 判断用户是否已登录（Token 存在即视为已登录）
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * 退出登录 — 清除所有存储的认证信息
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
