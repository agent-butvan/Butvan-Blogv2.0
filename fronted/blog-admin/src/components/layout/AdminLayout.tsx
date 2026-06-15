"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TabManager from "./TabManager";

/**
 * 管理后台整体布局
 * - 全局采用渐变噪声背景层与游走气泡
 * - 左右悬空玻璃质感卡片排版
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 bg-noise-texture transition-colors p-3 gap-3">
      {/* ===== 背景柔光游走气泡 (仅浸染底色，高颜值) ===== */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#9b8afb]/3 dark:bg-[#9b8afb]/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-float-slow z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#4ea3ff]/3 dark:bg-[#4ea3ff]/5 blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2 animate-float-reverse z-0" />

      {/* 侧边栏 */}
      <Sidebar />

      {/* 主工作区域 */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden gap-3">
        {/* 顶部栏 */}
        <TopBar />

        {/* 页签管理器 */}
        <TabManager />

        {/* 主内容视口 (毛玻璃卡片) */}
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar glass-panel rounded-2xl relative">
          {children}
        </main>
      </div>
    </div>
  );
}

