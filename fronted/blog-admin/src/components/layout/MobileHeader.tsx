"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
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
  "/likes": "点赞管理",
};

/**
 * 根据当前 pathname 匹配对应的中文标题
 */
const getPageTitle = (pathname: string): string => {
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
 * 移动端专属头部导航栏
 * - 高度紧致 h-[52px]，减少垂直空间占用
 * - 左侧：VB Logo 触发左侧菜单滑动
 * - 中间：当前页面中文标题，极佳的认知导航
 * - 右侧：汉堡按钮触发右侧操作盘滑动
 */
export default function MobileHeader({ onToggleLeft, onToggleRight }: MobileHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-[52px] items-center justify-between px-4 z-20 select-none shrink-0 glass-panel rounded-xl">
      {/* 左侧：微缩 VB Logo 标志区，点击展开左侧滑菜单 */}
      <button
        onClick={onToggleLeft}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-[11px] font-heading font-extrabold shadow-sm active:scale-95 transition-transform cursor-pointer"
        aria-label="展开导航菜单"
      >
        VB
      </button>

      {/* 中间：当前页面标题 */}
      <span className="font-heading font-bold text-sm text-zinc-800 dark:text-zinc-200 tracking-wide">
        {pageTitle}
      </span>

      {/* 右侧：设置/操作汉堡菜单，点击展开右侧操作抽屉 */}
      <button
        onClick={onToggleRight}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors active:scale-95 cursor-pointer"
        aria-label="展开操作面板"
      >
        <Menu size={18} />
      </button>
    </header>
  );
}
