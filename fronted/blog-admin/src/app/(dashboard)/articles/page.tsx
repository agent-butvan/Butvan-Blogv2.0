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
  X
} from "lucide-react";
import { cn } from "@heroui/react";
import apiClient from "@/lib/api";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { ApiResponse, PageResult } from "@/types/common";
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
      const res = await apiClient.get<ApiResponse<PageResult<ArticleItem>>>("/articles", {
        params: {
          page,
          size: pageSize,
          status: statusFilter || undefined,
          keyword: keyword || undefined,
        },
      });
      if (res.data?.data) {
        setArticles(res.data.data.records);
        setTotal(res.data.data.total);
      }
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
      const detailRes = await apiClient.get<ApiResponse<any>>(`/articles/${item.id}`);
      if (detailRes.data?.data) {
        const fullDetail = detailRes.data.data;
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
        await apiClient.put(`/articles/${item.id}`, updatedData);
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
          const detailRes = await apiClient.get<ApiResponse<any>>(`/articles/${id}`);
          if (detailRes.data?.data) {
            const fullDetail = detailRes.data.data;
            const updatedData = {
              ...fullDetail,
              status: publish ? "PUBLISHED" : "DRAFT"
            };
            await apiClient.put(`/articles/${id}`, updatedData);
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
        await Promise.all(checkedIds.map((id) => apiClient.delete(`/articles/${id}`)));
        setCheckedIds([]);
      } else if (confirmDeleteId) {
        await apiClient.delete(`/articles/${confirmDeleteId}`);
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

  // 状态颜色 Tag
  const statusBadge = (item: ArticleItem) => {
    const status = item.status;
    const map: Record<string, string> = {
      PUBLISHED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-800/40",
      DRAFT: "bg-zinc-50 text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400 border-zinc-200/40 dark:border-zinc-800/50",
      PRIVATE: "bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400 border-amber-200/40 dark:border-amber-800/40",
      ARCHIVED: "bg-sky-50 text-sky-600 dark:bg-sky-950/25 dark:text-sky-400 border-sky-200/40 dark:border-sky-800/40",
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
        className={cn(
          "text-[10px] px-2 py-0.5 rounded-lg font-bold border cursor-pointer hover:opacity-85 select-none transition-all flex items-center gap-1 disabled:opacity-50",
          map[status] || ""
        )}
        title={status === "PUBLISHED" ? "点击快捷切换为【草稿】" : "点击快捷切换为【已发布】"}
      >
        {isCurrentLoading && <Loader2 size={9} className="animate-spin text-zinc-400" />}
        <span>{label[status] || status}</span>
      </button>
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
          {/* 浮动显示的批量操作栏 */}
          {checkedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-fade-in bg-zinc-150/40 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-zinc-800/40 p-1 rounded-xl">
              <span className="text-[10px] px-2 py-1 font-bold text-primary font-mono select-none">
                已选择 {checkedIds.length} 项
              </span>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleBatchStatus(true)}
                className="h-7 px-2.5 rounded-lg bg-white dark:bg-zinc-950 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-zinc-200/40 dark:border-zinc-800/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={10} className="animate-spin" />}
                <span>批量发布</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleBatchStatus(false)}
                className="h-7 px-2.5 rounded-lg bg-white dark:bg-zinc-950 text-[10px] font-bold text-zinc-500 hover:bg-zinc-150/50 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <span>设为草稿</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleBulkDeleteRequest}
                className="h-7 px-2.5 rounded-lg bg-red-500 text-[10px] font-bold text-white hover:bg-red-600 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <span>批量删除</span>
              </button>
            </div>
          )}

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
        <table className="w-full text-xs text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
              </th>
              <th className="px-5 py-3">文章标题</th>
              <th className="px-5 py-3 w-32">所属分类</th>
              <th className="px-5 py-3 w-28 text-center">发布状态</th>
              <th className="px-5 py-3 w-40 text-center">属性配置</th>
              <th className="px-5 py-3 w-20 text-center">浏览数</th>
              <th className="px-5 py-3 w-32">更新日期</th>
              <th className="px-5 py-3 w-24 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={20} className="animate-spin text-zinc-350 dark:text-zinc-650" />
                    <span>加载文章列表中...</span>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-zinc-400 select-none">
                  <span>暂无文章，开始</span>
                  <Link href="/articles/new" className="text-primary font-bold hover:underline mx-1">写一篇新文章</Link>
                  <span>吧！</span>
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const isCurrentLoading = quickUpdateId === article.id;
                const isChecked = checkedIds.includes(article.id);
                // 热门判定：阅读量 > 1000 或者是特别推荐
                const isHot = article.viewCount > 1000 || article.commentCount > 50;

                return (
                  <tr 
                    key={article.id} 
                    className={cn(
                      "hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-all group",
                      isChecked ? "bg-primary/3 dark:bg-primary/5" : ""
                    )}
                  >
                    {/* 复选单选框 */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckOne(article.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                    </td>

                    {/* 标题（包含链接跳转、火苗标识） */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="font-semibold text-neutral-dark dark:text-zinc-150 truncate max-w-sm">
                          {article.title}
                        </div>
                        
                        {/* 热门火苗标签 */}
                        {isHot && (
                          <Flame 
                            size={13} 
                            className="text-red-500 shrink-0 fill-red-500/10 cursor-help"
                            title="热门文章（标准：浏览量 > 1000 或 评论数 > 50）" 
                          />
                        )}

                        {/* 直接访问前台链接图标 */}
                        <a
                          href={`http://localhost:3000/posts/${article.slug || article.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-opacity"
                          title="在新标签页预览前台文章"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      {article.summary && (
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-xs mt-0.5 font-normal">
                          {article.summary}
                        </div>
                      )}
                    </td>

                    {/* 所属分类 */}
                    <td className="px-5 py-3">
                      {article.categoryName ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                          {article.categoryName}
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 font-mono">-</span>
                      )}
                    </td>

                    {/* 发布状态 (含快捷切换) */}
                    <td className="px-5 py-3 text-center flex justify-center items-center h-full">
                      {statusBadge(article)}
                    </td>

                    {/* 置顶 & 推荐属性（支持快捷行内一键修改） */}
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        {/* 置顶属性 */}
                        <button
                          type="button"
                          disabled={isCurrentLoading}
                          onClick={() => handleQuickUpdate(article, { isPinned: !article.isPinned })}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50",
                            article.isPinned
                              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300/40 text-amber-600 dark:text-amber-400 font-extrabold"
                              : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300"
                          )}
                          title={article.isPinned ? "取消置顶" : "设为置顶"}
                        >
                          <Pin size={10} className={cn("shrink-0", article.isPinned ? "fill-amber-500/20" : "")} />
                          <span>置顶</span>
                        </button>

                        {/* 特别推荐属性 */}
                        <button
                          type="button"
                          disabled={isCurrentLoading}
                          onClick={() => handleQuickUpdate(article, { isFeatured: !article.isFeatured })}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50",
                            article.isFeatured
                              ? "bg-purple-50 dark:bg-purple-950/20 border-purple-300/40 text-purple-600 dark:text-purple-400 font-extrabold"
                              : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300"
                          )}
                          title={article.isFeatured ? "取消推荐" : "特别推荐"}
                        >
                          <Sparkles size={10} className={cn("shrink-0", article.isFeatured ? "fill-purple-500/20" : "")} />
                          <span>推荐</span>
                        </button>
                      </div>
                    </td>

                    {/* 浏览量数 */}
                    <td className="px-5 py-3 text-center text-zinc-550 dark:text-zinc-400 font-mono font-medium">
                      {article.viewCount}
                    </td>

                    {/* 更新日期 */}
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-500 font-mono text-[10px]">
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

                    {/* 操作（编辑、删除） */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1 select-none">
                        <button
                          onClick={() => router.push(`/articles/${article.id}`)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer"
                          title="编辑文章"
                        >
                          <Edit size={13.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(article.id)}
                          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all cursor-pointer"
                          title="删除文章"
                        >
                          <Trash2 size={13.5} />
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
          <span className="text-zinc-500 dark:text-zinc-450 font-medium font-mono">
            SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-850 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
            >
              上一页
            </button>
            
            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-850 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
            >
              下一页
            </button>
          </div>
        </div>
      )}

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
