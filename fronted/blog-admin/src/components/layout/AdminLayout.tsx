"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TabManager from "./TabManager";
import MobileHeader from "./MobileHeader";
import MobileRightPanel from "./MobileRightPanel";
import { cn } from "@heroui/react";

/**
 * 管理后台整体布局
 * - 去除悬浮浮动卡片感（移除外边距 p-3、gap-3 及 rounded-2xl）
 * - 采用整页贴边（Docked）直角分栏布局，通过极细边框（border-r / border-b）进行网格边界隔离
 * - 自适应适配移动端：保留 3D 平移缩放抽屉的高级感，并在移动端保留合适圆角
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSlide, setMobileSlide] = useState<"left" | "right" | null>(null);

  // 监听窗口大小以适配移动端
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 监听路由变化，跳转时自动收起移动端侧栏
  useEffect(() => {
    setTimeout(() => {
      setMobileSlide(null);
    }, 0);
  }, [pathname]);

  // 计算移动端 3D 平移缩放样式
  const getMobileStyle = () => {
    if (!isMobile) return {};
    if (mobileSlide === "left") {
      return {
        transform: "translateX(240px) scale(0.9)",
        borderRadius: "1rem",
      };
    }
    if (mobileSlide === "right") {
      return {
        transform: "translateX(-240px) scale(0.9)",
        borderRadius: "1rem",
      };
    }
    return {
      transform: "translateX(0) scale(1)",
      borderRadius: "0px",
    };
  };

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 bg-noise-texture transition-colors p-0 gap-0"
      )}
    >
      {/* 极微弱背景渲染，确保简约质感 */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/2 dark:bg-primary/3 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-accent/2 dark:bg-accent/3 blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2 z-0" />

      {/* 侧边栏导航：高利用率，Docked */}
      <Sidebar
        isMobile={isMobile}
        isOpen={mobileSlide === "left"}
        onClose={() => setMobileSlide(null)}
      />

      {/* 主工作区域：扁平直角分栏 */}
      <div
        style={getMobileStyle()}
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-center z-10",
          isMobile
            ? "bg-zinc-50 dark:bg-zinc-950 h-full border border-zinc-200/30 dark:border-zinc-800/20 gap-2 p-2 shadow-2xl"
            : "gap-0"
        )}
      >
        {/* 顶部导航与多页签管理器：直接贴顶平铺 */}
        {!isMobile ? (
          <>
            <TopBar />
            <TabManager />
          </>
        ) : (
          <MobileHeader
            onToggleLeft={() => setMobileSlide(mobileSlide === "left" ? null : "left")}
            onToggleRight={() => setMobileSlide(mobileSlide === "right" ? null : "right")}
          />
        )}

        {/* 主内容视口：Docked 直角纯色，去除玻璃卡片感 */}
        <main
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar relative",
            isMobile
              ? "bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-3"
              : "bg-zinc-50/50 dark:bg-zinc-950/20 p-5"
          )}
        >
          {children}
        </main>

        {/* 移动端菜单激活时的背景蒙层 */}
        {isMobile && mobileSlide !== null && (
          <div
            onClick={() => setMobileSlide(null)}
            className="absolute inset-0 bg-black/10 dark:bg-black/35 backdrop-blur-xs z-40 rounded-xl cursor-pointer transition-opacity"
          />
        )}
      </div>

      {/* 移动端右侧操作面板 */}
      {isMobile && (
        <MobileRightPanel
          isOpen={mobileSlide === "right"}
          onClose={() => setMobileSlide(null)}
        />
      )}
    </div>
  );
}
