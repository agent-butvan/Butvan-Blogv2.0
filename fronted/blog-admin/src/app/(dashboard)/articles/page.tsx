"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  ExternalLink,
  Flame,
  Pin,
  Sparkles,
  Loader2,
  Check,
  X,
  Globe,
  Lock,
  Key,
  EyeOff,
  Eye,
  MessageSquare
} from "lucide-react";
import { cn } from "@heroui/react";
import {
  fetchArticles as fetchArticlesApi,
  fetchArticleDetail,
  updateArticle,
  deleteArticle
} from "@/lib/article-api";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { PageResult, ArticleStatus } from "@/types/common";
import type { ArticleItem } from "@/types/article";

/**
 * 高颜值文章管理工作台（参考 Naive UI 大厂风格重构）
 * - 顶部集成多选批量状态控制条（批量发布、批量设为草稿、批量删除）
 * - 表格加入前台链接跳转、热门小火苗标识、分类/标签徽章
 * - 属性列支持行内点击一键切换置顶/特别推荐（支持安全的详情回落机制）
 * - 数字页码分页条代替简单上下页
 */
export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 操作交互状态
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // 勾选与批量操作状态
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  
  // 行内快捷操作中的 loading 标识
  const [quickUpdateId, setQuickUpdateId] = useState<number | null>(null);

  const pageSize = 10;

  /** 加载文章列表 */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchArticlesApi({
        page,
        size: pageSize,
        status: (statusFilter || undefined) as any,
        keyword: keyword || undefined,
      });
      setArticles(data.records);
      setTotal(data.total);
    } catch {
      // 后端未就绪，展示空列表
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, keyword]);

  useEffect(() => {
    setTimeout(() => {
      fetchArticles();
    }, 0);
  }, [fetchArticles]);

  // 全选/单选逻辑
  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(articles.map((a) => a.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleCheckOne = (id: number, checked: boolean) => {
    if (checked) {
      setCheckedIds((prev) => [...prev, id]);
    } else {
      setCheckedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  /** 行内快速切换属性 (如置顶、特别推荐、发布状态) */
  const handleQuickUpdate = async (item: ArticleItem, fields: Partial<ArticleItem>) => {
    setQuickUpdateId(item.id);
    try {
      // 1. 获取完整详情以确保数据完整，绕过 DTO 非空校验限制
      const fullDetail = await fetchArticleDetail(item.id);
      if (fullDetail) {
        // 2. 合并修改后的属性
        const updatedData = {
          title: fullDetail.title,
          slug: fullDetail.slug,
          summary: fullDetail.summary,
          content: fullDetail.content || "", 
          coverImageUrl: fullDetail.coverImageUrl,
          categoryId: fullDetail.categoryId,
          tagIds: fullDetail.tagIds,
          status: fields.status !== undefined ? fields.status : fullDetail.status,
          visibility: fullDetail.visibility,
          password: fullDetail.password,
          isPinned: fields.isPinned !== undefined ? fields.isPinned : fullDetail.isPinned,
          isFeatured: fields.isFeatured !== undefined ? fields.isFeatured : fullDetail.isFeatured,
          isAllowComment: fullDetail.isAllowComment,
          contentType: fullDetail.contentType,
          template: fullDetail.template,
          seoTitle: fullDetail.seoTitle,
          seoDescription: fullDetail.seoDescription,
          seoKeywords: fullDetail.seoKeywords,
        };
        // 3. 提交更新并刷新列表
        await updateArticle(item.id, updatedData);
        fetchArticles();
      }
    } catch (err) {
      console.error("快速更新属性失败:", err);
      setDeleteError("行内快捷更新属性失败，请进入详情页编辑修改");
    } finally {
      setQuickUpdateId(null);
    }
  };

  /** 批量更新发布状态 */
  const handleBatchStatus = async (publish: boolean) => {
    if (checkedIds.length === 0) return;
    setActionLoading(true);
    try {
      await Promise.all(
        checkedIds.map(async (id) => {
          const fullDetail = await fetchArticleDetail(id);
          if (fullDetail) {
            const updatedData = {
              ...fullDetail,
              status: (publish ? "PUBLISHED" : "DRAFT") as ArticleStatus
            };
            await updateArticle(id, updatedData);
          }
        })
      );
      setCheckedIds([]);
      fetchArticles();
    } catch (err) {
      console.error("批量发布状态失败:", err);
      setDeleteError("部分文章状态批量更新失败");
    } finally {
      setActionLoading(false);
    }
  };

  /** 打开单条删除确认 */
  const handleDeleteRequest = (id: number) => {
    setDeleteError(null);
    setIsBulkDelete(false);
    setConfirmDeleteId(id);
  };

  /** 打开批量删除确认 */
  const handleBulkDeleteRequest = () => {
    if (checkedIds.length === 0) return;
    setDeleteError(null);
    setIsBulkDelete(true);
    setConfirmDeleteId(checkedIds[0]); // 借用状态触发弹窗
  };

  /** 确认删除（兼顾单条与批量） */
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(checkedIds.map((id) => deleteArticle(id)));
        setCheckedIds([]);
      } else if (confirmDeleteId) {
        await deleteArticle(confirmDeleteId);
        setCheckedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
      }
      setConfirmDeleteId(null);
      fetchArticles();
    } catch {
      setDeleteError(isBulkDelete ? "批量删除部分失败，请重试" : "删除失败，请重试");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // 状态颜色 Tag (Status Dot 风格)
  const statusBadge = (item: ArticleItem) => {
    const status = item.status;
    const dotColors: Record<string, string> = {
      PUBLISHED: "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]",
      DRAFT: "bg-zinc-400 dark:bg-zinc-650",
      PRIVATE: "bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.35)]",
      ARCHIVED: "bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.35)]",
    };
    const label: Record<string, string> = {
      PUBLISHED: "已发布",
      DRAFT: "草稿",
      PRIVATE: "私密",
      ARCHIVED: "已归档",
    };

    const isCurrentLoading = quickUpdateId === item.id;

    return (
      <button
        type="button"
        disabled={isCurrentLoading}
        onClick={() => handleQuickUpdate(item, { status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } as any)}
        className="group/status inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200/40 dark:hover:border-zinc-800/50 cursor-pointer disabled:opacity-50 select-none transition-all outline-none"
        title={status === "PUBLISHED" ? "点击快捷切换为【草稿】" : "点击快捷切换为【已发布】"}
      >
        {isCurrentLoading ? (
          <Loader2 size={10} className="animate-spin text-zinc-400" />
        ) : (
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover/status:scale-110", dotColors[status] || "bg-zinc-400")} />
        )}
        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-none">
          {label[status] || status}
        </span>
      </button>
    );
  };

  // 访问权限颜色 Tag
  const visibilityBadge = (visibility: string) => {
    const config: Record<string, { label: string; icon: any; styles: string }> = {
      PUBLIC: {
        label: "公开",
        icon: Globe,
        styles: "text-emerald-600 dark:text-emerald-400 border-emerald-100/60 dark:border-emerald-950/20 bg-emerald-50/30 dark:bg-emerald-950/10",
      },
      PRIVATE: {
        label: "私密",
        icon: Lock,
        styles: "text-rose-600 dark:text-rose-400 border-rose-100/60 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/10",
      },
      PASSWORD_PROTECTED: {
        label: "密码保护",
        icon: Key,
        styles: "text-purple-600 dark:text-purple-400 border-purple-100/60 dark:border-purple-950/20 bg-purple-50/30 dark:bg-purple-950/10",
      },
    };

    const item = config[visibility] || {
      label: visibility,
      icon: Globe,
      styles: "text-zinc-500 border-zinc-200 bg-zinc-50/30",
    };

    const Icon = item.icon;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-lg border font-bold select-none",
          item.styles
        )}
      >
        <Icon size={10} className="shrink-0" />
        <span>{item.label}</span>
      </span>
    );
  };

  // 数字分页按钮渲染
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        buttons.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={cn(
              "h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border",
              page === i
                ? "bg-primary border-primary text-white shadow-sm"
                : "border-zinc-200/60 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950"
            )}
          >
            {i}
          </button>
        );
      } else if (i === page - 3 || i === page + 3) {
        buttons.push(
          <span key={`ellipsis-${i}`} className="text-zinc-400 dark:text-zinc-600 px-1 text-xs select-none">
            ...
          </span>
        );
      }
    }
    return buttons;
  };

  // 是否全选状态判定
  const isAllChecked = articles.length > 0 && checkedIds.length === articles.length;
  const isSomeChecked = checkedIds.length > 0 && checkedIds.length < articles.length;

  return (
    <div className="space-y-5">
      {/* 页面标题 + 操作 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">文章管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">WORKSPACE / ARTICLES (共 {total} 篇文章)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/articles/new")}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4.5 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>新建文章</span>
          </button>
        </div>
      </div>

      {/* 操作错误提示 */}
      {deleteError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/35 p-3.5 text-xs font-medium text-red-700 dark:text-red-400 animate-fade-in flex items-center justify-between">
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-450 hover:text-red-650 cursor-pointer flex items-center justify-center p-0.5 rounded-full hover:bg-red-100/50"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 筛选 + 搜索栏 - 紧凑大厂排版 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-1.5 flex-1 max-w-xs transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          <Search size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="搜索文章标题..."
            className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-100 outline-none placeholder-zinc-400 dark:placeholder-zinc-650 focus:ring-0 leading-normal"
          />
        </div>
        <div className="flex h-9 items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs text-zinc-600 dark:text-zinc-400">
          <Filter size={12} className="text-zinc-400 dark:text-zinc-550 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-none bg-transparent p-0 pr-1 text-xs text-zinc-700 dark:text-zinc-350 outline-none cursor-pointer focus:ring-0"
          >
            <option value="">全部状态</option>
            <option value="PUBLISHED">已发布</option>
            <option value="DRAFT">草稿</option>
            <option value="PRIVATE">私密</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </div>
      </div>

      {/* 文章表格 - 极简精致大厂排版 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[900px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-4 py-3.5 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                />
              </th>
              <th className="px-5 py-3.5">文章标题</th>
              <th className="px-5 py-3.5 w-32">所属分类</th>
              <th className="px-5 py-3.5 w-28 text-center">访问权限</th>
              <th className="px-5 py-3.5 w-24 text-center">发布状态</th>
              <th className="px-5 py-3.5 w-36 text-center">属性配置</th>
              <th className="px-5 py-3.5 w-20 text-center">浏览</th>
              <th className="px-5 py-3.5 w-20 text-center">评论</th>
              <th className="px-5 py-3.5 w-36">更新日期</th>
              <th className="px-5 py-3.5 w-24 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={20} className="animate-spin text-zinc-350 dark:text-zinc-650" />
                    <span className="text-[11px] font-medium tracking-wide">加载文章列表中...</span>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center text-zinc-400 select-none">
                  <span className="text-[11px]">暂无文章，开始</span>
                  <Link href="/articles/new" className="text-primary font-bold hover:underline mx-1">写一篇新文章</Link>
                  <span className="text-[11px]">吧！</span>
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const isChecked = checkedIds.includes(article.id);
                const isHot = (article.viewCount || 0) > 1000 || (article.commentCount || 0) > 50;
                const isCurrentLoading = quickUpdateId === article.id;

                return (
                  <tr
                    key={article.id}
                    className="group border-b border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150"
                  >
                    {/* 选择框 */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckOne(article.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                      />
                    </td>

                    {/* 文章标题 - 中心自适应列 */}
                    <td className="px-5 py-3.5 min-w-0">
                      <div className="flex items-center gap-1.5 max-w-full min-w-0">
                        <span 
                          className="font-semibold text-neutral-dark dark:text-zinc-150 truncate flex-1 min-w-0 leading-tight group-hover:text-primary transition-colors duration-150" 
                          title={article.title}
                        >
                          {article.title}
                        </span>
                        
                        {/* 热门火苗标签 */}
                        {isHot && (
                          <span title="热门文章（标准：浏览量 > 1000 或 评论数 > 50）">
                            <Flame 
                              size={12} 
                              className="text-red-500 shrink-0 fill-red-500/10 cursor-help"
                            />
                          </span>
                        )}

                        {/* 前台预览图标 */}
                        <a
                          href={`http://localhost:3000/article/${article.slug || article.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-all duration-200 shrink-0 hover:translate-x-0.5 hover:-translate-y-0.5"
                          title="在新标签页预览前台文章"
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      {article.summary && (
                        <div 
                          className="text-[11px] text-zinc-450 dark:text-zinc-500 truncate max-w-full mt-1 font-normal leading-normal" 
                          title={article.summary}
                        >
                          {article.summary}
                        </div>
                      )}
                    </td>

                    {/* 所属分类 */}
                    <td className="px-5 py-3.5 w-32">
                      {article.categoryName ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400">
                          {article.categoryName}
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 font-mono">-</span>
                      )}
                    </td>

                    {/* 访问权限 */}
                    <td className="px-5 py-3.5 w-28 text-center">
                      <div className="flex justify-center">
                        {visibilityBadge(article.visibility)}
                      </div>
                    </td>

                    {/* 发布状态 */}
                    <td className="px-5 py-3.5 w-24 text-center">
                      <div className="flex justify-center items-center">
                        {statusBadge(article)}
                      </div>
                    </td>

                    {/* 属性配置 */}
                    <td className="px-5 py-3.5 w-36 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={isCurrentLoading}
                          onClick={() => handleQuickUpdate(article, { isPinned: !article.isPinned })}
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.95] shrink-0 outline-none",
                            article.isPinned
                              ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-300/40 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 font-extrabold"
                              : "bg-transparent border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 hover:border-zinc-200/60 dark:hover:border-zinc-800"
                          )}
                          title={article.isPinned ? "取消置顶" : "设为置顶"}
                        >
                          <Pin size={10} className={cn("shrink-0", article.isPinned ? "fill-amber-500/20 text-amber-500" : "")} />
                          <span>置顶</span>
                        </button>

                        <button
                          type="button"
                          disabled={isCurrentLoading}
                          onClick={() => handleQuickUpdate(article, { isFeatured: !article.isFeatured })}
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.95] shrink-0 outline-none",
                            article.isFeatured
                              ? "bg-purple-500/5 dark:bg-purple-500/10 border-purple-300/40 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 font-extrabold"
                              : "bg-transparent border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 hover:border-zinc-200/60 dark:hover:border-zinc-800"
                          )}
                          title={article.isFeatured ? "取消推荐" : "特别推荐"}
                        >
                          <Sparkles size={10} className={cn("shrink-0", article.isFeatured ? "fill-purple-500/20 text-purple-500" : "")} />
                          <span>推荐</span>
                        </button>
                      </div>
                    </td>

                    {/* 浏览量 */}
                    <td className="px-5 py-3.5 w-20 text-center font-mono font-medium">
                      <div className="flex items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Eye size={12} className="opacity-60" />
                        <span>{article.viewCount}</span>
                      </div>
                    </td>

                    {/* 评论数 */}
                    <td className="px-5 py-3.5 w-20 text-center font-mono font-medium">
                      <div className="flex items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <MessageSquare size={12} className="opacity-60" />
                        <span>{article.commentCount}</span>
                      </div>
                    </td>

                    {/* 更新日期 */}
                    <td className="px-5 py-3.5 w-36 text-zinc-450 dark:text-zinc-500 font-mono text-[10px] leading-tight">
                      {article.updatedAt
                        ? new Date(article.updatedAt).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                          })
                        : "--"}
                    </td>

                    {/* 管理操作 */}
                    <td className="px-5 py-3.5 w-24">
                      <div className="flex items-center justify-end gap-0.5 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => router.push(`/articles/${article.id}`)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer outline-none border-0"
                          title="编辑文章"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(article.id)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all cursor-pointer outline-none border-0"
                          title="删除文章"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页器 - 高保真数字页码样式 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-zinc-500 dark:text-zinc-450 font-medium font-mono select-none">
            SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-850 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold outline-none"
            >
              上一页
            </button>
            
            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-850 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold outline-none"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 底部悬浮批量控制面板 - 经典的 Notion/Linear 交互体验 */}
      <div 
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-35 flex items-center gap-4.5 px-6 py-3 rounded-2xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.4)] border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 ease-out select-none",
          checkedIds.length > 0 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 border-r border-zinc-200/60 dark:border-zinc-800/60 pr-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 font-mono">
            已选中 {checkedIds.length} 项
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleBatchStatus(true)}
            className="h-8 px-3.5 rounded-xl bg-primary hover:bg-primary/95 text-[10px] font-bold text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none active:scale-95"
          >
            {actionLoading ? <Loader2 size={10.5} className="animate-spin" /> : <Check size={11} />}
            <span>批量发布</span>
          </button>
          
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleBatchStatus(false)}
            className="h-8 px-3.5 rounded-xl bg-zinc-150/80 dark:bg-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-250/80 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none active:scale-95"
          >
            <span>设为草稿</span>
          </button>
          
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleBulkDeleteRequest}
            className="h-8 px-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none active:scale-95"
          >
            <Trash2 size={10.5} />
            <span>批量删除</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCheckedIds([])}
          className="ml-1 p-1 rounded-full text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-0 bg-transparent outline-none"
          title="取消选择"
        >
          <X size={12.5} />
        </button>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title={isBulkDelete ? "确认批量删除" : "确认删除"}
        description={
          isBulkDelete
            ? `确定要删除这选中的 ${checkedIds.length} 篇文章吗？此操作不可撤销并会移除所有相关标签数据。`
            : "确定要删除这篇文章吗？此操作不可撤销并会移除所有相关标签数据。"
        }
        confirmLabel="删除"
        cancelLabel="取消"
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
