"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import ArticleForm from "@/components/forms/ArticleForm";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ArticleDetail, ArticleSaveDTO } from "@/types/article";
import { ArrowLeft, Loader2 } from "lucide-react";

/**
 * 编辑文章页面
 * - 简化顶部返回控制条并嵌入文章状态小徽标
 * - 拓宽布局最大宽度为 max-w-6xl 适配双栏形态
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
      <div className="flex items-center justify-center py-32 select-none">
        <Loader2 size={28} className="animate-spin text-zinc-350 dark:text-zinc-650" />
      </div>
    );
  }

  // 加载失败
  if (error && !article) {
    return (
      <div className="max-w-md mx-auto text-center py-24 select-none">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">{error}</p>
        <button
          onClick={() => router.push("/articles")}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
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
    password: article?.password,
    isPinned: article?.isPinned,
    isFeatured: article?.isFeatured,
    isAllowComment: article?.isAllowComment,
    seoTitle: article?.seoTitle,
    seoDescription: article?.seoDescription,
    seoKeywords: article?.seoKeywords,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部极简导航栏 */}
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
            编辑文章
          </h1>
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border select-none",
            article?.status === "PUBLISHED"
              ? "bg-green-50/50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200/40 dark:border-green-900/30"
              : "bg-zinc-100/60 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 border-zinc-200/40 dark:border-zinc-800/60"
          )}>
            {article?.status === "PUBLISHED" ? "已发布" : "草稿"}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono select-none">
            ID: {id}
          </span>
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
      <ArticleForm initialData={initialData} onSave={handleSave} saving={saving} />
    </div>
  );
}
