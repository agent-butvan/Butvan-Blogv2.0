import type { NextConfig } from "next";

// 后端 Spring Boot 服务地址（开发环境代理目标）
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// 局域网 dev 来源白名单，可通过 NEXT_PUBLIC_DEV_ORIGINS=10.0.0.1,192.168.1.2 覆盖
const allowedDevOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS
  ? process.env.NEXT_PUBLIC_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["10.100.135.154"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  /**
   * 开发环境将 /api/*、/uploads/* 代理到后端。
   * 配合 api.ts baseURL="/api" 与 resolveAssetUrl 同源路径，支持局域网设备访问。
   * 生产环境不启用代理，需配置 NEXT_PUBLIC_API_BASE_URL 指向真实后端。
   */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  // 为 @imgly/background-removal 的 SharedArrayBuffer 提供所需的安全头
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
