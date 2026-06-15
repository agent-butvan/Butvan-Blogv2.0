"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@heroui/react";
import { Save, Send, Eye, EyeOff } from "lucide-react";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import type { ArticleSaveDTO } from "@/types/article";

export interface ArticleFormProps {
  /** 初始数据（编辑模式） */
  initialData?: ArticleSaveDTO;
  /** 保存回调 */
  onSave: (data: ArticleSaveDTO) => Promise<void>;
  /** 是否正在保存 */
  saving?: boolean;
}

/** 表单 Tab */
type FormTab = "content" | "settings";

/**
 * 文章编辑表单
 * - 标题、摘要、正文（Markdown 编辑器）
 * - SEO 设置、分类/标签、发布状态
 * - 支持「保存草稿」和「发布」两种操作
 */
export default function ArticleForm({ initialData, onSave, saving = false }: ArticleFormProps) {
  const [activeTab, setActiveTab] = useState<FormTab>("content");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || "");

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    const data: ArticleSaveDTO = {
      title,
      slug: slug || undefined,
      summary: summary || undefined,
      content,
      coverImageUrl: coverImageUrl || undefined,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: seoKeywords || undefined,
    };
    onSave(data);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-150 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab 切换 */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-0">
        {[
          { key: "content" as const, label: "正文编辑" },
          { key: "settings" as const, label: "发布设置" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 正文编辑 Tab */}
      {activeTab === "content" && (
        <div className="space-y-5">
          {/* 标题 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            required
            className="w-full rounded-lg border-0 bg-transparent px-0 text-3xl font-bold font-heading text-neutral-dark dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-700 outline-none focus:ring-0"
          />

          {/* URL Slug */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              URL 标识 (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-url-slug（留空自动生成）"
              className={cn(inputClass, "text-sm font-mono")}
            />
          </div>

          {/* 摘要 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              文章摘要
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简要描述文章内容，将显示在文章列表卡片中"
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Markdown 编辑器 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              正文 (Markdown)
            </label>
            <MarkdownEditor value={content} onChange={setContent} height={500} />
          </div>
        </div>
      )}

      {/* 发布设置 Tab */}
      {activeTab === "settings" && (
        <div className="space-y-5 max-w-2xl">
          {/* 封面图 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              封面图片 URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className={inputClass}
            />
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="封面预览"
                className="mt-2 h-40 w-full rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
              />
            )}
          </div>

          {/* SEO 设置 */}
          <fieldset className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <legend className="px-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">SEO 元数据</legend>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-400 dark:text-zinc-500">SEO 标题</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="留空则使用文章标题"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400 dark:text-zinc-500">SEO 描述</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="留空则使用文章摘要"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400 dark:text-zinc-500">SEO 关键词（逗号分隔）</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="react, nextjs, 前端开发"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* 文章可见性（未来可扩展） */}
          <div className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-4">
            <Eye size={18} className="text-zinc-400" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">目前默认为公开可见，私密/密码保护功能即将上线</span>
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-5 sticky bottom-0 bg-background py-4 z-10">
        <p className="text-xs text-zinc-400">
          {saving ? "保存中..." : "自动保存功能即将上线"}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> 保存草稿
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={16} /> 发布文章
          </button>
        </div>
      </div>
    </form>
  );
}
