"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleForm from "@/components/forms/ArticleForm";
import { createArticle } from "@/lib/article-api";
import type { ArticleSaveDTO } from "@/types/article";
import { toast } from "@/lib/toast";

/**
 * 新建文章页面
 * - 移除了多余大标题，升级为顶部极简面包屑控制条
 * - 扩宽最大宽度至 max-w-6xl 以适配左正文右参数的双栏布局
 */
export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: ArticleSaveDTO) => {
    setSaving(true);

    try {
      const created = await createArticle(data);

      const msg =
        data.status === "PUBLISHED" ? "文章已发布！正在跳转编辑页..." : "草稿已保存！正在跳转编辑页...";
      toast.success(msg);

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
      const errMsg = axiosErr?.response?.data?.msg || "保存失败，请重试";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 双栏表单 */}
      <ArticleForm onSave={handleSave} saving={saving} />
    </div>
  );
}
