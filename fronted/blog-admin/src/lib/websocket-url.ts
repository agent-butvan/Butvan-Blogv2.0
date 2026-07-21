/**
 * 统一构建规范化的 WebSocket 连接 URL
 *
 * 1. 优先读取环境变量 process.env.NEXT_PUBLIC_WS_URL
 * 2. 本地 HTTP 开发环境（http://localhost:3000 或 http://127.0.0.1:3001）：直连 ws://localhost:8080/ws/{wsId}
 * 3. 线上生产环境 或 HTTPS 环境：自动剔除外加的 :8080 端口，使用同源协议 (wss/ws) 和 host，
 *    通过 Nginx 反向代理（location /ws/ → blog-service:8080）传输 WebSocket 数据。
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

  const { hostname, protocol, host } = window.location;
  const isHttps = protocol === "https:";
  const wsProto = isHttps ? "wss" : "ws";
  const cleanId = wsId.startsWith("/") ? wsId : `/${wsId}`;
  const path = cleanId.startsWith("/ws/") ? cleanId : `/ws${cleanId}`;

  // 2. 本地纯 HTTP 开发模式 (http://localhost:3000 或 http://127.0.0.1:3001)
  if (!isHttps && (hostname === "localhost" || hostname === "127.0.0.1")) {
    return `ws://localhost:8080${path}`;
  }

  // 3. 线上生产环境或 HTTPS 环境：
  // 剥离地址中误带的 :8080 端口（生产环境下 Nginx 监听 443/80 标准端口，负责将 /ws/ 代理到容器内 8080 端口）
  const cleanHost = host.replace(/:8080$/, "");
  return `${wsProto}://${cleanHost}${path}`;
}
