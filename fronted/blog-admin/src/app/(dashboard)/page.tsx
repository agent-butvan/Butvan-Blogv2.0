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
import TrafficTrendChart from "@/components/dashboard/TrafficTrendChart";

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
  systemMetrics?: {
    cpuUsage: number;
    memoryUsage: number;
    apiDelay: number;
  };
  aiStorageMetrics?: {
    tokenBalance: number;
    inferenceSuccessRate: number;
    storageFree: number;
  };
  trafficTrend?: Array<{
    date: string;
    pv: number;
  }>;
}

// 经典人文与极客名言语录库
const INSIGHT_QUOTES = [
  { text: "你的选择，毫无意义。", author: "TOBY FOX", source: "《DELTARUNE》" },
  { text: "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。", author: "罗曼·罗兰", source: "《米开朗基罗传》" },
  { text: "Stay Hungry, Stay Foolish.", author: "STEVE JOBS", source: "Stanford Speech" },
  { text: "所有的伟大，都源于一个勇敢的开始。", author: "凯文·凯利", source: "《失控》" },
  { text: "人生的终极价值在于觉醒和思考的能力，而不只在于生存。", author: "亚里士多德", source: "《形而上学》" },
  { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采", source: "《查拉图斯特拉如是说》" },
  { text: "给时光以生命，而不是给生命以时光。", author: "帕斯卡", source: "《思想录》" },
  { text: "代码就是诗歌，需要用心去雕琢。", author: "WordPress", source: "Slogan" }
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "你的选择，毫无意义。", author: "TOBY FOX", source: "《DELTARUNE》" });

  useEffect(() => {
    // 动态生成日期
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dayOfWeek = dayNames[now.getDay()];
    setFormattedDate(`今天是${month}月${date}日${dayOfWeek}`);

    // 动态生成问候语
    const hour = now.getHours();
    let greet = "你好";
    if (hour >= 5 && hour < 9) greet = "早上好";
    else if (hour >= 9 && hour < 11.5) greet = "上午好";
    else if (hour >= 11.5 && hour < 13.5) greet = "中午好";
    else if (hour >= 13.5 && hour < 18) greet = "下午好";
    else if (hour >= 18 && hour < 23) greet = "晚上好";
    else greet = "深夜好";
    setGreeting(greet);

    // 随机名言语录
    try {
      const randomIndex = Math.floor(Math.random() * INSIGHT_QUOTES.length);
      setQuote(INSIGHT_QUOTES[randomIndex] || INSIGHT_QUOTES[0]);
    } catch {
      // 优雅防崩
    }
  }, []);

  useEffect(() => {
    // 使用 AbortController 规避 React 18 StrictMode 开发环境下组件双挂载导致的重复网络请求
    const controller = new AbortController();
    
    apiClient
      .get<ApiResponse<DashboardStats>>("/admin/dashboard", {
        signal: controller.signal
      })
      .then((res) => {
        if (res.data?.data) {
          const data = res.data.data;
          const transformedData: DashboardStats = {
            ...data,
            recentArticles: data.recentArticles?.map(article => ({
              ...article,
              publishedAt: article.publishedAt
                ? new Date(article.publishedAt).toISOString()
                : null
            })) || []
          };
          setStats(transformedData);
        }
      })
      .catch((err) => {
        // 若为取消请求错误，则静默忽略不设置 loading 和 stats
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          return;
        }
        console.error('获取工作台数据失败:', err);
        setStats({
          articleCount: 0,
          commentCount: 0,
          totalViews: 0,
          subscriberCount: 0,
          recentArticles: []
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      // 组件卸载（或者是 StrictMode 重复初始化）时，立刻取消上一次请求
      controller.abort();
    };
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
      trend: "全站累计", 
      trendBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "活跃用户数", 
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
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          {/* 日期小字 */}
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-555 tracking-wider">
            {formattedDate || "今天是6月21日星期日"}
          </span>
          
          {/* 主欢迎词与金句并排 */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 mt-1">
            {/* 欢迎语 */}
            <div className="relative pb-1 shrink-0">
              <h1 className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                {greeting || "上午好"}，可梵
              </h1>
              {/* 优雅极简的装饰底线 */}
              <span className="absolute bottom-0 left-0 w-1/2 h-[2px] bg-primary rounded-full" />
            </div>
            
            {/* 文艺金句栏 */}
            <div className="flex items-center gap-1.5 pl-3 sm:pl-0 sm:border-l border-zinc-200 dark:border-zinc-850 sm:h-4.5 mt-0.5 sm:mt-0">
              {/* 大双引号装饰图 */}
              <div className="relative select-none opacity-20 shrink-0 ml-1">
                <span className="font-serif text-2xl leading-none absolute -top-3.5 -left-1 text-zinc-400 dark:text-zinc-600">“</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal pl-3 flex items-center flex-wrap gap-1">
                <span>{quote.text}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-555 font-medium tracking-wide">
                  —— {quote.author} {quote.source}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* 系统实时微件状态 */}
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-555 font-mono bg-white dark:bg-zinc-900/50 px-2.5 py-1.25 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-xs shrink-0 self-start md:self-end">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>API: 正常 ({stats?.systemMetrics?.apiDelay ?? 14}ms)</span>
          </div>
          <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>CPU: {stats?.systemMetrics?.cpuUsage ?? "0.0"}%</div>
          <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>JVM MEM: {stats?.systemMetrics?.memoryUsage ?? "0.0"}%</div>
        </div>
      </div>

      {/* 控制台一体化工作面板 (去卡片化大平铺) */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* 1. 核心指标平铺格栅栏 */}
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
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">{card.label}</p>
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

        {/* 2. 分析展示层 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* 左栏：流量走势 (挂载新图表组件) */}
          <div className="lg:col-span-8 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-0.75 h-3 bg-primary rounded-full" />
                博客主站 7 日流量及访问趋势
              </h3>
              <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">
                LIVE METRICS
              </span>
            </div>
            
            {/* 封装后的高颜值交互图表组件 */}
            <TrafficTrendChart data={stats?.trafficTrend || []} loading={loading} />
          </div>

          {/* 右栏：博客内容健康度与存储指标 (3个环形 SVG 精致面板) */}
          <div className="lg:col-span-4 p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5 mb-2">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-0.75 h-3 bg-secondary rounded-full" />
                博客内容健康度与存储指标
              </h3>
              <p className="text-[10px] text-zinc-400">实时同步内容整理及服务空间空闲状态</p>
            </div>

            {/* 三个环形进度度量器 (动态计算偏移) */}
            <div className="grid grid-cols-3 gap-2 py-2">
              {[
                { 
                  label: "文章分类规整率", 
                  val: `${stats?.aiStorageMetrics?.tokenBalance ?? 100.0}%`, 
                  color: "text-[#9B8AFB]", 
                  percent: stats?.aiStorageMetrics?.tokenBalance ?? 100.0 
                },
                { 
                  label: "评论正常通过率", 
                  val: `${stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0}%`, 
                  color: "text-emerald-500", 
                  percent: stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0 
                },
                { 
                  label: "存储空间空闲率", 
                  val: `${stats?.aiStorageMetrics?.storageFree ?? 75.0}%`, 
                  color: "text-[#4ea3ff]", 
                  percent: stats?.aiStorageMetrics?.storageFree ?? 75.0 
                },
              ].map((ring) => (
                <div key={ring.label} className="flex flex-col items-center gap-1 text-center">
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" className="text-zinc-100 dark:text-zinc-800" fill="transparent" />
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
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-555 font-semibold">{ring.label}</span>
                </div>
              ))}
            </div>

            {/* 底栏快讯 */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Activity size={12} className="text-[#9B8AFB]" />
                <span>数据库与物理空间状态:</span>
              </div>
              <span className="font-mono font-bold text-emerald-500 uppercase">运行良好 (Normal)</span>
            </div>
          </div>
        </div>

        {/* 3. 数据列表与交互命令面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          
          {/* 左栏：最近发布文章数据展示 */}
          <div className="lg:col-span-8 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
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
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[10px] uppercase font-mono tracking-wider">
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
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-555"
                          )}>
                            {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-zinc-650 dark:text-zinc-400">
                          {article.viewCount}
                        </td>
                        <td className="py-2 text-right text-zinc-400 dark:text-zinc-555 font-mono text-[10px]">
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
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider mb-3">
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
                    className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-555">{item.desc}</span>
                    </div>
                    <kbd className="inline-flex h-4.5 items-center rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.25 font-mono text-[9px] font-bold text-zinc-400 dark:text-zinc-555 shadow-xs">
                      {item.key}
                    </kbd>
                  </a>
                ))}
              </div>
            </div>

            {/* 提示挂件 */}
            <div className="text-[10px] text-zinc-400 dark:text-zinc-555 leading-normal bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg flex items-start gap-2">
              <span className="text-[#9B8AFB] mt-0.5 font-bold">ⓘ</span>
              <span>您可以通过顶栏的“控制中心”面包屑与右侧的主题切换来快速导航并切换视觉效果。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
