/**
 * API 基地址（含 /api 后缀）
 * 开发环境默认 /api，走 Next.js 代理；生产需配置 NEXT_PUBLIC_API_BASE_URL
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * 后端 Host（不含 /api），用于拼接 /uploads 等静态资源
 */
export function getBackendHost(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "");
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }
  return "";
}

/**
 * 解析相对路径图片 URL 为完整可访问地址
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return "";

  // 1. 如果当前是在 HTTPS 环境下加载不安全的 HTTP 外部图片，则通过本地 API 路由进行代理中转，以防 Mixed Content 拦截
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.startsWith("http://")
  ) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/images/")) {
    return url;
  }
  const host = getBackendHost();
  if (url.startsWith("/")) return `${host}${url}`;
  return `${host}/${url}`;
}
