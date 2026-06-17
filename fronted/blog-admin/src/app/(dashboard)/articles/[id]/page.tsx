"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import ArticleForm from "@/components/forms/ArticleForm";
import { fetchArticleDetail, updateArticle } from "@/lib/article-api";
import type { ArticleDetail, ArticleSaveDTO } from "@/types/article";
import { Loader2 } from "lucide-react";

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
    fetchArticleDetail(id)
      .then((data) => {
        if (data) setArticle(data);
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
      await updateArticle(id, data);
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
    contentType: article?.contentType,
    template: article?.template,
    seoTitle: article?.seoTitle,
    seoDescription: article?.seoDescription,
    seoKeywords: article?.seoKeywords,
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
      <ArticleForm initialData={initialData} onSave={handleSave} saving={saving} />
    </div>
  );
}
