import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

/**
 * 管理后台元数据
 */
export const metadata: Metadata = {
  title: "可梵的个人博客 | 管理后台",
  description: "Butvan Blog 管理后台 — 文章编辑、场景配置、内容管理",
  icons: {
    icon: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    shortcut: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    apple: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
  },
};

/**
 * 根布局
 * - lang="zh" 中文环境
 * - suppressHydrationWarning 消除 Tailwind v4 深色模式水合警告
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png" />
        <link rel="apple-touch-icon" href="https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png" />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
