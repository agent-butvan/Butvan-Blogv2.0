"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { setToken, setUser, getUser, getToken, logout as clearAuth, type AuthUser } from "@/lib/auth";
import type { ApiResponse } from "@/types/common";
import type { LoginDTO, LoginVO, RegisterDTO } from "@/types/user";

/**
 * 认证状态 Hook
 * 提供登录/登出/认证状态查询等功能
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 恢复用户状态
  useEffect(() => {
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * 登录
   */
  const login = useCallback(
    async (dto: LoginDTO): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await apiClient.post<ApiResponse<LoginVO>>("/auth/login", dto);
        const { token, user: loginUser } = res.data.data;

        setToken(token);
        setUser(loginUser);
        setUserState(loginUser);

        return { success: true };
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { msg?: string } } };
        const msg = axiosError?.response?.data?.msg || "登录失败，请检查账号密码";
        return { success: false, error: msg };
      }
    },
    []
  );

  /**
   * 注册
   */
  const register = useCallback(
    async (dto: RegisterDTO): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiClient.post<ApiResponse<void>>("/auth/register", dto);
        return { success: true };
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { msg?: string } } };
        const msg = axiosError?.response?.data?.msg || "注册失败，请稍后再试";
        return { success: false, error: msg };
      }
    },
    []
  );

  /**
   * 登出
   */
  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
