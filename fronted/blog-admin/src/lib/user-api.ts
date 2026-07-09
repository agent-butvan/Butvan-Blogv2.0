import apiClient from "@/lib/api";
import type { ApiResponse, PageResult } from "@/types/common";

/** 后台用户管理列表项 */
export interface AdminUser {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "DISABLED";
  twoFactorEnabled: boolean;
  githubUsername?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
}

/** 用户列表查询参数 */
export interface UserListParams {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

/** 创建用户表单 */
export interface CreateUserPayload {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  role: "ADMIN" | "USER";
}

/** 编辑用户表单 */
export interface UpdateUserPayload {
  nickname: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: "ADMIN" | "USER";
}

/** 重置密码表单 */
export interface ResetPasswordPayload {
  newPassword: string;
}

/**
 * 分页查询用户列表
 */
export async function fetchUsers(params: UserListParams = {}): Promise<PageResult<AdminUser>> {
  const res = await apiClient.get<ApiResponse<PageResult<AdminUser>>>("/admin/users", { params });
  return res.data.data;
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: number): Promise<AdminUser> {
  const res = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
  return res.data.data;
}

/**
 * 创建新用户
 */
export async function createUser(payload: CreateUserPayload): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/admin/users", payload);
}

/**
 * 编辑用户信息
 */
export async function updateUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
  const res = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, payload);
  return res.data.data;
}

/**
 * 切换用户启用/禁用状态
 */
export async function toggleUserStatus(id: number): Promise<void> {
  await apiClient.patch<ApiResponse<void>>(`/admin/users/${id}/status`);
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
}

/**
 * 重置用户密码
 */
export async function resetPassword(id: number, payload: ResetPasswordPayload): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/admin/users/${id}/password`, payload);
}

/**
 * 批量切换用户状态
 */
export async function batchToggleStatus(ids: number[], status: "ACTIVE" | "DISABLED"): Promise<void> {
  await apiClient.patch<ApiResponse<void>>("/admin/users/batch/status", { ids, status });
}
