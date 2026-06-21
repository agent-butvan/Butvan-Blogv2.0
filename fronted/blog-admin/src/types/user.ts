import type { AuthUser } from "@/lib/auth";

/**
 * 用户/认证相关类型定义
 */

/** 登录请求体 */
export interface LoginDTO {
  username: string;
  password: string;
  twoFactorCode?: string;
}

/** 注册请求体 */
export interface RegisterDTO {
  username: string;
  password: string;
  nickname: string;
  email?: string;
}

/** 登录响应体 */
export interface LoginVO {
  token: string;
  user: AuthUser;
}

/** 用户列表项 */
export interface UserItem {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  avatarUrl?: string;
  role: "ADMIN" | "AUTHOR";
  status: "ACTIVE" | "DISABLED";
  lastLoginAt?: string;
  createdAt: string;
}

/** 场景相关类型 */
export interface SceneItem {
  id: number;
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 热区/物品类型 */
export interface HotspotItem {
  id: number;
  sceneId: number;
  itemName: string;
  itemImageUrl?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent?: number;
  geometryExt?: Record<string, unknown>;
  hoverTips?: string;
  redirectType: "INTERNAL" | "EXTERNAL" | "ARTICLE" | "CATEGORY";
  redirectPath?: string;
  redirectTargetId?: number;
  zoomScale: number;
  sortOrder: number;
  isVisible: boolean;
}
