"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  NavigationItem,
  NavigationSaveDTO,
  NavLinkType,
  NavPosition,
} from "@/types/navigation";
import { NAV_LINK_TYPE_LABELS, NAV_POSITION_LABELS } from "@/types/navigation";

/**
 * 导航表单弹窗组件
 * - 支持创建根菜单 / 子菜单 / 编辑已有菜单
 * - 表单验证、链接类型条件字段
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
  const [sortOrder, setSortOrder] = useState("0");
  const [isVisible, setIsVisible] = useState(true);
  const [isOpenNewTab, setIsOpenNewTab] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        } else {
          setTitle("");
          setLinkType("NONE");
          setLinkTargetId("");
          setLinkUrl("");
          setIcon("");
          setSortOrder("0");
          setIsVisible(true);
          setIsOpenNewTab(false);
        }
        setError(null);
      }, 0);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("菜单标题不能为空");
      return;
    }

    if (linkType === "EXTERNAL" && !linkUrl.trim()) {
      setError("外部链接类型必须填写链接地址");
      return;
    }

    const dto: NavigationSaveDTO = {
      title: title.trim(),
      parentId: parentId ?? initialData?.parentId ?? null,
      linkType,
      linkTargetId: linkTargetId ? Number(linkTargetId) : undefined,
      linkUrl: linkUrl.trim() || undefined,
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
            <X size={18} />
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

          {/* 外部链接 URL（仅 EXTERNAL 类型时显示） */}
          {linkType === "EXTERNAL" && (
            <div className="animate-fade-in">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                链接地址 <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>
          )}

          {/* 关联目标 ID（PAGE/CATEGORY/ARTICLE 类型时显示） */}
          {["PAGE", "CATEGORY", "ARTICLE"].includes(linkType) && (
            <div className="animate-fade-in">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                关联目标 ID
              </label>
              <input
                type="number"
                value={linkTargetId}
                onChange={(e) => setLinkTargetId(e.target.value)}
                placeholder="输入对应页面/分类/文章的 ID"
                className={inputClass}
              />
            </div>
          )}

          {/* 图标 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              图标名称
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="例如：LayoutDashboard（Lucide 图标键名）"
              className={inputClass}
            />
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
  );
}
