/**
 * 统一构建规范化的 WebSocket 连接 URL
 *
 * 1. 优先读取环境变量 process.env.NEXT_PUBLIC_WS_URL
 * 2. 本地纯 HTTP 开发环境（http://localhost:3000 或 http://127.0.0.1:3001）：直连 ws://localhost:8080/ws/{wsId}
 * 3. 线上生产环境、HTTPS 环境或使用域名的环境：
 *    使用纯域名 hostname（不携带任何端口号），由 Nginx 在 443/80 端口反向代理 /ws/ 到后端容器。
 *
 * @param wsId 客户端连接标识/路径后缀
 */
export function buildWsUrl(wsId: string): string {
  if (typeof window === "undefined") return "";

  // 1. 优先使用显式环境变量
  const envWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envWsUrl && envWsUrl.trim() !== "") {
    const cleanBase = envWsUrl.replace(/\/$/, "");
    const cleanId = wsId.startsWith("/") ? wsId : `/${wsId}`;
    return `${cleanBase}${cleanId.startsWith("/ws/") ? cleanId : `/ws${cleanId}`}`;
  }

  const { hostname, protocol } = window.location;
  const isHttps = protocol === "https:";
  const wsProto = isHttps ? "wss" : "ws";
  const cleanId = wsId.startsWith("/") ? wsId : `/${wsId}`;
  const path = cleanId.startsWith("/ws/") ? cleanId : `/ws${cleanId}`;

  // 2. 本地纯 HTTP 开发模式 (http://localhost:3000 或 http://127.0.0.1:3001)
  if (!isHttps && (hostname === "localhost" || hostname === "127.0.0.1")) {
    return `ws://localhost:8080${path}`;
  }

  // 3. 线上生产环境或 HTTPS 环境：
  // 直接采用当前页面的纯域名 hostname（绝对无端口混入），配合 Nginx 反代 /ws/
  return `${wsProto}://${hostname}${path}`;
}
