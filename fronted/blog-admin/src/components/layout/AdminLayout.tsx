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
 * - 全局采用渐变噪声背景层与游走气泡
 * - 左右悬空玻璃质感卡片排版
 * - 自适应适配移动端：3D 卡片平移缩放抽屉交互，紧凑高密度空间利用
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSlide, setMobileSlide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 监听路由变化，若在移动端点击菜单跳转，则自动关闭菜单
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
        "relative flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 bg-noise-texture transition-colors",
        isMobile ? "p-0 gap-0" : "p-3 gap-3"
      )}
    >
      {/* ===== 背景柔光游走气泡 (仅浸染底色，高颜值) ===== */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#9b8afb]/3 dark:bg-[#9b8afb]/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-float-slow z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#4ea3ff]/3 dark:bg-[#4ea3ff]/5 blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2 animate-float-reverse z-0" />

      {/* 侧边栏导航 */}
      <Sidebar
        isMobile={isMobile}
        isOpen={mobileSlide === "left"}
        onClose={() => setMobileSlide(null)}
      />

      {/* 主工作区域 */}
      <div
        style={getMobileStyle()}
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl origin-center",
          isMobile
            ? "z-10 bg-zinc-50 dark:bg-zinc-950 h-full border border-zinc-200/30 dark:border-zinc-800/20 gap-2 p-2"
            : "z-10 gap-3"
        )}
      >
        {/* 顶栏与页签 */}
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

        {/* 主内容视口 */}
        <main
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar relative",
            isMobile
              ? "bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-3"
              : "glass-panel rounded-2xl p-4"
          )}
        >
          {children}
        </main>

        {/* 移动端菜单激活状态下的点击蒙层与操作锁定 */}
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


