"use client";

import { useState, useEffect, type FormEvent } from "react";
import { cn } from "@heroui/react";
import { Save, Send, Eye, EyeOff, ChevronDown, Image as ImageIcon } from "lucide-react";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ArticleSaveDTO } from "@/types/article";

export interface ArticleFormProps {
  /** 初始数据（编辑模式） */
  initialData?: ArticleSaveDTO;
  /** 保存回调 */
  onSave: (data: ArticleSaveDTO) => Promise<void>;
  /** 是否正在保存 */
  saving?: boolean;
}

// 离线 Mock 数据，供双通道降级使用
const MOCK_CATEGORIES = [
  { id: 1, name: "前端开发", slug: "frontend" },
  { id: 2, name: "后端架构", slug: "backend" },
  { id: 3, name: "AI与算法", slug: "ai-ml" },
  { id: 4, name: "随笔杂谈", slug: "life" },
];

const MOCK_TAGS = [
  { id: 1, name: "Next.js", slug: "nextjs" },
  { id: 2, name: "Spring Boot", slug: "springboot" },
  { id: 3, name: "PostgreSQL", slug: "postgresql" },
  { id: 4, name: "TypeScript", slug: "typescript" },
  { id: 5, name: "CSS 魔法", slug: "css-magic" },
];

/**
 * 文章编辑表单
 * - 双栏 Notion / Figma 风格：左正文宽编辑，右常驻设置面板
 * - 整合分类、标签多选、置顶、推荐、评论开关、可见性设置
 * - 支持 API 与本地 Mock 双通道降级加载
 */
export default function ArticleForm({ initialData, onSave, saving = false }: ArticleFormProps) {
  // 数据字段状态
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  
  // 扩展参数
  const [categoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [tagIds, setTagIds] = useState<number[]>(initialData?.tagIds || []);
  const [isPinned, setIsPinned] = useState<boolean>(initialData?.isPinned || false);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isAllowComment, setIsAllowComment] = useState<boolean>(initialData?.isAllowComment !== false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED">(
    (initialData?.visibility as any) || "PUBLIC"
  );
  const [password, setPassword] = useState<string>(initialData?.password || "");

  // SEO 设置
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || "");

  // 接口数据
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // 双通道数据加载（尝试真实 API，失败则平滑降级至 Mock 预置数据）
  useEffect(() => {
    // 1. 分类加载
    apiClient.get<ApiResponse<any[]>>("/categories/simple")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(MOCK_CATEGORIES);
      });

    // 2. 标签加载
    apiClient.get<ApiResponse<any>>("/tags")
      .then((res) => {
        const list = res.data?.data;
        if (Array.isArray(list)) {
          setTags(list);
        } else if (list && Array.isArray(list.records)) {
          setTags(list.records);
        } else {
          // 尝试 tags/simple
          apiClient.get<ApiResponse<any[]>>("/tags/simple")
            .then(r => {
              if (Array.isArray(r.data?.data)) setTags(r.data.data);
              else setTags(MOCK_TAGS);
            })
            .catch(() => setTags(MOCK_TAGS));
        }
      })
      .catch(() => {
        setTags(MOCK_TAGS);
      });
  }, []);

  // 保存处理
  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    const data: ArticleSaveDTO = {
      title,
      slug: slug || undefined,
      summary: summary || undefined,
      content,
      coverImageUrl: coverImageUrl || undefined,
      categoryId: categoryId || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      status,
      isPinned,
      isFeatured,
      isAllowComment,
      visibility,
      password: visibility === "PASSWORD_PROTECTED" ? password : undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: seoKeywords || undefined,
    };
    onSave(data);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* 采用 Grid 左右双栏 Notion 风格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* 左栏：核心写作区（占 3 份宽度） */}
        <div className="lg:col-span-3 space-y-5">
          {/* Notion 式扁平无框大标题 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="无标题"
            required
            className="w-full bg-transparent px-0 py-2 text-4xl font-extrabold font-heading text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-800 border-0 outline-none focus:ring-0 focus:outline-none transition-all"
          />

          {/* 实时分屏 Markdown 编辑器 */}
          <div className="rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-850">
            <MarkdownEditor value={content} onChange={setContent} height={600} />
          </div>
        </div>

        {/* 右栏：常驻属性设置面板（占 1 份宽度） */}
        <div className="lg:col-span-1 space-y-5 sticky top-6">
          <div className="glass-panel bg-noise-texture rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 p-5 space-y-5 shadow-sm">
            
            {/* 第一部分：操作发布与状态 */}
            <div className="space-y-2.5 pb-4 border-b border-zinc-200/50 dark:border-zinc-900/60">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                操作面板
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSave("DRAFT")}
                  disabled={saving || !title.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>存草稿</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={saving || !title.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 px-3 text-xs font-bold text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>发布</span>
                </button>
              </div>
            </div>

            {/* 第二部分：所属分类 */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                所属分类
              </label>
              <div className="relative">
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(Number(e.target.value) || undefined)}
                  className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                >
                  <option value="">未分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 第三部分：平滑选择的多选标签 */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                文章标签
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const isSelected = tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTagIds(tagIds.filter((id) => id !== t.id));
                        } else {
                          setTagIds([...tagIds, t.id]);
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-white dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 第四部分：可见性设置与密码 */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-900/60">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                文章可见性
              </label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                {[
                  { key: "PUBLIC" as const, label: "公开" },
                  { key: "PRIVATE" as const, label: "私密" },
                  { key: "PASSWORD_PROTECTED" as const, label: "密码" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setVisibility(item.key)}
                    className={cn(
                      "py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer",
                      visibility === item.key
                        ? "bg-white dark:bg-zinc-900 shadow-sm text-primary"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {visibility === "PASSWORD_PROTECTED" && (
                <div className="animate-fade-in relative mt-1.5">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="设定文章访问密码"
                    required
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3.5 pr-8 py-2 text-xs text-zinc-850 dark:text-zinc-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <EyeOff size={13} className="text-zinc-400 absolute right-3 top-3" />
                </div>
              )}
            </div>

            {/* 第五部分：开关属性组合 */}
            <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
              {/* 置顶 */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">首页置顶</span>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
              </label>

              {/* 推荐 */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">特别推荐</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
              </label>

              {/* 允许评论 */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">允许评论</span>
                <input
                  type="checkbox"
                  checked={isAllowComment}
                  onChange={(e) => setIsAllowComment(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* 第六部分：文章摘要 */}
            <div className="space-y-1.5 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                文章摘要
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="关于本文的简单介绍..."
                rows={3}
                className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              />
            </div>

            {/* 第七部分：URL 别名 */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                URL 别名 (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="留空自动根据标题转换"
                className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* 第八部分：封面图 */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                封面图链接
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mt-2">
                  <img
                    src={coverImageUrl}
                    alt="封面预览"
                    className="h-24 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-xl py-4 text-zinc-450 dark:text-zinc-550 select-none">
                  <ImageIcon size={16} />
                  <span className="text-[10px] scale-90 font-medium mt-1">暂无封面</span>
                </div>
              )}
            </div>

            {/* 第九部分：折叠的 SEO 参数 */}
            <details className="group border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl overflow-hidden bg-white/40 dark:bg-zinc-950/20">
              <summary className="flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-450 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 select-none">
                <span>SEO 元数据</span>
                <span className="transition-transform group-open:rotate-180">
                  <ChevronDown size={13} />
                </span>
              </summary>
              <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/60 space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">SEO 标题</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="留空默认使用文章标题"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-250 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">SEO 描述</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="留空默认使用文章摘要"
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-250 outline-none resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">SEO 关键词 (逗号分割)</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="react, nextjs, blog"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-250 outline-none"
                  />
                </div>
              </div>
            </details>

          </div>
        </div>

      </div>
    </form>
  );
}
