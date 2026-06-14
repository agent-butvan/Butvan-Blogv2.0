"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm from "@/components/forms/ArticleForm";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ArticleDetail, ArticleSaveDTO } from "@/types/article";
import { ArrowLeft, Loader2 } from "lucide-react";

/**
 * 编辑文章页面
 * - 加载已有文章数据
 * - 复用 ArticleForm 表单
 * - 保存更新
 */
export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 加载文章数据
  useEffect(() => {
    apiClient
      .get<ApiResponse<ArticleDetail>>(`/articles/${id}`)
      .then((res) => {
        if (res.data?.data) setArticle(res.data.data);
        else setError("文章不存在");
      })
      .catch(() => setError("加载文章数据失败"))
      .finally(() => setLoading(false));
  }, [id]);

  // 保存更新
  const handleSave = async (data: ArticleSaveDTO) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.put<ApiResponse<ArticleDetail>>(`/articles/${id}`, data);
      setSuccessMsg(data.status === "PUBLISHED" ? "文章已更新并发布！" : "文章已更新！");
      // 更新本地缓存
      setArticle((prev) =>
        prev ? { ...prev, ...data } : null
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr?.response?.data?.msg || "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-zinc-300" />
      </div>
    );
  }

  // 加载失败
  if (error && !article) {
    return (
      <div className="max-w-4xl mx-auto text-center py-32">
        <p className="text-zinc-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/articles")}
          className="text-primary hover:underline text-sm"
        >
          返回文章列表
        </button>
      </div>
    );
  }

  const initialData: ArticleSaveDTO = {
    title: article?.title || "",
    slug: article?.slug,
    summary: article?.summary,
    content: article?.content || "",
    coverImageUrl: article?.coverImageUrl,
    categoryId: article?.categoryId,
    tagIds: article?.tagIds,
    status: article?.status || "DRAFT",
    visibility: article?.visibility,
    seoTitle: article?.seoTitle,
    seoDescription: article?.seoDescription,
    seoKeywords: article?.seoKeywords,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/articles")}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft size={16} /> 返回列表
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-neutral-dark">
              编辑文章
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              ID: {id} · 状态: {article?.status === "PUBLISHED" ? "已发布" : "草稿"}
            </p>
          </div>
        </div>
      </div>

      {/* 操作提示 */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* 表单 */}
      <ArticleForm initialData={initialData} onSave={handleSave} saving={saving} />
    </div>
  );
}
