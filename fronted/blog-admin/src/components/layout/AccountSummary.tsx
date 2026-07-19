"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@heroui/react";
import { getUser, logout as clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

interface AccountSummaryProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

/**
 * 解析头像地址，兼容后端返回的相对上传路径
 */
function resolveAvatarUrl(avatarUrl?: string): string {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
}

/**
 * 生成账号头像占位字符
 */
function getAvatarInitial(user: AuthUser | null): string {
  return user?.nickname?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "A";
}

/**
 * 侧边栏底部账号摘要组件
 */
export default function AccountSummary({ collapsed = false, isMobile = false, onNavigate }: AccountSummaryProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());

    const handleUserUpdate = () => {
      setUser(getUser());
    };
    window.addEventListener("user-update", handleUserUpdate);
    return () => {
      window.removeEventListener("user-update", handleUserUpdate);
    };
  }, []);

  /**
   * 跳转到个人中心页面
   */
  const handleGoProfile = () => {
    router.push("/profile");
    onNavigate?.();
  };

  /**
   * 清除本地登录态并返回登录页
   */
  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    onNavigate?.();
  };

  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);

  if (collapsed && !isMobile) {
    return (
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 p-2 shrink-0 bg-white/10 dark:bg-zinc-900/5">
        <button
          onClick={handleGoProfile}
          className="flex h-9 w-full items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="个人中心"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="账号头像" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {getAvatarInitial(user)}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 p-2.5 shrink-0 bg-white/10 dark:bg-zinc-900/5">
      <div className="flex items-center gap-2 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 px-2.5 py-2">
        <button
          onClick={handleGoProfile}
          className="group flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
          title="进入个人中心"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="账号头像" className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white shrink-0">
              {getAvatarInitial(user)}
            </span>
          )}
          <span className="min-w-0 flex flex-col">
            <span className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">
              {user?.nickname || "管理员"}
            </span>
            <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-500">
              {user?.email || user?.username || "未绑定邮箱"}
            </span>
          </span>
        </button>
        <div className={cn("flex items-center gap-1", isMobile && "shrink-0")}>
          <button
            onClick={handleGoProfile}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-primary transition-colors cursor-pointer"
            title="账号设置"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors cursor-pointer"
            title="安全登出"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
      <p className="mt-2 px-1 text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
        VB CONSOLE 2.0
      </p>
    </div>
  );
}
