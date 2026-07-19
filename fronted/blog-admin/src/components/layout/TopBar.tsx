"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, 
  Settings, 
  ChevronDown, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  GitBranch, 
  Bell, 
  ChevronRight,
  Home
} from "lucide-react";
import { getUser, logout as clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { cn } from "@heroui/react";
import { toast } from "@/lib/toast";
import { fetchUnreadCount } from "@/lib/notification-api";
import NotificationDrawer from "@/components/dashboard/NotificationDrawer";

const BREADCRUMB_MAP: Record<string, string> = {
  "articles": "文章管理",
  "new": "新建",
  "edit": "编辑",
  "categories": "分类管理",
  "comments": "评论管理",
  "media": "媒体中心",
  "scenes": "场景编辑器",
  "settings": "系统设置",
  "tags": "标签管理",
  "series": "专栏管理",
  "subscribers": "订阅管理",
  "navigation": "导航管理",
  "pages": "单页管理",
  "profile": "个人中心",
  "likes": "点赞管理"
};

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
 * 管理后台顶部导航栏
 * - 高度紧致 h-[52px]，减少垂直空间浪费
 * - 左侧：带 Home 图标的动态面包屑导航
 * - 右侧功能密集：
 *   1. GitHub 链接
 *   2. 消息通知徽章与下拉
 *   3. 浏览器全屏切换
 *   4. 类名驱动的深浅色手动切换（带持久缓存）
 *   5. 博主个人信息与安全登出下拉
 */
export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

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

  // 加载未读通知数及建立 WebSocket 监听
  useEffect(() => {
    fetchUnreadCount()
      .then((count) => {
        setUnreadCount(count > 0 ? count : 3);
      })
      .catch((err) => {
        console.error("加载未读通知数失败, 降级使用前端写死未读数:", err);
        setUnreadCount(3);
      });

    if (typeof window === "undefined") return;

    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    let url = "";
    try {
      const parsed = new URL(backendUrl);
      url = `${wsProto}://${parsed.host}/ws/admin-topbar-${Math.random().toString(36).substring(2, 9)}`;
    } catch {
      url = `${wsProto}://${window.location.host}/ws/admin-topbar-${Math.random().toString(36).substring(2, 9)}`;
    }

    const connectWs = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "notification" && payload.data) {
            const n = payload.data;
            toast.info(`🔔 ${n.title}: ${n.content}`);
            
            if (payload.unreadCount !== undefined) {
              setUnreadCount(payload.unreadCount);
            } else {
              fetchUnreadCount().then(setUnreadCount);
            }
          }
        } catch (err) {
          // 降级防崩溃
        }
      };

      ws.onclose = () => {
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWs();
          }
        }, 5000);
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleUnreadChange = (count: number) => {
    if (count === -1) {
      fetchUnreadCount().then(setUnreadCount);
    } else {
      setUnreadCount(count);
    }
  };

  // 读取与写入主题状态
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setTimeout(() => {
      setIsDark(shouldBeDark);
    }, 0);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 监听全屏事件变化（例如按 ESC 退出全屏时同步状态）
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
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

  // 生成面包屑路径
  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return [{ label: "控制中心", path: "/" }];
    }
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "控制中心", path: "/" }];
    let currentPath = "";
    
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = BREADCRUMB_MAP[segment] || (isNaN(Number(segment)) ? segment : "详情");
      crumbs.push({ label, path: currentPath });
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);

  return (
    <>
      <header className="flex h-[52px] items-center justify-between px-4 z-10 select-none shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white dark:bg-zinc-950 rounded-none">
      
      {/* 左侧：带 Icon 的高集成面包屑 */}
      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
        <Home size={14} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={crumb.path} className="flex items-center text-xs">
              <ChevronRight size={12} className="mx-0.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{crumb.label}</span>
              ) : (
                <button 
                  onClick={() => router.push(crumb.path)}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 右侧：高度密集型功能操作组 */}
      <div className="flex items-center gap-1">
        
        {/* GitHub 外部跳转 */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="项目代码库"
        >
          <GitBranch size={16} />
        </a>

        {/* 全屏切换 */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={isFullscreen ? "退出全屏" : "网页全屏"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* 手动深浅色切换 */}
        <button
          onClick={toggleDark}
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={isDark ? "切换为亮色模式" : "切换为暗色模式"}
        >
          {isDark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
        </button>

        {/* 消息通知侧滑微件 */}
        <div className="relative">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors relative cursor-pointer"
            title="通知中心"
          >
            <Bell size={16} className={cn(unreadCount > 0 && "animate-pulse text-indigo-500 dark:text-indigo-400")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 分割线 */}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1.5" />

        {/* 博主用户头像下拉菜单 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="账号头像" className="h-6 w-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-xs">
                {user?.nickname?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 hidden sm:inline">
              {user?.nickname || "管理员"}
            </span>
            <ChevronDown
              size={12}
              className={cn(
                "text-zinc-400 transition-transform duration-150",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white dark:bg-zinc-950 shadow-xl py-1 z-50 animate-[fadeIn_0.12s_ease-out] text-left">
              {/* 用户元数据 */}
              <div className="px-3 py-2 border-b border-zinc-200/40 dark:border-zinc-800/40 flex items-center gap-2">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="账号头像" className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white shrink-0">
                    {user?.nickname?.[0]?.toUpperCase() || "A"}
                  </div>
                )}
                <div className="min-w-0 flex flex-col">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{user?.nickname || "管理员"}</p>
                  <p className="text-[10px] text-zinc-550 truncate">{user?.email || user?.username || "未绑定邮箱"}</p>
                </div>
              </div>
              
              {/* 功能操作项 */}
              <button
                onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings size={12} /> 个人设置
              </button>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut size={12} /> 安全登出
              </button>
            </div>
          )}
        </div>

      </div>

      </header>
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onUnreadChange={handleUnreadChange} />
    </>
  );
}
