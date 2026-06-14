"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { getUser, logout as clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { cn } from "@heroui/react";

/**
 * 管理后台顶部栏
 * - 左侧：页面标题
 * - 右侧：用户头像 + 下拉菜单（退出登录）
 */
export default function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 sticky top-0 z-10">
      {/* 左侧：页面标题 */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-neutral-dark">管理后台</h2>
      </div>

      {/* 右侧：用户信息 + 下拉菜单 */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 transition-colors"
          >
            {/* 头像 */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {user?.nickname?.[0] || "U"}
            </div>
            <span className="text-sm font-medium text-zinc-700 hidden sm:inline">
              {user?.nickname || "管理员"}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-zinc-400 transition-transform duration-150",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {/* 下拉菜单 */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg z-50">
              {/* 用户信息 */}
              <div className="px-3 py-2 border-b border-zinc-50">
                <p className="text-sm font-medium text-zinc-800">{user?.nickname}</p>
                <p className="text-xs text-zinc-400">{user?.username}</p>
              </div>
              {/* 菜单项 */}
              <button
                onClick={() => { router.push("/settings"); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <Settings size={15} /> 系统设置
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
