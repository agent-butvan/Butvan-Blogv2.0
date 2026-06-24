import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
const backendHost = new URL(backendUrl).hostname
const backendPort = new URL(backendUrl).port || undefined
const backendProtocol = new URL(backendUrl).protocol.replace(':', '')

// 允许通过局域网 IP 访问开发服务器的来源白名单。
// Next.js dev server 默认仅放行 localhost，通过其他主机名/IP（如局域网地址）
// 访问时会被 "Blocked by sandbox network policy" 拦截（HTTP 403），
// 导致页面无法加载、HMR WebSocket (`/_next/webpack-hmr`) 连接失败。
// 此处显式放行开发机局域网地址后，移动端/其他设备访问与热更新均可正常工作。
// 仅填 hostname，不可带协议/端口（Next.js 从 Origin 头解析 hostname 后比对）
const allowedDevOrigins = ['10.100.135.154']

const nextConfig: NextConfig = {
  allowedDevOrigins,
  // ============================================================
  // 图片优化配置（解决用户端场景图片模糊问题）
  // 通过 Next.js Image Optimization API 自动生成多分辨率
  // srcSet、WebP/AVIF 转码，确保在 Retina 屏上清晰显示。
  // ============================================================
  images: {
    // 远程图片白名单 — 仅允许来自后端服务器的图片被优化
    remotePatterns: [
      {
        protocol: backendProtocol as 'http' | 'https',
        hostname: backendHost,
        port: backendPort,
        pathname: '/uploads/**',
      },
    ],
    // 响应式断点（默认值即以下列表，显式声明以明确意图）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 小尺寸变体（用于非全宽图片如头像、缩略图）
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // 输出格式优先级：AVIF 优先，WebP 降级
    formats: ['image/avif', 'image/webp'],
    // Next.js 16 要求显式声明允许的图片质量等级
    qualities: [75],
    // 允许优化局域网 IP 的图片（开发环境中后端可能运行在局域网地址）
    dangerouslyAllowLocalIP: true,
    // 缓存 TTL：开发环境设短以方便调试
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
