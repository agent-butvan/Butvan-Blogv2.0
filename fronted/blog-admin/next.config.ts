import type { NextConfig } from "next";

// 后端 Spring Boot 服务地址（用于开发环境 API 代理）
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// 允许通过局域网 IP 访问开发服务器（HMR WebSocket / _next 资源跨域放行）
const allowedDevOrigins = ["10.100.135.154"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  /**
   * 将 /api/* 代理到后端，配合 api.ts 中 baseURL="/api" 使用。
   * 局域网设备访问时走同源请求，避免浏览器直连 localhost:8080 失败。
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // 为 @imgly/background-removal 的 SharedArrayBuffer 提供所需的安全头
  // （非必须，但可提升 WASM 性能）
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
