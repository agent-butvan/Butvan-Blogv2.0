import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BackgroundWrapper from "@/components/common/BackgroundWrapper";

export const metadata: Metadata = {
  title: "可梵的个人博客",
  description: "但行好事，莫问前程。专注于 Web 全栈开发、AI 架构探秘与后端高并发实践，记录技术思考与生活感悟。",
  icons: {
    icon: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    shortcut: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    apple: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
  },
  openGraph: {
    title: "可梵的个人博客",
    description: "但行好事，莫问前程。专注于 Web 全栈开发、AI 架构探秘与后端高并发实践，记录技术思考与生活感悟。",
    images: [
      {
        url: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
        width: 400,
        height: 400,
        alt: "可梵",
      },
    ],
  },
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
