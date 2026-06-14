"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Image,
  File,
  Navigation,
  BookOpen,
  Users,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

/** 菜单项定义 */
interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

/** 所有管理菜单项 */
const MENU_ITEMS: MenuItem[] = [
  { key: "dashboard", label: "仪表盘", icon: LayoutDashboard, path: "/" },
  { key: "articles", label: "文章管理", icon: FileText, path: "/articles" },
  { key: "categories", label: "分类管理", icon: FolderTree, path: "/categories" },
  { key: "tags", label: "标签管理", icon: Tags, path: "/tags" },
  { key: "comments", label: "评论管理", icon: MessageSquare, path: "/comments" },
  { key: "media", label: "媒体库", icon: Image, path: "/media" },
  { key: "pages", label: "独立页面", icon: File, path: "/pages" },
  { key: "navigation", label: "导航菜单", icon: Navigation, path: "/navigation" },
  { key: "series", label: "系列专题", icon: BookOpen, path: "/series" },
  { key: "scenes", label: "场景管理", icon: MapPin, path: "/scenes" },
  { key: "subscribers", label: "订阅者", icon: Users, path: "/subscribers" },
  { key: "settings", label: "系统设置", icon: Settings, path: "/settings" },
];

/**
 * 侧边栏导航组件
 * - 可折叠（收窄时仅显示图标）
 * - 当前路由高亮
 * - 自定义滚动条
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  /** 判断当前菜单是否激活 */
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-zinc-200 h-screen sticky top-0 transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo 区域 */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-100">
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-primary whitespace-nowrap">
            可梵后台
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors ml-auto"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2">
        {MENU_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* 底部信息 */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">Butvan Blog 2.0</p>
        </div>
      )}
    </aside>
  );
}
