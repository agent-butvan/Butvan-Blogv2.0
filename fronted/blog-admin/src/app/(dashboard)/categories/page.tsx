"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Loader2, X, AlertCircle, Eye, EyeOff, FolderTree } from "lucide-react";
import { cn } from "@heroui/react";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/article-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";
import type { CategoryItem } from "@/types/article";

/**
 * 分类管理工作台
 * - 紧凑型大厂表格排版，极低留白，数据高度密集
 * - 支持展示父子分类层级关联，行内可见性状态 Switch 切换
 * - 内置新增、编辑弹窗及删除安全约束校验
 */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 弹窗与提交状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "" as string | number,
    icon: "",
    sortOrder: 0,
    isVisible: true,
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 删除确认状态
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /** 加载分类列表 */
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("加载分类列表失败:", err);
      toast.error("加载分类列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /** 过滤出顶级分类列表，用作父分类下拉框选择 (防止多层级过度嵌套，最多支持两级) */
  const parentOptions = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  /** 根据父 ID 获取分类名称 */
  const getParentName = (parentId?: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "未知分类";
  };

  /** 打开新建弹窗 */
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      slug: "",
      parentId: "",
      icon: "",
      sortOrder: 0,
      isVisible: true,
      description: "",
    });
    setFormError(null);
    setModalType("create");
    setModalOpen(true);
  };

  /** 打开编辑弹窗 */
  const handleOpenEdit = (cat: CategoryItem) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? "",
      icon: cat.icon ?? "",
      sortOrder: cat.sortOrder || 0,
      isVisible: cat.isVisible,
      description: cat.description ?? "",
    });
    setFormError(null);
    setEditingCategory(cat);
    setModalType("edit");
    setModalOpen(true);
  };

  /** 切换行内可见性 */
  const handleToggleVisible = async (cat: CategoryItem) => {
    try {
      const updatedVisible = !cat.isVisible;
      await updateCategory(cat.id, {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isVisible: updatedVisible,
        description: cat.description,
      });
      toast.success(`${cat.name} 已${updatedVisible ? "在前台显示" : "在前台隐藏"}`);
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || "更新状态失败");
    }
  };

  /** 提交保存事件 */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, slug, parentId, icon, sortOrder, isVisible, description } = formData;
    if (!name.trim()) {
      setFormError("请输入分类名称");
      return;
    }
    if (!slug.trim()) {
      setFormError("请输入唯一标识(Slug)");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload: Partial<CategoryItem> = {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId ? Number(parentId) : null,
        icon: icon.trim() || null as any,
        sortOrder: Number(sortOrder) || 0,
        isVisible,
        description: description.trim() || null as any,
      };

      if (modalType === "create") {
        await createCategory(payload);
        toast.success("创建分类成功");
      } else if (modalType === "edit" && editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success("更新分类成功");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      console.error("保存分类失败:", err);
      setFormError(err.message || "操作失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  /** 触发删除确认 */
  const handleDeleteRequest = (id: number) => {
    setConfirmDeleteId(id);
  };

  /** 确认执行删除 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(confirmDeleteId);
      toast.success("删除分类成功");
      setConfirmDeleteId(null);
      loadCategories();
    } catch (err: any) {
      console.error("删除分类失败:", err);
      toast.error(err.message || "删除分类失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">分类管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / CATEGORIES (共 {categories.length} 个分类)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>新建分类</span>
        </button>
      </div>

      {/* 分类表格展示 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[800px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-5 py-3 w-16 text-center">ID</th>
              <th className="px-5 py-3 w-16 text-center">排序</th>
              <th className="px-5 py-3 w-16 text-center">图标</th>
              <th className="px-5 py-3">分类名称</th>
              <th className="px-5 py-3">唯一标识 (Slug)</th>
              <th className="px-5 py-3 w-32">父级分类</th>
              <th className="px-5 py-3 w-24 text-center">可见状态</th>
              <th className="px-5 py-3 w-24 text-center">文章总数</th>
              <th className="px-5 py-3 w-28 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={18} className="animate-spin text-zinc-300 dark:text-zinc-600" />
                    <span className="text-[11px] font-medium tracking-wide">加载分类列表中...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-zinc-400 select-none">
                  <span className="text-[11px]">暂无分类，开始</span>
                  <button onClick={handleOpenCreate} className="text-primary font-bold hover:underline mx-1">创建第一个分类</button>
                  <span className="text-[11px]">吧！</span>
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const parentName = getParentName(cat.parentId);
                return (
                  <tr
                    key={cat.id}
                    className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150"
                  >
                    <td className="px-5 py-3 text-center font-mono text-zinc-400">{cat.id}</td>
                    <td className="px-5 py-3 text-center font-mono font-bold text-zinc-500 dark:text-zinc-450">{cat.sortOrder}</td>
                    <td className="px-5 py-3 text-center font-bold text-base select-none">
                      {cat.icon ? (
                        <span title={`CSS/Emoji: ${cat.icon}`}>{cat.icon}</span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 font-mono">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {cat.parentId && (
                          <span className="text-zinc-350 dark:text-zinc-600 select-none font-mono">└─</span>
                        )}
                        <span className="font-semibold text-neutral-dark dark:text-zinc-150 leading-tight">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/40 rounded px-1.5 py-0.5">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {parentName ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-[#b0a2ff] border border-primary/20 dark:border-primary/10 bg-primary/5 px-2 py-0.5 rounded-lg select-none">
                          <FolderTree size={10} />
                          {parentName}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500 select-none">顶级分类</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggleVisible(cat)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors cursor-pointer"
                        title={cat.isVisible ? "点击切换为【隐藏】" : "点击切换为【前台显示】"}
                      >
                        {cat.isVisible ? (
                          <Eye size={13} className="text-emerald-500" />
                        ) : (
                          <EyeOff size={13} className="text-zinc-400 dark:text-zinc-650" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center font-mono font-medium">
                      <span className={cn(
                        "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                        cat.articleCount > 0 
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#b0a2ff]"
                          : "bg-zinc-100 text-zinc-450 dark:bg-zinc-850 dark:text-zinc-500"
                      )}>
                        {cat.articleCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 w-28">
                      <div className="flex items-center justify-end gap-1 select-none">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer outline-none border-0"
                          title="编辑分类"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(cat.id)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all cursor-pointer outline-none border-0"
                          title="删除分类"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑分类 Modal */}
      {modalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-xs animate-fade-in"
              onClick={() => !submitting && setModalOpen(false)}
            />

            {/* 弹窗面板 */}
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 shadow-xl animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-heading text-base font-bold text-neutral-dark dark:text-zinc-150">
                    {modalType === "create" ? "新建分类" : "编辑分类"}
                  </h3>
                  <button
                    disabled={submitting}
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                  {/* 分类名称 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      分类名称
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="例如: 技术分享"
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      唯一标识 (Slug)
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                      placeholder="例如: tech"
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    />
                  </div>

                  {/* 父级分类 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      父级分类 (可选)
                    </label>
                    <select
                      disabled={submitting}
                      value={formData.parentId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="">-- 无 (作为顶级分类) --</option>
                      {parentOptions
                        // 排除自己以防止死循环父子嵌套
                        .filter((p) => !editingCategory || p.id !== editingCategory.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 分类图标与排序 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                        CSS/Emoji 图标
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.icon}
                        onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                        placeholder="例如: 💻"
                        className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                        排序权重
                      </label>
                      <input
                        type="number"
                        disabled={submitting}
                        value={formData.sortOrder}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* 是否导航展示 */}
                  <div className="flex items-center justify-between py-1 px-1.5 border border-zinc-100 dark:border-zinc-850 rounded-xl">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">前台导航可见性</span>
                    <input
                      type="checkbox"
                      disabled={submitting}
                      checked={formData.isVisible}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isVisible: e.target.checked }))}
                      className="w-4 h-4 text-primary focus:ring-primary/20 border-zinc-300 rounded cursor-pointer accent-primary"
                    />
                  </div>

                  {/* 描述说明 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      描述介绍
                    </label>
                    <textarea
                      disabled={submitting}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="分类的简单描述..."
                      rows={2}
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  {/* 校验错误 */}
                  {formError && (
                    <div className="flex items-start gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 p-3 text-[11px] font-medium text-red-700 dark:text-red-400 leading-snug">
                      <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 底部保存与取消 */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setModalOpen(false)}
                      className="flex-1 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {submitting && <Loader2 size={13} className="animate-spin" />}
                      <span>保存</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 删除确认 Modal */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="确认删除分类"
        description="确定要删除这个分类吗？该分类必须没有子分类且没有关联文章，否则删除会被系统拦截。"
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
