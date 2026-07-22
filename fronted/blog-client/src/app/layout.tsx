import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BackgroundWrapper from "@/components/common/BackgroundWrapper";

export const metadata: Metadata = {
  title: "可梵的个人博客 | 首页",
  description: "沉浸式视觉交互博客系统 - 欢迎来到我的房间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('theme', 'light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <BackgroundWrapper>
          <Providers>{children}</Providers>
        </BackgroundWrapper>
      </body>
    </html>
  );
}
