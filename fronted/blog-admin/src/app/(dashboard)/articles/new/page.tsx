"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
