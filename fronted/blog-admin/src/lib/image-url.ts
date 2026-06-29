/**
 * 后端资源 Host（不含 /api 后缀）
 * 未配置 env 时返回空字符串，表示走 Next.js 同源代理（/uploads → 后端）
 */
export function getBackendHost(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    return backendUrl.replace(/\/$/, "");
  }
  return "";
}

/**
 * 解析相对路径资源 URL 为浏览器可访问地址
 *
 * @param url 相对路径（如 /uploads/uuid.png）或完整 URL
 */
export function resolveAssetUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const host = getBackendHost();
  if (url.startsWith("/")) return `${host}${url}`;
  return `${host}/${url}`;
}
