"use client";

import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Select, ListBox, ListBoxItem } from "@heroui/react";
import Portal from "../common/Portal";
import type {
  NavigationItem,
  NavigationSaveDTO,
  NavLinkType,
  NavPosition,
} from "@/types/navigation";
import { NAV_LINK_TYPE_LABELS, NAV_POSITION_LABELS } from "@/types/navigation";
import { fetchClientRoutes } from "@/lib/client-route-api";
import type { ClientRoute } from "@/types/route";

// 预定义的常用 Lucide 导航图标选项列表
const POPULAR_ICONS = [
  { value: "", label: "无图标" },
  { value: "Home", label: "控制台 / 首页" },
  { value: "BookOpen", label: "文章列表 / 写作" },
  { value: "FolderOpen", label: "分类管理" },
  { value: "Tag", label: "标签管理" },
  { value: "MessageSquare", label: "评论管理" },
  { value: "HardDrive", label: "资源管理" },
  { value: "Image", label: "媒体内容" },
  { value: "Wallpaper", label: "场景空间 / 热区" },
  { value: "Settings", label: "系统设置" },
  { value: "Compass", label: "导航配置" },
  { value: "User", label: "个人中心" },
  { value: "UserCheck", label: "个人资料" },
  { value: "Heart", label: "点赞记录" },
  { value: "Sparkles", label: "特效 / 推荐" },
  { value: "Bell", label: "通知中心" },
  { value: "Layers3", label: "标签页签 / 多图层" },
  { value: "Link", label: "外部链接" },
  { value: "Mail", label: "订阅管理" },
  { value: "Lock", label: "安全认证 / 密码" },
  { value: "FileText", label: "单页管理" },
  { value: "HelpCircle", label: "帮助说明" }
];

/**
 * 导航表单弹窗组件
 * - 支持创建根菜单 / 子菜单 / 编辑已有菜单
 * - 表单验证、链接类型条件字段
 * - 图标选择支持常用 Lucide 图标下拉列表选择，并提供实时预览，同时保留自定义输入文本输入框
 */
export default function NavigationFormModal({
  open,
  onClose,
  onSave,
  saving,
  initialData,
  parentId,
  position,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (dto: NavigationSaveDTO) => Promise<void>;
  saving: boolean;
  initialData?: NavigationItem | null;
  parentId?: number | null;
  position: NavPosition;
}) {
  const isEdit = !!initialData;

  const [title, setTitle] = useState("");
  const [linkType, setLinkType] = useState<NavLinkType>("NONE");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [isCustomIcon, setIsCustomIcon] = useState(false); // 标记是否使用自定义文本输入图标名称
  const [sortOrder, setSortOrder] = useState("0");
  const [isVisible, setIsVisible] = useState(true);
  const [isOpenNewTab, setIsOpenNewTab] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientRoutes, setClientRoutes] = useState<ClientRoute[]>([]);

  // 加载客户端路由列表
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routes = await fetchClientRoutes()
        setClientRoutes(routes)
      } catch (err) {
        console.error('加载路由失败:', err)
      }
    }
    loadRoutes()
  }, [])

  // 弹窗打开时重置表单
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (initialData) {
          setTitle(initialData.title);
          setLinkType(initialData.linkType as NavLinkType);
          setLinkTargetId(initialData.linkTargetId?.toString() || "");
          setLinkUrl(initialData.linkUrl || "");
          setIcon(initialData.icon || "");
          setSortOrder(initialData.sortOrder.toString());
          setIsVisible(initialData.isVisible ?? true);
          setIsOpenNewTab(initialData.isOpenNewTab ?? false);
          
          // 判断初始图标是否在常用列表中，若非空且不在常用列表里，自动切换到自定义输入框模式
          const isCommon = POPULAR_ICONS.some(opt => opt.value === initialData.icon);
          setIsCustomIcon(initialData.icon ? !isCommon : false);
        } else {
          setTitle("");
          setLinkType("NONE");
          setLinkTargetId("");
          setLinkUrl("");
          setIcon("");
          setSortOrder("0");
          setIsVisible(true);
          setIsOpenNewTab(false);
          setIsCustomIcon(false);
        }
        setError(null);
      }, 0);
    }
  }, [open, initialData]);

  // 渲染图标预览，安全返回 LucideIcon 组件，防止异常键名崩溃
  const renderIconPreview = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (Icons as Record<string, unknown>)[iconName] as React.ComponentType<{ size?: number; className?: string }>;
    if (IconComponent) {
      return <IconComponent size={16} className="text-primary dark:text-[#b0a2ff]" />;
    }
    return <Icons.HelpCircle size={16} className="text-zinc-400" />;
  };

  const currentIconLabel = (() => {
    if (isCustomIcon) return `自定义图标 (${icon})`;
    const matched = POPULAR_ICONS.find((opt) => opt.value === icon);
    return matched ? matched.label : "无图标";
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("菜单标题不能为空");
      return;
    }

    const isLinkRequired = linkType === "EXTERNAL" || (position === "ADMIN_SIDEBAR" && linkType !== "NONE");
    if (isLinkRequired && !linkUrl.trim()) {
      setError("链接地址不能为空");
      return;
    }

    const dto: NavigationSaveDTO = {
      title: title.trim(),
      parentId: parentId ?? initialData?.parentId ?? null,
      linkType,
      // PAGE 类型：使用 linkUrl 存储路径（如 /friend）
      // CATEGORY/ARTICLE 类型：使用 linkTargetId 存数字 ID
      // EXTERNAL 类型：使用 linkUrl 存外部链接
      linkTargetId: (linkType === "CATEGORY" || linkType === "ARTICLE") && linkTargetId ? Number(linkTargetId) : undefined,
      linkUrl: (linkType === "PAGE" || linkType === "EXTERNAL") ? (linkUrl.trim() || undefined) : undefined,
      icon: icon.trim() || undefined,
      position,
      sortOrder: Number(sortOrder) || 0,
      isVisible,
      isOpenNewTab,
    };

    try {
      await onSave(dto);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr?.response?.data?.msg || "保存失败，请重试");
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-150 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors";

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 弹窗内容 */}
        <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-950 border border-transparent dark:border-zinc-800 shadow-xl animate-slide-up">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-heading text-lg font-semibold text-neutral-dark dark:text-zinc-100">
              {isEdit ? "编辑菜单项" : parentId ? "添加子菜单" : "添加根菜单"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-4 py-3 text-xs text-red-700 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* 位置（只读展示） */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                菜单位置
              </label>
              <input
                type="text"
                value={NAV_POSITION_LABELS[position]}
                disabled
                className={`${inputClass} bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed`}
              />
            </div>

            {/* 父级（若存在则只读展示） */}
            {parentId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  父级菜单 ID
                </label>
                <input
                  type="text"
                  value={parentId}
                  disabled
                  className={`${inputClass} bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed font-mono`}
                />
              </div>
            )}

            {/* 标题 */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                菜单标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：关于我"
                required
                className={inputClass}
              />
            </div>

            {/* 链接类型 */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                链接类型
              </label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as NavLinkType)}
                className={inputClass}
              >
                {(Object.keys(NAV_LINK_TYPE_LABELS) as NavLinkType[]).map(
                  (key) => (
                    <option key={key} value={key} className="bg-white dark:bg-zinc-900">
                      {NAV_LINK_TYPE_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 链接地址（EXTERNAL 类型，或管理端下非 NONE 类型时显示） */}
            {(linkType === "EXTERNAL" || (position === "ADMIN_SIDEBAR" && linkType !== "NONE")) && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  链接地址 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={position === "ADMIN_SIDEBAR" ? "输入路由路径，例如：/ 或 /articles" : "https://example.com"}
                  className={inputClass}
                />
              </div>
            )}

            {/* 关联目标（PAGE 类型时显示页面下拉框，CATEGORY/ARTICLE 类型时显示 ID 输入） */}
            {linkType === "PAGE" && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  选择页面
                </label>
                <select
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择页面</option>
                  {clientRoutes
                    .filter(route => !route.dynamic)
                    .map(route => (
                      <option key={route.path} value={route.path}>
                        {route.label} ({route.path})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {linkType === "CATEGORY" && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  分类 ID
                </label>
                <input
                  type="number"
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  placeholder="输入分类 ID"
                  className={inputClass}
                />
              </div>
            )}

            {linkType === "ARTICLE" && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  文章 ID
                </label>
                <input
                  type="number"
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  placeholder="输入文章 ID"
                  className={inputClass}
                />
              </div>
            )}

            {/* 图标（下拉选择，支持自定义切换与实时预览） */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                菜单图标
              </label>
              {!isCustomIcon ? (
                <div className="flex gap-2 w-full">
                  <Select
                    aria-label="菜单图标"
                    selectedKey={icon || "NONE"}
                    onSelectionChange={(key) => {
                      const val = key as string;
                      if (val === "CUSTOM_INPUT") {
                        setIsCustomIcon(true);
                      } else if (val === "NONE" || val === "") {
                        setIcon("");
                      } else {
                        setIcon(val);
                      }
                    }}
                    className="w-full relative"
                  >
                    <Select.Trigger className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg h-9 px-3 min-h-9 flex items-center justify-between text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer text-zinc-900 dark:text-zinc-150 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                      <div className="flex items-center gap-2">
                        {icon ? (
                          renderIconPreview(icon)
                        ) : (
                          <Icons.Minus size={16} className="text-zinc-450 dark:text-zinc-550" />
                        )}
                        <span className="text-sm text-zinc-900 dark:text-zinc-150 font-normal">
                          {currentIconLabel}
                        </span>
                      </div>
                      <Select.Indicator className="text-zinc-400 dark:text-zinc-500" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg shadow-xl min-w-[200px] z-[60] py-1 max-h-[300px] overflow-y-auto">
                      <ListBox className="py-1 outline-none">
                        {POPULAR_ICONS.map((opt) => {
                          const key = opt.value || "NONE";
                          return (
                            <ListBoxItem
                              key={key}
                              id={key}
                              textValue={opt.label}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer outline-none transition-colors rounded-md mx-1 data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-900"
                            >
                              <div className="flex items-center gap-2 w-full">
                                {opt.value ? (
                                  renderIconPreview(opt.value)
                                ) : (
                                  <Icons.Minus size={16} className="text-zinc-450 dark:text-zinc-550" />
                                )}
                                <span className="text-sm font-normal text-zinc-700 dark:text-zinc-300">
                                  {opt.label} {opt.value ? `(${opt.value})` : ""}
                                </span>
                              </div>
                            </ListBoxItem>
                          );
                        })}
                        <ListBoxItem
                          key="CUSTOM_INPUT"
                          id="CUSTOM_INPUT"
                          textValue="自定义图标名称"
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer outline-none border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-2 transition-colors rounded-md mx-1 data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-900"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Icons.Edit3 size={16} className="text-zinc-450 dark:text-zinc-550" />
                            <span className="font-medium text-primary dark:text-[#b0a2ff]">
                              ✏️ 自定义图标名称...
                            </span>
                          </div>
                        </ListBoxItem>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2 animate-fade-in">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="输入 Lucide 图标键名，例如: Smile"
                    className={inputClass}
                  />
                  {icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350">
                      {renderIconPreview(icon)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomIcon(false);
                      setIcon("");
                    }}
                    className="h-9 px-3 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer"
                  >
                    返回选择
                  </button>
                </div>
              )}
            </div>

            {/* 排序 + 可见性 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  排序权重
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">可见</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpenNewTab}
                    onChange={(e) => setIsOpenNewTab(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">新窗口</span>
                </label>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "保存中..." : isEdit ? "保存修改" : "创建菜单"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
