"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import * as Icons from "lucide-react";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, HelpCircle, ChevronDown } from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { NavigationItem } from "@/types/navigation";

/**
 * 根据数据库返回的字符串动态提取并获取 LucideIcon 反应组件
 * 若找不到对应的图标名称，将自动返回 HelpCircle 问号图标进行无害降级，防止前端崩溃
 *
 * @param iconName 数据库存储的图标名称字符串
 * @return 对应的 LucideIcon 反应组件
 */
const getIconComponent = (iconName?: string): Icons.LucideIcon => {
  if (!iconName) return HelpCircle;
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || HelpCircle;
};

/**
 * 侧边栏导航组件
 * - 支持从后端 REST API 动态加载展示位置为 ADMIN_SIDEBAR 的菜单数据
 * - 支持折叠/展开过渡效果
 * - 完备的加载中 (骨架屏)、加载失败 (带重试) 和空状态防御性设计
 * - 菜单长文本溢出截断保护 (truncate)
 * - 支持一级和二级的树形折叠菜单渲染，支持路由感知自动展开高亮
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- 记录哪些一级折叠菜单是展开状态 (键为一级菜单ID，值为布尔) ---
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  /**
   * 从后端异步请求并加载菜单数据
   */
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
    loadMenus();
  }, []);

  /**
   * 判断菜单项的跳转路径是否在当前浏览器路由高亮状态下
   */
  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  /**
   * 路由感知：当菜单加载完毕，或浏览器路径改变时，自动将包含高亮二级菜单的一级菜单展开
   */
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
        setOpenMenus(initialOpen);
      }
    }
  }, [menuItems, pathname]);

  /**
   * 切换一级折叠菜单的开闭
   */
  const toggleMenu = (id: number) => {
    if (collapsed) {
      // 当侧边栏在收缩状态时，点击图标应该先展开侧边栏，并直接打开该菜单夹
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
        "flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen sticky top-0 transition-all duration-200 select-none z-30",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* 顶层 Logo 标志区 */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-primary whitespace-nowrap tracking-wide animate-[fadeIn_0.2s_ease-out]">
            可梵后台
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors ml-auto cursor-pointer"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 核心菜单列表区 */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 flex flex-col gap-0.5">
        {/* 1. 加载中状态 */}
        {loading && (
          <div className="space-y-3.5 px-2.5 py-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                {!collapsed && <div className="h-4 bg-zinc-100 dark:bg-zinc-800/40 rounded w-2/3" />}
              </div>
            ))}
          </div>
        )}

        {/* 2. 加载异常失败状态 */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-2 text-center gap-2">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">菜单加载失败</span>
                <button
                  onClick={loadMenus}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mt-0.5"
                >
                  <RefreshCw size={10} className="animate-spin-slow" />
                  点击重试
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. 数据为空状态 */}
        {!loading && !error && menuItems.length === 0 && (
          <div className="text-center py-16 text-xs text-zinc-400">
            {!collapsed && <span className="animate-[fadeIn_0.2s_ease-out]">暂无可用菜单项</span>}
          </div>
        )}

        {/* 4. 正常多级数据渲染列表 */}
        {!loading && !error && menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const IconComp = getIconComponent(item.icon);

          // 含有二级子菜单的一级菜单项
          if (hasChildren) {
            const isOpen = !!openMenus[item.id];
            const isChildActive = item.children.some((child) => isActive(child.linkUrl));

            return (
              <div key={item.id} className="flex flex-col w-full">
                {/* 一级菜单组折叠按钮 */}
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left focus:outline-none",
                    isChildActive
                      ? "bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-950 dark:text-zinc-100 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <IconComp size={19} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                    {!collapsed && (
                      <span className="whitespace-nowrap truncate tracking-wide animate-[fadeIn_0.15s_ease-out]">
                        {item.title}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-zinc-400 transition-transform duration-200 shrink-0",
                        isOpen ? "transform rotate-180" : ""
                      )}
                    />
                  )}
                </button>

                {/* 展开的二级子菜单面板 (pl-6 缩进排版，加入微弱连接虚线) */}
                {!collapsed && isOpen && (
                  <div className="flex flex-col pl-6 mt-0.5 border-l border-zinc-100 dark:border-zinc-800 ml-[21px] space-y-0.5 animate-[fadeIn_0.15s_ease-out]">
                    {item.children.map((child) => {
                      const childActive = isActive(child.linkUrl);
                      const ChildIcon = getIconComponent(child.icon);
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            if (child.linkUrl) {
                              router.push(child.linkUrl);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-150 cursor-pointer text-left focus:outline-none",
                            childActive
                              ? "bg-primary/10 text-primary font-semibold shadow-xs"
                              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-950 dark:hover:text-zinc-100"
                          )}
                        >
                          <ChildIcon size={14} className="shrink-0 text-zinc-400" />
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

          // 不含子菜单的普通一级菜单项
          const active = isActive(item.linkUrl);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.linkUrl) {
                  router.push(item.linkUrl);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left focus:outline-none",
                active
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100"
              )}
              title={collapsed ? item.title : undefined}
            >
              <IconComp size={19} className="shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap truncate tracking-wide animate-[fadeIn_0.15s_ease-out]">
                  {item.title}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部版权栏 */}
      {!collapsed && (
        <div className="px-4 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 text-left">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">Butvan Blog 2.0</p>
        </div>
      )}
    </aside>
  );
}
