import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * 后端 API 基地址
 * 开发环境默认指向本地 Spring Boot 服务
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Axios 实例 — 预配置 baseURL、超时、跨域凭据、请求/响应拦截器
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
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

// 是否正在并发刷新 Token 标识
let isRefreshing = false;
// 因 401 挂起的请求回调队列
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 将挂起的请求推入订阅队列
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/**
 * 刷新成功后，通知队列中所有挂起请求重试
 */
function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/**
 * 清除本地登录态并安全跳转登录页
 */
function handleAuthFailure() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
}

/**
 * 处理 401 自动静默刷新 Access Token 并重试原始请求
 */
async function handle401Refresh(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  if (originalRequest._retry) {
    handleAuthFailure();
    return Promise.reject(new Error("登录鉴权失效"));
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken: string) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(apiClient(originalRequest));
      });
    });
  }

  isRefreshing = true;

  try {
    // 调用后端刷新接口（会自动带上 httpOnly Cookie）
    const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
    const newAccessToken = res.data?.data?.accessToken;

    if (res.data?.code === 200 && newAccessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", newAccessToken);
      }
      isRefreshing = false;
      onRefreshed(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } else {
      throw new Error(res.data?.msg || "刷新 Token 失败");
    }
  } catch (refreshErr) {
    isRefreshing = false;
    refreshSubscribers = [];
    handleAuthFailure();
    return Promise.reject(refreshErr);
  }
}

/**
 * 响应拦截器 — 统一处理 401 未认证与自动静默续期
 */
apiClient.interceptors.response.use(
  async (response) => {
    // 校验后端统一响应体的状态码
    const resData = response.data;
    if (resData && typeof resData === "object" && "code" in resData) {
      if (resData.code !== 200) {
        // 如果业务 code 为 401，且请求非 login/refresh 本身，尝试静默续期
        const reqUrl = response.config.url || "";
        if (resData.code === 401 && !reqUrl.includes("/auth/login") && !reqUrl.includes("/auth/refresh")) {
          return handle401Refresh(response.config as InternalAxiosRequestConfig & { _retry?: boolean });
        }

        if (resData.code === 401) {
          handleAuthFailure();
        }

        // 如果业务 code 不是 200，抛出异常进入 catch 块
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
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const reqUrl = originalRequest?.url || "";

    if (error.response?.status === 401 && originalRequest && !reqUrl.includes("/auth/login") && !reqUrl.includes("/auth/refresh")) {
      return handle401Refresh(originalRequest);
    }

    if (error.response?.status === 401) {
      handleAuthFailure();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
