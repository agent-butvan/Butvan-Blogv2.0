"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse, PageResult } from "@/types/common";
import type { ArticleItem } from "@/types/article";

/**
 * 文章管理列表页
 * - 表格展示所有文章，支持分页
 * - 按状态筛选（全部/已发布/草稿）
 * - 关键字搜索
 */
export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    fetchArticles();
  }, [fetchArticles]);

  /** 删除文章 */
  const handleDelete = async (id: number) => {
    setDeleteError(null);
    if (!confirm("确定要删除这篇文章吗？")) return;
    try {
      await apiClient.delete(`/articles/${id}`);
      fetchArticles();
    } catch {
      setDeleteError("删除失败，请重试");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED: "bg-green-100 text-green-700",
      DRAFT: "bg-zinc-100 text-zinc-500",
      PRIVATE: "bg-yellow-100 text-yellow-700",
      ARCHIVED: "bg-gray-100 text-gray-400",
    };
    const label: Record<string, string> = {
      PUBLISHED: "已发布",
      DRAFT: "草稿",
      PRIVATE: "私密",
      ARCHIVED: "已归档",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || ""}`}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 + 操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-dark">文章管理</h1>
          <p className="text-sm text-zinc-500 mt-1">共 {total} 篇文章</p>
        </div>
        <button
          onClick={() => router.push("/articles/new")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> 写文章
        </button>
      </div>

      {/* 操作错误提示 */}
      {deleteError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 animate-fade-in flex items-center justify-between">
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-400 hover:text-red-600 text-xs"
          >
            关闭
          </button>
        </div>
      )}

      {/* 筛选 + 搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-zinc-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="搜索文章标题..."
            className="flex-1 border-0 bg-transparent text-sm outline-none placeholder-zinc-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none focus:border-primary"
          >
            <option value="">全部状态</option>
            <option value="PUBLISHED">已发布</option>
            <option value="DRAFT">草稿</option>
            <option value="PRIVATE">私密</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </div>
      </div>

      {/* 文章表格 */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <th className="px-5 py-3">标题</th>
              <th className="px-5 py-3 w-20">状态</th>
              <th className="px-5 py-3 w-20">阅读</th>
              <th className="px-5 py-3 w-36">更新日期</th>
              <th className="px-5 py-3 w-28 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-zinc-400">
                  加载中...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-zinc-400">
                  暂无文章，快去
                  <a href="/articles/new" className="text-primary hover:underline mx-1">写一篇</a>
                  吧！
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-neutral-dark truncate max-w-md">
                      {article.title}
                    </div>
                    {article.summary && (
                      <div className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
                        {article.summary}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">{statusBadge(article.status)}</td>
                  <td className="px-5 py-3 text-zinc-500">{article.viewCount}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">
                    {article.updatedAt
                      ? new Date(article.updatedAt).toLocaleDateString("zh-CN")
                      : "--"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/articles/${article.id}`)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-primary transition-colors"
                        title="编辑"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
