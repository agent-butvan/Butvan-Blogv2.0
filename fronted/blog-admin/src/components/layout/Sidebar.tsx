"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import * as Icons from "lucide-react";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, HelpCircle, ChevronDown, X } from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { NavigationItem } from "@/types/navigation";

/**
 * 根据数据库返回的字符串动态提取并获取 LucideIcon 组件
 * 若找不到对应的图标名称，将自动返回 HelpCircle 问号图标进行无害降级，防止前端崩溃
 */
const getIconComponent = (iconName?: string): Icons.LucideIcon => {
  if (!iconName) return HelpCircle;
  const IconComponent = (Icons as Record<string, unknown>)[iconName] as Icons.LucideIcon;
  return IconComponent || HelpCircle;
};

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * 侧边栏导航组件
 * - 紧密排版，高利用率，摒弃多余留白
 * - 选中状态采用紫罗兰底色（Light: #F3EEFF，Dark: #201C38）配合左侧垂直高亮色块
 * - 支持侧边栏折叠收缩（展开 220px，收缩 56px）
 * - 支持子路由感知展开与二级菜单连线指示
 */
export default function Sidebar({ isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 记录哪些一级折叠菜单是展开状态
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const loadMenus = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiClient.get<ApiResponse<NavigationItem[]>>("/navigations?position=ADMIN_SIDEBAR");
      setMenuItems(res.data.data || []);
    } catch (err) {
      console.error("加载后台侧边栏菜单失败: ", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadMenus();
    }, 0);
  }, []);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // 路由感知：展开带有高亮二级菜单的一级菜单
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialOpen = { ...openMenus };
      let changed = false;
      menuItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const hasActiveChild = item.children.some((child) => isActive(child.linkUrl));
          if (hasActiveChild && !initialOpen[item.id]) {
            initialOpen[item.id] = true;
            changed = true;
          }
        }
      });
      if (changed) {
        setTimeout(() => {
          setOpenMenus(initialOpen);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems, pathname]);

  const toggleMenu = (id: number) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus((prev) => ({
        ...prev,
        [id]: true,
      }));
      return;
    }
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={cn(
        isMobile
          ? "fixed left-0 top-0 h-full w-[240px] z-50 glass-panel flex flex-col select-none transition-transform duration-300 shadow-2xl rounded-r-2xl rounded-l-none border-r border-zinc-200/50 dark:border-zinc-800/40"
          : "flex flex-col h-full rounded-2xl transition-all duration-200 select-none z-30 shrink-0 glass-panel overflow-hidden",
        isMobile
          ? (isOpen ? "translate-x-0" : "-translate-x-full")
          : (collapsed ? "w-[56px]" : "w-[220px]")
      )}
    >
      {/* 顶层 Logo 标志区 (高度对齐 TopBar) */}
      <div className="flex h-[52px] items-center justify-between px-3 border-b border-zinc-200/50 dark:border-zinc-800/40 shrink-0 bg-white/20 dark:bg-zinc-900/20">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2 animate-[fadeIn_0.15s_ease-out]">
            <span className="font-heading font-extrabold text-[10px] bg-primary text-white w-5 h-5 rounded-md flex items-center justify-center tracking-tighter">VB</span>
            <span className="font-heading font-bold text-xs text-zinc-800 dark:text-zinc-200 whitespace-nowrap tracking-wider">
              可梵控制台
            </span>
          </div>
        )}
        {!isMobile ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer",
              collapsed ? "mx-auto" : "ml-auto"
            )}
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="关闭侧边栏"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 核心菜单列表区 */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2.5 px-1.5 flex flex-col gap-1">
        {/* 1. 加载中状态 */}
        {loading && (
          <div className="space-y-3 px-2 py-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-2.5 animate-pulse">
                <div className="w-4.5 h-4.5 rounded-md bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                {!collapsed && <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800/40 rounded w-2/3" />}
              </div>
            ))}
          </div>
        )}

        {/* 2. 加载异常状态 */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-10 px-1 text-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                <span className="text-[10px] text-zinc-400">菜单加载失败</span>
                <button
                  onClick={loadMenus}
                  className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mt-0.5"
                >
                  <RefreshCw size={10} className="animate-spin-slow" />
                  点击重试
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. 空数据状态 */}
        {!loading && !error && menuItems.length === 0 && (
          <div className="text-center py-12 text-[10px] text-zinc-400">
            {!collapsed && <span className="animate-[fadeIn_0.15s_ease-out]">暂无可用菜单项</span>}
          </div>
        )}

        {/* 4. 数据渲染 */}
        {!loading && !error && menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const IconComp = getIconComponent(item.icon);

          // 树状二级菜单
          if (hasChildren) {
            const isOpen = !!openMenus[item.id];
            const isChildActive = item.children.some((child) => isActive(child.linkUrl));

            return (
              <div key={item.id} className="flex flex-col w-full">
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2.25 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer text-left focus:outline-none relative group",
                    isChildActive
                      ? "text-primary dark:text-[#b0a2ff] bg-primary/5 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {/* 左侧垂直状态指示线 */}
                  {isChildActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4.5 bg-primary rounded-r" />
                  )}
                  
                  <div className="flex items-center gap-2 truncate">
                    <IconComp size={15} className={cn("shrink-0", isChildActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500")} />
                    {!collapsed && (
                      <span className="whitespace-nowrap truncate tracking-wide animate-[fadeIn_0.15s_ease-out]">
                        {item.title}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={12}
                      className={cn(
                        "text-zinc-400 transition-transform duration-200 shrink-0",
                        isOpen ? "transform rotate-180" : ""
                      )}
                    />
                  )}
                </button>

                {/* 展开的二级菜单 */}
                {!collapsed && isOpen && (
                  <div className="flex flex-col pl-4 mt-0.5 ml-4 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 animate-[fadeIn_0.15s_ease-out]">
                    {item.children.map((child) => {
                      const childActive = isActive(child.linkUrl);
                      const ChildIcon = getIconComponent(child.icon);
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            if (child.linkUrl) {
                              router.push(child.linkUrl);
                              if (isMobile && onClose) onClose();
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-1.75 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer text-left focus:outline-none",
                            childActive
                              ? "text-primary font-bold bg-primary/5"
                              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20"
                          )}
                        >
                          <ChildIcon 
                            size={12} 
                            className={cn(
                              "shrink-0 transition-colors", 
                              childActive ? "text-primary" : "text-zinc-500 dark:text-zinc-500"
                            )} 
                          />
                          <span className="whitespace-nowrap truncate tracking-wide">
                            {child.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 一级普通菜单
          const active = isActive(item.linkUrl);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.linkUrl) {
                  router.push(item.linkUrl);
                  if (isMobile && onClose) onClose();
                }
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2.25 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer text-left focus:outline-none relative group",
                active
                  ? "bg-[#f3eeff] dark:bg-[#201c38] text-primary dark:text-[#b0a2ff] font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100"
              )}
              title={collapsed ? item.title : undefined}
            >
              {/* 左侧垂直状态指示线 */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4.5 bg-primary rounded-r" />
              )}
              
              <IconComp size={15} className={cn("shrink-0", active ? "text-primary" : "text-zinc-500 dark:text-zinc-500")} />
              {!collapsed && (
                <span className="whitespace-nowrap truncate tracking-wide animate-[fadeIn_0.15s_ease-out]">
                  {item.title}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部版权信息 (极简) */}
      {!collapsed && (
        <div className="px-3.5 py-2.5 border-t border-zinc-200/50 dark:border-zinc-800/40 shrink-0 text-left bg-white/10 dark:bg-zinc-900/5">
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">VB CONSOLE 2.0</p>
        </div>
      )}
    </aside>
  );
}
