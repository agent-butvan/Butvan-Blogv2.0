import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const backendHost = new URL(backendUrl).hostname;
const backendPort = new URL(backendUrl).port || undefined;
const backendProtocol = new URL(backendUrl).protocol.replace(":", "");

// 局域网 dev 来源白名单，可通过 NEXT_PUBLIC_DEV_ORIGINS 覆盖（逗号分隔 hostname）
const allowedDevOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS
  ? process.env.NEXT_PUBLIC_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["10.100.135.154"];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  /** API 与静态上传资源代理，支持同源访问 */
  async rewrites() {
    /** 运行时后端地址：Docker 容器内使用 BACKEND_URL 环境变量 */
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
  images: {
    localPatterns: [
      {
        pathname: "/image-proxy",
      },
    ],
    remotePatterns: [
      {
        protocol: backendProtocol as "http" | "https",
        hostname: backendHost,
        port: backendPort,
        pathname: "/uploads/**",
      },
      // MinIO 对象存储预签名 URL（生产环境图片直接由 MinIO 提供）
      {
        protocol: "http",
        hostname: "47.102.205.85",
        port: "19000",
        pathname: "/blog2/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    dangerouslyAllowLocalIP: true,
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
