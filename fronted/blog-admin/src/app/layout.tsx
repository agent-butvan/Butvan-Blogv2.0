import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

/**
 * 管理后台元数据
 */
export const metadata: Metadata = {
  title: "可梵的个人博客 | 管理后台",
  description: "Butvan Blog 管理后台 — 文章编辑、场景配置、内容管理",
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
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
