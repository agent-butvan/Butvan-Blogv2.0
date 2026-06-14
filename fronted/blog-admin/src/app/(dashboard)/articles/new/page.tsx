"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleForm from "@/components/forms/ArticleForm";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ArticleSaveDTO, ArticleDetail } from "@/types/article";

/**
 * 新建文章页面
 * - 使用 ArticleForm 表单组件
 * - 保存草稿 / 直接发布
 * - 创建成功后跳转到编辑页
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-neutral-dark">写文章</h1>
        <p className="text-sm text-zinc-500 mt-1">使用 Markdown 撰写，左栏编辑右栏实时预览</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 animate-fade-in">
          {successMsg}
        </div>
      )}

      <ArticleForm onSave={handleSave} saving={saving} />
    </div>
  );
}
