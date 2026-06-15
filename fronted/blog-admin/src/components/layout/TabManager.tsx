"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { X, ChevronDown, Layers3, Flame, Trash2 } from "lucide-react";
import { cn } from "@heroui/react";

interface TabItem {
  title: string;
  url: string;
}

const PATH_TITLE_MAP: Record<string, string> = {
  "/": "仪表盘",
  "/articles": "文章管理",
  "/articles/new": "写新文章",
  "/categories": "分类管理",
  "/comments": "评论管理",
  "/media": "媒体中心",
  "/scenes": "场景编辑器",
  "/settings": "系统设置",
  "/tags": "标签管理",
  "/series": "专栏管理",
  "/subscribers": "订阅管理",
  "/navigation": "导航管理",
  "/pages": "单页管理",
};

/**
 * 根据当前 pathname 匹配对应的中文标题
 */
const getTabTitle = (pathname: string): string => {
  if (PATH_TITLE_MAP[pathname]) {
    return PATH_TITLE_MAP[pathname];
  }
  if (pathname.startsWith("/scenes/")) {
    return "场景编辑";
  }
  if (pathname.startsWith("/articles/edit/")) {
    return "编辑文章";
  }
  return "页面详情";
};

/**
 * 后台多标签管理器组件
 * - 自动感应浏览器路由增加 Tab 项
 * - 与 localStorage 进行持久化同步
 * - 紧致的高密度平铺，极致利用空间，毫无臃肿感
 * - 提供“关闭其他”与“关闭所有”的精简下拉动作面板
 */
export default function TabManager() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 初始化从本地缓存获取
  useEffect(() => {
    const saved = localStorage.getItem("admin_tabs");
    let initialTabs: TabItem[] = [{ title: "仪表盘", url: "/" }];
    if (saved) {
      try {
        initialTabs = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    
    // 当前页面如果不在页签里，则添加进来
    const hasCurrent = initialTabs.some((t) => t.url === pathname);
    if (!hasCurrent && pathname && pathname !== "/login") {
      initialTabs.push({
        title: getTabTitle(pathname),
        url: pathname,
      });
    }
    
    setTimeout(() => {
      setMounted(true);
      setTabs(initialTabs);
    }, 0);
    localStorage.setItem("admin_tabs", JSON.stringify(initialTabs));
  }, [pathname]);

  // 路由变化时增补
  useEffect(() => {
    if (!mounted || !pathname || pathname === "/login") return;

    setTimeout(() => {
      setTabs((prev) => {
        const exists = prev.some((t) => t.url === pathname);
        if (exists) return prev;
        
        const newTabs = [...prev, { title: getTabTitle(pathname), url: pathname }];
        localStorage.setItem("admin_tabs", JSON.stringify(newTabs));
        return newTabs;
      });
    }, 0);
  }, [pathname, mounted]);  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const handleTabClick = (url: string) => {
    router.push(url);
  };

  const handleCloseTab = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    
    // 主页不允许关闭
    if (url === "/") return;

    const targetIndex = tabs.findIndex((t) => t.url === url);
    const newTabs = tabs.filter((t) => t.url !== url);
    
    setTabs(newTabs);
    localStorage.setItem("admin_tabs", JSON.stringify(newTabs));

    // 如果关闭的是当前激活页，则跳转相邻页
    if (pathname === url) {
      if (newTabs.length > 0) {
        const nextActiveIndex = Math.min(targetIndex, newTabs.length - 1);
        router.push(newTabs[nextActiveIndex].url);
      } else {
        router.push("/");
      }
    }
  };

  const handleCloseOthers = () => {
    const activeTab = tabs.find((t) => t.url === pathname) || { title: getTabTitle(pathname), url: pathname };
    const newTabs = activeTab.url === "/" ? [activeTab] : [{ title: "仪表盘", url: "/" }, activeTab];
    // 数组去重
    const uniqueTabs = newTabs.filter(
      (tab, index, self) => self.findIndex((t) => t.url === tab.url) === index
    );
    setTabs(uniqueTabs);
    localStorage.setItem("admin_tabs", JSON.stringify(uniqueTabs));
    setMenuOpen(false);
  };

  const handleCloseAll = () => {
    const dashboardTab = { title: "仪表盘", url: "/" };
    setTabs([dashboardTab]);
    localStorage.setItem("admin_tabs", JSON.stringify([dashboardTab]));
    router.push("/");
    setMenuOpen(false);
  };

  return (
    <div className="flex h-9 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 select-none px-4 shrink-0">
      
      {/* 标签列表区 */}
      <div className="flex flex-1 items-center overflow-x-auto custom-scrollbar h-full -mb-px">
        {tabs.map((tab) => {
          const active = pathname === tab.url;
          return (
            <div
              key={tab.url}
              onClick={() => handleTabClick(tab.url)}
              className={cn(
                "group flex h-9 items-center gap-1.5 px-4 text-xs font-medium border-r border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer relative shrink-0",
                active
                  ? "bg-zinc-50 dark:bg-zinc-950 text-primary font-bold border-b-2 border-b-primary"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <span className="whitespace-nowrap tracking-wide">{tab.title}</span>
              
              {/* 主页标签不显示关闭图标 */}
              {tab.url !== "/" && (
                <button
                  onClick={(e) => handleCloseTab(e, tab.url)}
                  className="p-0.5 rounded-full text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors ml-1 cursor-pointer"
                  aria-label="关闭标签"
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 右侧：下拉操作菜单 */}
      <div className="relative shrink-0 pl-2" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-6 items-center gap-1 rounded px-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer text-[10px] font-semibold tracking-wider uppercase"
        >
          <Layers3 size={11} />
          <span>管理页签</span>
          <ChevronDown size={10} className={cn("transition-transform", menuOpen && "rotate-180")} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900 py-1 shadow-lg z-50 animate-[fadeIn_0.12s_ease-out] text-left">
            <button
              onClick={handleCloseOthers}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Flame size={12} className="text-orange" />
              关闭其他页签
            </button>
            <button
              onClick={handleCloseAll}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={12} />
              关闭全部页签
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
