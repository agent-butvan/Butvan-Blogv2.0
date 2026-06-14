"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * 管理后台整体布局
 * - 左侧：可折叠侧边栏
 * - 右侧：顶栏 + 内容区
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-light">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部栏 */}
        <TopBar />

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
