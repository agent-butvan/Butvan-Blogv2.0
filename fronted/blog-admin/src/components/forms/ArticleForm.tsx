"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import {
  Save,
  Send,
  SlidersHorizontal,
  EyeOff,
  X,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Settings,
  Folder,
  Tag,
  BookOpen,
  Layout,
  MessageSquare
} from "lucide-react";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import { fetchCategoriesSimple, fetchTags, fetchTagsSimple } from "@/lib/article-api";
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
 * 文章后台高保真编辑器工作台
 * - 顶栏吸顶 Header：集成无框大标题、URL Slug、状态切换、预览模式及侧边栏开关
 * - 双栏写作区：支持纯编辑与实时双栏分屏预览无缝切换，右下角带有常驻字数统计浮层
 * - 侧边滑出抽屉 (MetaDrawer)：点击右侧设置按钮划出，管理所有分类、标签、评论等高级参数，对接数据库字段
 */
export default function ArticleForm({ initialData, onSave, saving = false }: ArticleFormProps) {
  const router = useRouter();

  // 1. UI 视图交互状态
  const [showMeta, setShowMeta] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. 表单核心数据状态
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrls, setCoverImageUrls] = useState<string[]>(() => {
    // 初始化时去重：优先使用 coverImageUrls 数组，其次回退到单图 coverImageUrl
    const raw = initialData?.coverImageUrls || (initialData?.coverImageUrl ? [initialData.coverImageUrl] : []);
    return [...new Set(raw)];
  });
  // 封面展示数量（1-4张）
  const [coverCount, setCoverCount] = useState<number>(1);
  // 用户是否手动修改过封面（手动修改后不再自动提取）
  const [coverManuallySet, setCoverManuallySet] = useState(false);
  
  // 自动从编辑器内容中提取所有图片作为封面候选（Set 去重 + 标准化 URL）
  useEffect(() => {
    if (coverManuallySet) return; // 用户已手动设置，不自动提取
    // 匹配所有 Markdown 图片语法 ![...](url)，支持 http/https 及相对路径
    const imgRegex = /!\[.*?\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g;
    const urlSet = new Set<string>();
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      // 标准化 URL：去除尾部空格，确保精确去重
      const url = match[1].trim();
      urlSet.add(url);
    }
    const urls = Array.from(urlSet);
    setCoverImageUrls(urls);
  }, [content, coverManuallySet]);
  
  // 数据库字段映射与联动
  const [categoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [tagIds, setTagIds] = useState<number[]>(initialData?.tagIds || []);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    (initialData?.status as any) === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  );
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED">(
    (initialData?.visibility as any) || "PUBLIC"
  );
  const [password, setPassword] = useState<string>(initialData?.password || "");
  const [isPinned, setIsPinned] = useState<boolean>(initialData?.isPinned || false);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isAllowComment, setIsAllowComment] = useState<boolean>(initialData?.isAllowComment !== false);
  const [contentType, setContentType] = useState<"ARTICLE" | "NOTE" | "GALLERY" | "PROJECT">(
    initialData?.contentType || "ARTICLE"
  );
  const [template, setTemplate] = useState<string>(initialData?.template || "");

  // SEO 元数据
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || "");

  // 3. 接口拉取与 Mock 数据源
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    // 拉取分类
    fetchCategoriesSimple()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(MOCK_CATEGORIES);
      });

    // 拉取标签
    fetchTags()
      .then((data) => {
        const list = data;
        if (Array.isArray(list)) {
          setTags(list);
        } else if (list && Array.isArray(list.records)) {
          setTags(list.records);
        } else {
          fetchTagsSimple()
            .then(simpleList => {
              if (Array.isArray(simpleList)) setTags(simpleList);
              else setTags(MOCK_TAGS);
            })
            .catch(() => setTags(MOCK_TAGS));
        }
      })
      .catch(() => {
        setTags(MOCK_TAGS);
      });
  }, []);

  // 4. 正文字数及阅读时间实时统计
  const charCount = content.length;
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const paragraphCount = content.split(/\n+/).filter((p) => p.trim()).length;
  const wordCount = content.split(/\s+/).filter((w) => w.trim()).length;
  const readingMinutes = Math.ceil(charCount / 300) || 1;

  // 5. 保存与提交逻辑
  const handleTriggerSave = () => {
    const data: ArticleSaveDTO = {
      title: title || "无标题",
      slug: slug || undefined,
      summary: summary || undefined,
      content,
      coverImageUrl: coverImageUrls.length > 0 ? coverImageUrls[0] : undefined,
      coverImageUrls: coverImageUrls.length > 0 ? coverImageUrls.slice(0, coverCount) : undefined,
      categoryId: categoryId || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      status,
      visibility,
      password: visibility === "PASSWORD_PROTECTED" ? password : undefined,
      isPinned,
      isFeatured,
      isAllowComment,
      contentType,
      template: template || undefined,
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-transparent min-h-[calc(100vh-140px)]">
      
      {/* 顶栏 Header：集成标题与所有核心工作流控制 */}
      <header className="bg-background/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/60 py-3 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-20 select-none">
        
        {/* 左侧：返回列表与无框扁平大标题输入 */}
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/articles")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all cursor-pointer shrink-0"
            title="返回列表"
          >
            <ArrowLeft size={16} />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="在这里开始你的写作吧..."
            required
            className="flex-1 bg-transparent px-2 h-9 text-lg font-bold font-heading text-neutral-dark dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-700 border-0 outline-none focus:ring-0 focus:outline-none transition-colors leading-none"
          />
        </div>

        {/* 右侧：短链接别名、AI、预览、状态配置与保存发布 */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* 行内 /posts/ 短链接别名 - 优化为高颜值胶囊输入槽 */}
          <div className="flex h-9 items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 text-[11px] font-mono transition-all">
            <span className="text-zinc-400 dark:text-zinc-550 select-none">/posts/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="短别名"
              className="w-18 bg-transparent p-0 border-none outline-none focus:ring-0 text-zinc-700 dark:text-zinc-300 placeholder-zinc-300 dark:placeholder-zinc-700 leading-normal"
            />
          </div>

          {/* AI 助手占位示意 - 对齐高度并增加温和悬停色调 */}
          <button
            type="button"
            onClick={() => alert("AI 智能修饰与标题生成即将上线，敬请期待！")}
            className="flex h-9 items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-bold bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-primary/10 hover:border-primary/20 text-zinc-650 dark:text-zinc-400 hover:text-primary border border-transparent transition-all cursor-pointer"
            title="AI 标题/摘要助手"
          >
            <Sparkles size={13} className="text-primary/70 dark:text-primary/90" />
            <span>AI</span>
          </button>

          {/* 草稿 / 发布单选组合按钮 - 优化对齐 */}
          <div className="flex h-9 items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/30 dark:border-zinc-900/30">
            <button
              type="button"
              onClick={() => setStatus("DRAFT")}
              className={cn(
                "h-7 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center",
                status === "DRAFT"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-primary"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              草稿
            </button>
            <button
              type="button"
              onClick={() => setStatus("PUBLISHED")}
              className={cn(
                "h-7 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center",
                status === "PUBLISHED"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-primary"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              发布
            </button>
          </div>

          {/* 侧边 Drawer 配置滑块 */}
          <button
            type="button"
            onClick={() => setShowMeta(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all cursor-pointer"
            title="文章设置属性"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* 保存触发按钮 - 高度对齐至 36px 并提升触感反馈 */}
          <button
            type="button"
            onClick={handleTriggerSave}
            disabled={saving || !title.trim()}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={13} />
            <span>{status === "PUBLISHED" ? "发布新版" : "保存草稿"}</span>
          </button>

        </div>
      </header>

      {/* 主面板写作区：内置实时预览切换与字数信息常驻 */}
      <main className="flex-1 min-h-0 relative">
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-950">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height={640}
          />

          {/* 右下角常驻统计浮层 (EditorStatsOverlay) */}
          <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-[10px] font-mono text-zinc-550 dark:text-zinc-400 select-none shadow-md z-10 flex items-center gap-4.5">
            <div className="flex items-center gap-1">
              <span>共</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{charCount}</strong>
              <span>字符</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <span>中文</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{chineseCharCount}</strong>
              <span>字</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{paragraphCount}</strong>
              <span>段落</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <span>阅读约</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{readingMinutes}</strong>
              <span>分钟</span>
            </div>
          </div>
        </div>
      </main>

      {/* 仅在客户端 mounted 后使用 Portal 挂载到 body 下，彻底脱离父容器 z-index 限制以遮罩包括 Sidebar 在内的全屏区域 */}
      {mounted && createPortal(
        <>
          {/* 遮罩层 (Drawer Backdrop) */}
          {showMeta && (
            <div
              className="fixed inset-0 bg-zinc-950/30 dark:bg-zinc-950/50 backdrop-blur-xs z-[998] transition-opacity animate-[fadeIn_0.2s_ease-out]"
              onClick={() => setShowMeta(false)}
            />
          )}

          {/* 侧边滑出抽屉 (Slide Drawer Panel) */}
          <div className={cn(
            "fixed top-0 right-0 z-[999] h-full w-88 bg-white dark:bg-zinc-950 border-l border-zinc-200/80 dark:border-zinc-900/80 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-out flex flex-col gap-5.5 select-none",
            showMeta ? "translate-x-0 animate-[slideIn_0.25s_ease-out]" : "translate-x-full"
          )}>
            
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-900/60 pb-3.5">
              <h2 className="font-heading text-sm font-bold text-neutral-dark dark:text-zinc-200 flex items-center gap-2">
                <Settings size={15} />
                <span>文章设置</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowMeta(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* 抽屉设置表单内容 */}
            <div className="flex-1 space-y-5.5 custom-scrollbar overflow-y-auto pr-1 pb-6">
              
              {/* 所属分类 (Select) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Folder size={11} />
                  <span>分类</span>
                </label>
                <div className="relative">
                  <select
                    value={categoryId || ""}
                    onChange={(e) => setCategoryId(Number(e.target.value) || undefined)}
                    className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-880 dark:text-zinc-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">选择分类（可空）</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 标签 (Tag Chips) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={11} />
                  <span>标签</span>
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
                          "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer",
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

              {/* 内容类型 (content_type) & 自定义模板 (template) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={11} />
                    <span>内容类型</span>
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-850 dark:text-zinc-200 outline-none transition-all cursor-pointer"
                  >
                    <option value="ARTICLE">文章</option>
                    <option value="NOTE">随笔</option>
                    <option value="GALLERY">画廊</option>
                    <option value="PROJECT">项目</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Layout size={11} />
                    <span>自定义模板</span>
                  </label>
                  <input
                    type="text"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="默认"
                    className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* 属性控制开关组 */}
              <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">首页置顶</span>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">特别推荐</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
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

              {/* 可见性选择 */}
              <div className="space-y-2 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
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
                          ? "bg-white dark:bg-zinc-900 shadow-xs text-primary"
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
                      placeholder="请输入访问密码"
                      required
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3.5 pr-8 py-2 text-xs text-zinc-850 dark:text-zinc-250 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <EyeOff size={13} className="text-zinc-400 absolute right-3 top-3" />
                  </div>
                )}
              </div>

              {/* 摘要与描述 */}
              <div className="space-y-1.5 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare size={11} />
                  <span>外显描述摘要</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="文章简要描述..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {/* 封面图片 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Layout size={11} />
                    <span>封面图</span>
                    {coverImageUrls.length > 0 && (
                      <span className="text-zinc-400 dark:text-zinc-600 normal-case tracking-normal">({coverImageUrls.length}张)</span>
                    )}
                  </label>
                  {/* 封面展示数量选择器 */}
                  {coverImageUrls.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <span>展示</span>
                      <select
                        value={coverCount}
                        onChange={(e) => setCoverCount(Number(e.target.value))}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.5 py-0.5 text-[10px] outline-none cursor-pointer"
                      >
                        {Array.from({ length: Math.min(coverImageUrls.length, 4) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}张</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {/* 封面画廊预览 */}
                {coverImageUrls.length > 0 ? (
                  <div className={cn(
                    "grid gap-1.5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800",
                    coverCount === 1 ? "grid-cols-1" :
                    coverCount === 2 ? "grid-cols-2" :
                    "grid-cols-2"
                  )}>
                    {coverImageUrls.slice(0, coverCount).map((url, i) => (
                      <div key={i} className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={url}
                          alt={`封面${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* 移除按钮 */}
                        <button
                          type="button"
                          onClick={() => {
                            setCoverManuallySet(true);
                            setCoverImageUrls(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600 italic">在编辑器中插入图片后会自动提取为封面</p>
                )}
                {/* 手动添加封面 URL */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setCoverManuallySet(true);
                        setCoverImageUrls(prev => [...prev, e.target.value]);
                        e.target.value = "";
                      }
                    }}
                    placeholder="手动添加封面图 URL..."
                    className="flex-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* SEO 折叠面板 */}
              <details className="group border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl overflow-hidden bg-white/40 dark:bg-zinc-950/20">
                <summary className="flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-450 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 select-none">
                  <span>SEO 优化字段</span>
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
                      placeholder="默认使用文章标题"
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-250 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">SEO 描述</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="默认使用文章摘要"
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
                      placeholder="react, nextjs"
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-250 outline-none"
                    />
                  </div>
                </div>
              </details>

            </div>
          </div>
        </>,
        document.body
      )}

    </form>
  );
}
