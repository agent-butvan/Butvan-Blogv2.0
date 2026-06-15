import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================================
  // 图片优化配置（解决用户端场景图片模糊问题）
  // 通过 Next.js Image Optimization API 自动生成多分辨率
  // srcSet、WebP/AVIF 转码，确保在 Retina 屏上清晰显示。
  // ============================================================
  images: {
    // 远程图片白名单 — 仅允许来自后端服务器的图片被优化
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
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
    // 允许优化局域网 IP 的图片（开发环境中后端在 localhost）
    dangerouslyAllowLocalIP: true,
    // 缓存 TTL：开发环境设短以方便调试
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
