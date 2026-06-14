"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";

/** 仪表盘统计数据 */
interface DashboardStats {
  articleCount: number;
  commentCount: number;
  totalViews: number;
  subscriberCount: number;
  recentArticles: Array<{
    id: number;
    title: string;
    status: string;
    viewCount: number;
    publishedAt: string | null;
  }>;
}

/**
 * 仪表盘首页
 * - 统计卡片（文章/评论/访问/订阅）
 * - 最近文章列表 + 快捷入口
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从后端获取统计数据（后端未就绪时使用默认值）
    apiClient
      .get<ApiResponse<DashboardStats>>("/admin/dashboard")
      .then((res) => {
        if (res.data?.data) setStats(res.data.data);
      })
      .catch(() => {
        setStats({
          articleCount: 0,
          commentCount: 0,
          totalViews: 0,
          subscriberCount: 0,
          recentArticles: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "文章总数", value: stats?.articleCount ?? "--", icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "评论总数", value: stats?.commentCount ?? "--", icon: MessageSquare, color: "text-green-600 bg-green-50" },
    { label: "累计访问", value: stats?.totalViews ?? "--", icon: Eye, color: "text-purple-600 bg-purple-50" },
    { label: "订阅者", value: stats?.subscriberCount ?? "--", icon: Users, color: "text-orange-600 bg-orange-50" },
  ];

  // 通用的卡片容器样式
  const cardClass = "rounded-xl bg-white border border-zinc-100 shadow-sm";

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-neutral-dark">仪表盘</h1>
        <p className="mt-1 text-sm text-zinc-500">欢迎回到可梵博客管理后台</p>
      </div>

      {/* 统计卡片区 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${cardClass} p-6 animate-pulse`}>
              <div className="h-4 w-20 bg-zinc-200 rounded mb-3" />
              <div className="h-8 w-12 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-neutral-dark">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 最近文章 + 快捷入口 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近文章 */}
        <div className={`${cardClass} lg:col-span-2 p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-neutral-dark flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              最近文章
            </h3>
            <a href="/articles" className="text-sm text-primary hover:underline flex items-center gap-1">
              查看全部 <ArrowRight size={14} />
            </a>
          </div>

          {stats?.recentArticles && stats.recentArticles.length > 0 ? (
            <div className="space-y-3">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-dark truncate">{article.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {article.publishedAt
                        ? `发布於 ${new Date(article.publishedAt).toLocaleDateString("zh-CN")}`
                        : "草稿"}
                      · {article.viewCount} 次阅读
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${article.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 py-8 text-center">
              暂无文章，快去<a href="/articles/new" className="text-primary hover:underline mx-1">写一篇</a>吧！
            </p>
          )}
        </div>

        {/* 快捷入口 */}
        <div className={`${cardClass} p-6`}>
          <h3 className="font-heading font-semibold text-neutral-dark mb-4">快捷操作</h3>
          <div className="space-y-2">
            {[
              { label: "写文章", path: "/articles/new" },
              { label: "管理评论", path: "/comments" },
              { label: "上传媒体", path: "/media" },
              { label: "编辑场景", path: "/scenes" },
              { label: "系统设置", path: "/settings" },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-150"
              >
                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
                <ArrowRight size={14} className="text-zinc-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
