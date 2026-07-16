import type { NextConfig } from "next";

// 后端 Spring Boot 服务地址（开发环境代理目标）
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// 局域网 dev 来源白名单，可通过 NEXT_PUBLIC_DEV_ORIGINS=10.0.0.1,192.168.1.2 覆盖
const allowedDevOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS
  ? process.env.NEXT_PUBLIC_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["10.100.135.154"];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  /**
   * 将 /api/*、/uploads/* 代理到后端，支持同源访问。
   * Docker 容器内通过 BACKEND_URL 环境变量指定后端地址。
   */
  async rewrites() {
    const proxyTarget = process.env.BACKEND_URL || backendUrl;
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${proxyTarget}/uploads/:path*`,
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
