/**
 * 导航菜单数据类型定义
 */
export interface NavigationItem {
  id: number;
  title: string;
  parentId?: number;
  linkType: "PAGE" | "CATEGORY" | "ARTICLE" | "EXTERNAL" | "INTERNAL" | "NONE";
  linkTargetId?: number;
  linkUrl?: string;
  icon?: string; // 图标键名，例如 'LayoutDashboard'
  position: string;
  sortOrder: number;
  isOpenNewTab: boolean;
  children: NavigationItem[];
}
