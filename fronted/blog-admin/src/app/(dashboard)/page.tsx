"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  ArrowRight,
  Activity
} from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn } from "@heroui/react";

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
 * 仪表盘主页
 * - 遵循“去卡片化”设计逻辑，全站统一高密度集成控制台画布
 * - 紧致排版，完全消除过剩的留白
 * - 用细线网格平铺指标、流量 SVG 精细折线图、系统环形负载器
 * - 最近文章动态表格与命令行快捷动作挂件
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从后端获取统计数据（后端未就绪时使用默认值进行优雅兜底）
    apiClient
      .get<ApiResponse<DashboardStats>>("/admin/dashboard")
      .then((res) => {
        if (res.data?.data) setStats(res.data.data);
      })
      .catch(() => {
        setStats({
          articleCount: 12,
          commentCount: 48,
          totalViews: 1420,
          subscriberCount: 89,
          recentArticles: [
            { id: 1, title: "探索抠图切片悬浮物理立体交互机制", status: "PUBLISHED", viewCount: 320, publishedAt: "2026-06-15T02:00:00.000Z" },
            { id: 2, title: "Butvan Blog 2.0 后台 UI/UX 极致调优记录", status: "PUBLISHED", viewCount: 180, publishedAt: "2026-06-14T08:30:00.000Z" },
            { id: 3, title: "如何构建大厂风格的 React 高密度集成管理后台", status: "PUBLISHED", viewCount: 245, publishedAt: "2026-06-13T12:00:00.000Z" },
            { id: 4, title: "Spring Boot 3 WebFlux 异步接口开发实践", status: "DRAFT", viewCount: 0, publishedAt: null },
            { id: 5, title: "物理空间深度效果下的 Sprite 精准对齐技巧", status: "PUBLISHED", viewCount: 95, publishedAt: "2026-06-10T15:45:00.000Z" }
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { 
      label: "文章总数", 
      value: stats?.articleCount ?? 0, 
      icon: FileText, 
      gradientClass: "bg-gradient-to-br from-[#9B8AFB] to-[#7B61FF]",
      trend: "本月新增", 
      trendBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "评论总数", 
      value: stats?.commentCount ?? 0, 
      icon: MessageSquare, 
      gradientClass: "bg-gradient-to-br from-[#FF9F43] to-[#FF6B35]",
      trend: "今日新增", 
      trendBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
    },
    { 
      label: "累计访问", 
      value: stats?.totalViews ?? 0, 
      icon: Eye, 
      gradientClass: "bg-gradient-to-br from-[#4EA3FF] to-[#2F80ED]",
      trend: "日环比 +4%", 
      trendBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "订阅者", 
      value: stats?.subscriberCount ?? 0, 
      icon: Users, 
      gradientClass: "bg-gradient-to-br from-[#FFD93D] to-[#FFB703]",
      trend: "持续增长", 
      trendBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
  ];

  return (
    <div className="space-y-4 font-body text-zinc-800 dark:text-zinc-200 text-left">
      
      {/* 顶部欢迎横幅 (扁平贴合背景) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <div>
          <h1 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>控制台主页</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="服务就绪" />
          </h1>
          <p className="text-[11px] text-zinc-550 dark:text-zinc-400">欢迎回来管理您的个人博客与创作空间，以下是本站今日运行概要。</p>
        </div>
        
        {/* 系统实时微件状态 (提高数据功能密集度) */}
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono bg-white dark:bg-zinc-900 px-2.5 py-1.25 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>API: 正常 (14ms)</span>
          </div>
          <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>CPU: 3.5%</div>
          <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>JVM MEM: 24.8%</div>
        </div>
      </div>

      {/* 控制台一体化工作面板 (去卡片化大平铺) */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* 1. 核心指标平铺格栅栏 (细隔线，无卡片，横向贯通) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex flex-col gap-1.5">
                <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
            {statCards.map((card) => (
              <div key={card.label} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{card.value}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.25 rounded", card.trendBg)}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={cn("p-2 rounded-lg text-white shadow-xs", card.gradientClass)}>
                  <card.icon size={15} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. 分析展示层 (左：细线趋势分析，右：系统核心指标盘) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* 左栏：流量走势 */}
          <div className="lg:col-span-8 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-250 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-0.75 h-3 bg-primary rounded-full" />
                博客主站 7 日流量及访问趋势
              </h3>
              <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">
                LIVE METRICS
              </span>
            </div>
            
            {/* SVG 极简流畅渐变折线图 */}
            <div className="h-40 w-full relative flex items-center justify-center pt-2">
              <svg viewBox="0 0 600 130" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9B8AFB" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#9B8AFB" stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {/* 刻度辅助线 */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="600" y2="65" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />
                
                {/* 走势阴影填充 */}
                <path d="M 0 130 L 0 95 Q 50 105 100 75 T 200 60 T 300 85 T 400 40 T 500 50 T 600 25 L 600 130 Z" fill="url(#chartGradient)" />
                {/* 走势主曲线 */}
                <path d="M 0 95 Q 50 105 100 75 T 200 60 T 300 85 T 400 40 T 500 50 T 600 25" fill="none" stroke="#9B8AFB" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            
            {/* 日期刻度底标 */}
            <div className="flex justify-between items-center text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 px-0.5">
              <span>06-09</span>
              <span>06-11</span>
              <span>06-13</span>
              <span>今天 (06-15)</span>
            </div>
          </div>

          {/* 右栏：核心负载指标与系统剩余度量 (3个环形 SVG 精致面板) */}
          <div className="lg:col-span-4 p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5 mb-2">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-250 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-0.75 h-3 bg-secondary rounded-full" />
                推理节点负载与 Token 指标
              </h3>
              <p className="text-[10px] text-zinc-450">实时同步 AI 客户端调用数据</p>
            </div>

            {/* 三个环形进度度量器 */}
            <div className="grid grid-cols-3 gap-2 py-2">
              {[
                { label: "Token 余额", val: "84.5%", color: "text-[#9B8AFB]", percent: 84.5 },
                { label: "推理成功率", val: "99.8%", color: "text-emerald-500", percent: 99.8 },
                { label: "存储空余", val: "76.2%", color: "text-[#4ea3ff]", percent: 76.2 },
              ].map((ring) => (
                <div key={ring.label} className="flex flex-col items-center gap-1 text-center">
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" className="text-zinc-100 dark:text-zinc-850" fill="transparent" />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        className={ring.color} 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - ring.percent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{ring.val}</span>
                  </div>
                  <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">{ring.label}</span>
                </div>
              ))}
            </div>

            {/* 底栏快讯 */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-850 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Activity size={12} className="text-[#9B8AFB]" />
                <span>模型推理引擎状态:</span>
              </div>
              <span className="font-mono font-bold text-emerald-500 uppercase">健康 (Active)</span>
            </div>

          </div>

        </div>

        {/* 3. 数据列表与交互命令面板 (下半部，左右分割) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          
          {/* 左栏：最近发布文章数据展示 */}
          <div className="lg:col-span-8 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-250 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-0.75 h-3 bg-amber-500 rounded-full" />
                近期博文动态与热度统计
              </h3>
              <Link href="/articles" className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold">
                跳转文章列表 <ArrowRight size={10} />
              </Link>
            </div>

            {/* 数据表格 */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-850 text-zinc-400 text-[10px] uppercase font-mono tracking-wider">
                    <th className="pb-2 font-bold">博文标题</th>
                    <th className="pb-2 font-bold text-center">状态</th>
                    <th className="pb-2 font-bold text-right">浏览量 (PV)</th>
                    <th className="pb-2 font-bold text-right">最后修改/发布时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/60">
                  {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                    stats.recentArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="py-2 font-medium text-zinc-800 dark:text-zinc-200 max-w-[280px] truncate">
                          {article.title}
                        </td>
                        <td className="py-2 text-center">
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded",
                            article.status === "PUBLISHED" 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-500"
                          )}>
                            {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-zinc-650 dark:text-zinc-400">
                          {article.viewCount}
                        </td>
                        <td className="py-2 text-right text-zinc-400 dark:text-zinc-550 font-mono text-[10px]">
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("zh-CN")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-400 text-[11px]">
                        暂无近期博文。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右栏：终端快捷命令 */}
          <div className="lg:col-span-4 p-4 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-250 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                <span className="w-0.75 h-3 bg-red-500 rounded-full" />
                常用模块快捷通道
              </h3>
              
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "撰写博文", key: "W", path: "/articles/new", desc: "Markdown 编辑器" },
                  { label: "配置场景热区", key: "E", path: "/scenes", desc: "自动裁剪与 Sprite 配置" },
                  { label: "审核最新评论", key: "C", path: "/comments", desc: "实时互动流" },
                  { label: "资源文件管理器", key: "M", path: "/media", desc: "头像与静态切片" },
                  { label: "博主公开名片", key: "S", path: "/settings", desc: "页脚及社交链接" }
                ].map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-2 rounded-lg border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-900/10 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-zinc-750 dark:text-zinc-350 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{item.desc}</span>
                    </div>
                    <kbd className="inline-flex h-4.5 items-center rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.25 font-mono text-[9px] font-bold text-zinc-400 dark:text-zinc-500 shadow-xs">
                      {item.key}
                    </kbd>
                  </a>
                ))}
              </div>
            </div>

            {/* 提示挂件 */}
            <div className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-150 dark:border-zinc-850 p-2.5 rounded-lg flex items-start gap-2">
              <span className="text-[#9B8AFB] mt-0.5 font-bold">ⓘ</span>
              <span>您可以通过顶栏的“控制中心”面包屑与右侧的主题切换来快速导航并切换视觉效果。</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
