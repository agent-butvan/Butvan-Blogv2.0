"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  Settings, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  X
} from "lucide-react";
import { getUser, logout as clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { cn } from "@heroui/react";

interface MobileRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 移动端右侧操作抽屉面板
 * - 包含用户头像、基本信息展示
 * - 提供主题切换（日/夜）、全屏切换、个人设置、安全登出等快捷入口
 * - 统一的设计风格，紧密排版，高利用率
 */
export default function MobileRightPanel({ isOpen, onClose }: MobileRightPanelProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUser(getUser());
      
      // 主题初始化
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
      setIsDark(shouldBeDark);
    }, 0);
  }, []);

  // 监听全屏事件变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    onClose();
  };

  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("全屏请求失败:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("退出全屏失败:", err));
    }
  };

  const handleGoSettings = () => {
    router.push("/profile");
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-[240px] z-50 glass-panel flex flex-col p-4 select-none transition-transform duration-300 shadow-2xl rounded-l-2xl border-l border-zinc-200/50 dark:border-zinc-800/40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* 顶部标题栏与关闭按钮 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-800/40 shrink-0">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">控制中心</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* 用户卡片区 */}
      <div className="flex flex-col items-center py-6 px-2 border-b border-zinc-200/50 dark:border-zinc-800/40 gap-2 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-md">
          {user?.nickname?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="text-center w-full">
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate px-2">{user?.nickname || "管理员"}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate px-2 mt-0.5">{user?.username}</p>
        </div>
      </div>

      {/* 核心系统操作微件组 */}
      <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        <span className="text-[10px] text-zinc-400 font-bold px-2.5 uppercase tracking-wider">快捷工具</span>
        
        {/* 手动深浅色切换 */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDark ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
            <span>外观模式</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{isDark ? "暗黑模式" : "浅色模式"}</span>
        </button>

        {/* 浏览器全屏切换 */}
        <button
          onClick={toggleFullscreen}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>网页全屏</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{isFullscreen ? "退出" : "开启"}</span>
        </button>

        <span className="text-[10px] text-zinc-400 font-bold px-2.5 uppercase tracking-wider mt-4">账户管理</span>

        {/* 个人设置入口 */}
        <button
          onClick={handleGoSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all cursor-pointer"
        >
          <Settings size={14} />
          <span>个人设置</span>
        </button>

        {/* 安全登出系统 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>安全登出</span>
        </button>
      </div>

      {/* 极简底部声明 */}
      <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/40 shrink-0 text-center">
        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-widest font-mono">VB CONSOLE V2.0</p>
      </div>
    </div>
  );
}
