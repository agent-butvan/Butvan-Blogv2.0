import axios, { type AxiosInstance, type AxiosError } from "axios";

/**
 * 后端 API 基地址
 * 开发环境默认指向本地 Spring Boot 服务
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Axios 实例 — 预配置 baseURL、超时、请求拦截器（注入 JWT）、响应拦截器（处理 401）
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // 开启跨域携带 Cookie (包含 refresh_token)
  headers: {
    "Content-Type": "application/json",
  },
});

if (typeof window !== "undefined") {
  axios.get("https://api.ipify.org?format=json", { timeout: 3000 })
    .then((res) => {
      if (res.data?.ip) {
        localStorage.setItem("client_real_ip", res.data.ip);
      }
    })
    .catch(() => {
      axios.get("https://api.ip.sb/ip", { timeout: 3000 })
        .then((res) => {
          if (res.data) {
            localStorage.setItem("client_real_ip", String(res.data).trim());
          }
        })
        .catch(() => {});
    });
}

/**
 * 请求拦截器 — 自动注入 JWT Token 与真实客户端 IP
 */
apiClient.interceptors.request.use(
  (config) => {
    // 仅在浏览器端执行（避免 SSR 时访问 localStorage 报错）
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const realIp = localStorage.getItem("client_real_ip");
      if (realIp) {
        config.headers["X-Client-Real-IP"] = realIp;
      }
    }
    // 当请求体为 FormData 时，删除手动设置的 Content-Type，
    // 让浏览器/axios 自动添加带 boundary 的 multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 控制并发无感刷新的状态与队列
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const handleUnauthorizedLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
};

/**
 * 响应拦截器 — 统一处理 401 无感刷新与重试
 */
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && typeof resData === "object" && "code" in resData) {
      if (resData.code !== 200 && resData.code !== 401) {
        return Promise.reject({
          response: {
            status: resData.code,
            data: resData,
          },
          message: resData.msg || "业务处理失败",
        });
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // 如果触发 401 的本身就是 /auth/refresh 刷新接口，说明长 Token 也已失效，直接登出
      if (originalRequest.url?.includes("/auth/refresh")) {
        handleUnauthorizedLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 请求后端换取新 Access Token
        const res = await apiClient.post("/auth/refresh");
        const newAccessToken = res.data?.data;
        if (newAccessToken && typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        handleUnauthorizedLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
