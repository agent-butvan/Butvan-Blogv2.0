"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "@/components/forms/ArticleForm";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ArticleSaveDTO, ArticleDetail } from "@/types/article";

/**
 * 新建文章页面
 * - 移除了多余大标题，升级为顶部极简面包屑控制条
 * - 扩宽最大宽度至 max-w-6xl 以适配左正文右参数的双栏布局
 */
export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (data: ArticleSaveDTO) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post<ApiResponse<ArticleDetail>>("/articles", data);
      const created = res.data?.data;

      const msg =
        data.status === "PUBLISHED" ? "文章已发布！正在跳转编辑页..." : "草稿已保存！正在跳转编辑页...";
      setSuccessMsg(msg);

      // 短暂延迟后跳转，让用户看到成功提示
      setTimeout(() => {
        if (created?.id) {
          router.push(`/articles/${created.id}`);
        } else {
          router.push("/articles");
        }
      }, 600);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr?.response?.data?.msg || "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部极简导航 */}
      <div className="flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-850 pb-4 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/articles")}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>返回列表</span>
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <h1 className="font-heading text-sm font-bold text-neutral-dark dark:text-zinc-200">
            撰写新文章
          </h1>
        </div>
      </div>

      {/* 提示信息 */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/35 p-4 text-xs font-medium text-red-700 dark:text-red-400 animate-fade-in">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/35 p-4 text-xs font-medium text-green-700 dark:text-green-400 animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* 双栏表单 */}
      <ArticleForm onSave={handleSave} saving={saving} />
    </div>
  );
}
