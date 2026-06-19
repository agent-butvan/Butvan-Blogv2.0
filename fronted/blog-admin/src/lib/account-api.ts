import apiClient from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import type { ApiResponse } from "@/types/common";

/** 当前账号个人中心资料 */
export interface CurrentUser extends AuthUser {
  email?: string;
  bio?: string;
  status: "ACTIVE" | "DISABLED";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 当前账号基础资料更新入参 */
export interface CurrentUserUpdatePayload {
  nickname: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}

/** 当前账号密码修改入参 */
export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * 拉取当前登录账号资料
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await apiClient.get<ApiResponse<CurrentUser>>("/auth/me");
  return res.data.data;
}

/**
 * 更新当前登录账号基础资料
 */
export async function updateCurrentUserProfile(payload: CurrentUserUpdatePayload): Promise<CurrentUser> {
  const res = await apiClient.put<ApiResponse<CurrentUser>>("/auth/me/profile", payload);
  return res.data.data;
}

/**
 * 修改当前登录账号密码
 */
export async function changeCurrentUserPassword(payload: PasswordChangePayload): Promise<void> {
  await apiClient.put<ApiResponse<void>>("/auth/me/password", payload);
}
