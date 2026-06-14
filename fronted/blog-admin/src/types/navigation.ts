/**
 * 导航菜单相关类型定义
 */

/** 导航菜单树节点 */
export interface NavigationItem {
  id: number;
  title: string;
  parentId?: number | null;
  linkType: NavLinkType;
  linkTargetId?: number | null;
  linkUrl?: string;
  icon?: string;
  position: string;
  sortOrder: number;
  isVisible?: boolean; // 公开端点可能不含此字段，API 层会补齐默认值 true
  isOpenNewTab: boolean;
  children: NavigationItem[];
}

/** 链接类型 */
export type NavLinkType = "PAGE" | "CATEGORY" | "ARTICLE" | "EXTERNAL" | "NONE";

/** 菜单位置 */
export type NavPosition = "HEADER" | "FOOTER" | "SIDEBAR" | "ADMIN_SIDEBAR";

/** 链接类型显示标签 */
export const NAV_LINK_TYPE_LABELS: Record<NavLinkType, string> = {
  PAGE: "独立页面",
  CATEGORY: "分类",
  ARTICLE: "文章",
  EXTERNAL: "外部链接",
  NONE: "无链接（仅作分组）",
};

/** 菜单位置显示标签 */
export const NAV_POSITION_LABELS: Record<NavPosition, string> = {
  HEADER: "前台顶部导航",
  FOOTER: "前台底部导航",
  SIDEBAR: "前台侧边栏",
  ADMIN_SIDEBAR: "管理后台侧边栏",
};

/** 导航菜单创建/编辑请求体 */
export interface NavigationSaveDTO {
  title: string;
  parentId?: number | null;
  linkType: NavLinkType;
  linkTargetId?: number | null;
  linkUrl?: string;
  icon?: string;
  position: NavPosition;
  sortOrder?: number;
  isVisible?: boolean;
  isOpenNewTab?: boolean;
}
