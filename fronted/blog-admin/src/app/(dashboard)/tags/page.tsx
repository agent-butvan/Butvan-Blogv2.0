"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { cn } from "@heroui/react";
import { fetchTagsList, createTag, updateTag, deleteTag } from "@/lib/article-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";
import type { TagItem } from "@/types/article";

/**
 * 标签管理工作台
 * - 紧密排版，高利用率，拒绝卡片化和冗余留白
 * - 顶栏模糊检索，行内点击编辑与删除
 * - 完备的错误边界捕捉与 Toast 消息通知
 */
export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // 弹窗与异步提交状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 删除确认状态
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /** 获取全部标签列表 */
  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await fetchTagsList();
      setTags(data);
    } catch (err) {
      console.error("加载标签列表失败:", err);
      toast.error("加载标签列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  /** 模糊检索过滤后的标签列表 */
  const filteredTags = useMemo(() => {
    if (!keyword.trim()) return tags;
    const lower = keyword.toLowerCase();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(lower) || t.slug.toLowerCase().includes(lower)
    );
  }, [tags, keyword]);

  /** 打开新建标签弹窗 */
  const handleOpenCreate = () => {
    setFormData({ name: "", slug: "" });
    setFormError(null);
    setModalType("create");
    setModalOpen(true);
  };

  /** 打开编辑标签弹窗 */
  const handleOpenEdit = (tag: TagItem) => {
    setFormData({ name: tag.name, slug: tag.slug });
    setFormError(null);
    setEditingTag(tag);
    setModalType("edit");
    setModalOpen(true);
  };

  /** 表单提交事件处理 */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, slug } = formData;
    if (!name.trim()) {
      setFormError("请输入标签名称");
      return;
    }
    if (!slug.trim()) {
      setFormError("请输入标签标识(Slug)");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (modalType === "create") {
        await createTag({ name: name.trim(), slug: slug.trim() });
        toast.success("创建标签成功");
      } else if (modalType === "edit" && editingTag) {
        await updateTag(editingTag.id, { name: name.trim(), slug: slug.trim() });
        toast.success("更新标签成功");
      }
      setModalOpen(false);
      loadTags();
    } catch (err: any) {
      console.error("保存标签失败:", err);
      setFormError(err.message || "操作失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  /** 触发删除请求 */
  const handleDeleteRequest = (id: number) => {
    setConfirmDeleteId(id);
  };

  /** 确认删除标签 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteTag(confirmDeleteId);
      toast.success("删除标签成功");
      setConfirmDeleteId(null);
      loadTags();
    } catch (err: any) {
      console.error("删除标签失败:", err);
      // 后端有文章关联时，此处会自动返回 500 级具体提示
      toast.error(err.message || "删除标签失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">标签管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / TAGS (共 {tags.length} 个标签)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>新建标签</span>
        </button>
      </div>

      {/* 模糊检索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 flex-1 max-w-xs transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          <Search size={14} className="text-zinc-400 dark:text-zinc-550 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索标签名称或标识..."
            className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-800 dark:text-zinc-100 outline-none placeholder-zinc-400 dark:placeholder-zinc-650 focus:ring-0 leading-normal"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 标签表格 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[600px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-5 py-3 w-16 text-center">ID</th>
              <th className="px-5 py-3">标签名称</th>
              <th className="px-5 py-3">唯一标识 (Slug)</th>
              <th className="px-5 py-3 w-36 text-center">关联文章数</th>
              <th className="px-5 py-3 w-28 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={18} className="animate-spin text-zinc-300 dark:text-zinc-600" />
                    <span className="text-[11px] font-medium tracking-wide">加载标签列表中...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-zinc-400 select-none">
                  <span className="text-[11px]">暂无标签，开始</span>
                  <button onClick={handleOpenCreate} className="text-primary font-bold hover:underline mx-1">创建第一个标签</button>
                  <span className="text-[11px]">吧！</span>
                </td>
              </tr>
            ) : (
              filteredTags.map((tag) => (
                <tr
                  key={tag.id}
                  className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150"
                >
                  <td className="px-5 py-3 text-center font-mono text-zinc-400">{tag.id}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-neutral-dark dark:text-zinc-150 leading-tight">
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/40 rounded px-1.5 py-0.5">
                      {tag.slug}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-mono font-medium">
                    <span className={cn(
                      "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                      tag.articleCount > 0 
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#b0a2ff]"
                        : "bg-zinc-100 text-zinc-450 dark:bg-zinc-850 dark:text-zinc-500"
                    )}>
                      {tag.articleCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 w-28">
                    <div className="flex items-center justify-end gap-1 select-none">
                      <button
                        onClick={() => handleOpenEdit(tag)}
                        className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer outline-none border-0"
                        title="编辑标签"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(tag.id)}
                        className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all cursor-pointer outline-none border-0"
                        title="删除标签"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑标签 Modal */}
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
                    {modalType === "create" ? "新建标签" : "编辑标签"}
                  </h3>
                  <button
                    disabled={submitting}
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                  {/* 标签名称 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      标签名称
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="例如: React"
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      唯一标识 (Slug)
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                      placeholder="例如: react"
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    />
                  </div>

                  {/* 校验错误提示 */}
                  {formError && (
                    <div className="flex items-start gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 p-3 text-[11px] font-medium text-red-700 dark:text-red-400 leading-snug">
                      <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 底栏按钮 */}
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

      {/* 删除二次确认 Modal */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="确认删除标签"
        description="确定要删除这个标签吗？如果该标签已被文章关联使用，系统将会由于约束而拒绝删除。"
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
