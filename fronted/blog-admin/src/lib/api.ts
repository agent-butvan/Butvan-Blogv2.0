import axios, { type AxiosInstance, type AxiosError } from "axios";

/**
 * 后端 API 基地址
 * 开发环境默认指向本地 Spring Boot 服务
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

/**
 * Axios 实例 — 预配置 baseURL、超时、请求拦截器（注入 JWT）、响应拦截器（处理 401）
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 请求拦截器 — 自动注入 JWT Token
 */
apiClient.interceptors.request.use(
  (config) => {
    // 仅在浏览器端执行（避免 SSR 时访问 localStorage 报错）
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器 — 统一处理 401 未认证
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转登录页
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        // 避免在登录页死循环
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
