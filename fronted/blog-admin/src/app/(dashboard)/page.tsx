"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  ArrowRight,
  Activity,
  ChevronRight
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
    setFormattedDate(`今天是 ${month}月${date}日 ${dayOfWeek}`);

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

    // 随机语录
    try {
      const randomIndex = Math.floor(Math.random() * INSIGHT_QUOTES.length);
      setQuote(INSIGHT_QUOTES[randomIndex] || INSIGHT_QUOTES[0]);
    } catch {
      // 优雅防错
    }
  }, []);

  useEffect(() => {
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
      controller.abort();
    };
  }, []);

  const statCards = [
    { 
      label: "文章总数", 
      value: stats?.articleCount ?? 0, 
      icon: FileText, 
      iconColor: "text-indigo-500",
      trend: "本月新增", 
      trendColor: "text-emerald-500"
    },
    { 
      label: "评论总数", 
      value: stats?.commentCount ?? 0, 
      icon: MessageSquare, 
      iconColor: "text-orange-500",
      trend: "今日新增", 
      trendColor: "text-orange-500" 
    },
    { 
      label: "累计访问", 
      value: stats?.totalViews ?? 0, 
      icon: Eye, 
      iconColor: "text-blue-500",
      trend: "全站累计", 
      trendColor: "text-emerald-500"
    },
    { 
      label: "活跃用户数", 
      value: stats?.subscriberCount ?? 0, 
      icon: Users, 
      iconColor: "text-amber-500",
      trend: "持续增长", 
      trendColor: "text-emerald-500"
    },
  ];

  return (
    <div className="space-y-3 font-sans text-zinc-800 dark:text-zinc-200 text-left">
      
      {/* 顶部极简整合式横幅：完全平铺无卡片背景 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800/80 gap-3">
        <div className="flex flex-col gap-0.5 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              {greeting}，可梵
            </h1>
            <span className="text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
              {formattedDate}
            </span>
          </div>
          
          {/* 金句一句话平铺 */}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 flex items-center flex-wrap gap-1 leading-none">
            <span className="text-zinc-350 dark:text-zinc-600 select-none">“</span>
            <span>{quote.text}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              —— {quote.author} {quote.source}
            </span>
          </p>
        </div>
        
        {/* 系统实时微件状态（扁平化胶囊） */}
        <div className="flex items-center gap-2.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-50/60 dark:bg-zinc-900/30 px-2 py-1 rounded border border-zinc-200/50 dark:border-zinc-800/60 shadow-none shrink-0 self-start md:self-center">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>API: {stats?.systemMetrics?.apiDelay ?? 14}ms</span>
          </div>
          <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>CPU: {stats?.systemMetrics?.cpuUsage ?? "0.0"}%</div>
          <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>JVM: {stats?.systemMetrics?.memoryUsage ?? "0.0"}%</div>
        </div>
      </div>

      {/* 大工业网格分割面板 (全扁平，去卡片，0 shadow，仅极细内边框) */}
      <div className="w-full border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800/80 bg-white dark:bg-zinc-950">
        
        {/* 1. 四大核心指标横幅（极细分栏） */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800/80">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 animate-pulse flex flex-col gap-1.5">
                <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800/80 bg-zinc-50/10 dark:bg-zinc-950/20">
            {statCards.map((card) => (
              <div key={card.label} className="p-3 flex items-center justify-between hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors duration-150">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                      {card.value}
                    </span>
                    <span className={cn("text-[8px] font-bold", card.trendColor)}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={cn("p-1.5 rounded text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50", card.iconColor)}>
                  <card.icon size={13} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. 分析展示层（流量趋势与内容健康舱并排） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/80">
          
          {/* 左侧：流量大底座图表舱 */}
          <div className="lg:col-span-8 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="w-1 h-2.5 bg-indigo-500 rounded-xs" />
                主站流量统计与 7 日访问趋势
              </h3>
              <span className="text-[8px] border border-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider leading-none">
                LIVE METRICS
              </span>
            </div>
            
            {/* 嵌入高颜值发光折线图组件 */}
            <div className="w-full py-1">
              <TrafficTrendChart data={stats?.trafficTrend || []} loading={loading} />
            </div>
          </div>

          {/* 右侧：博客内容健康度与空闲空间（3环圆形指示器） */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-between gap-3 bg-zinc-50/10 dark:bg-zinc-950/20">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="w-1 h-2.5 bg-emerald-500 rounded-xs" />
                主站内容健康度与物理空间
              </h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">实时检测并聚合核心业务归档率与审核状况</p>
            </div>

            {/* 3圆进度盘并列 */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {[
                { 
                  label: "文章规整率", 
                  val: `${stats?.aiStorageMetrics?.tokenBalance ?? 100.0}%`, 
                  color: "text-indigo-500", 
                  percent: stats?.aiStorageMetrics?.tokenBalance ?? 100.0 
                },
                { 
                  label: "正常评论率", 
                  val: `${stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0}%`, 
                  color: "text-emerald-500", 
                  percent: stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0 
                },
                { 
                  label: "空间空余率", 
                  val: `${stats?.aiStorageMetrics?.storageFree ?? 75.0}%`, 
                  color: "text-blue-500", 
                  percent: stats?.aiStorageMetrics?.storageFree ?? 75.0 
                },
              ].map((ring) => (
                <div key={ring.label} className="flex flex-col items-center gap-1 text-center select-none">
                  <div className="relative flex items-center justify-center w-11 h-11">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="2.2" className="text-zinc-100 dark:text-zinc-900" fill="transparent" />
                      <circle 
                        cx="22" 
                        cy="22" 
                        r="18" 
                        stroke="currentColor" 
                        strokeWidth="2.8" 
                        className={ring.color} 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - ring.percent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-mono font-black text-zinc-700 dark:text-zinc-300">{ring.val}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold tracking-tight">{ring.label}</span>
                </div>
              ))}
            </div>

            {/* 一体化极简状态底栏：去多余背景底座 */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 pt-2 flex items-center justify-between text-[9px] font-medium font-mono select-none">
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                <Activity size={10} className="text-indigo-500 animate-pulse" />
                <span>DB & CLOUD STORAGE STATUS:</span>
              </div>
              <span className="font-bold text-emerald-500 uppercase">NORMAL</span>
            </div>
          </div>
        </div>

        {/* 3. 数据列表与快捷通道（近期文章与命令面板并排） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/80">
          
          {/* 左下：近期博文动态与热度统计 */}
          <div className="lg:col-span-8 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="w-1 h-2.5 bg-amber-500 rounded-xs" />
                近期博文发布动态与浏览热度
              </h3>
              <Link href="/articles" className="text-[9px] text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5 font-bold tracking-wider uppercase leading-none">
                管理列表 <ChevronRight size={10} />
              </Link>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-500 text-[8px] uppercase font-mono tracking-widest">
                    <th className="pb-1.5 font-extrabold">博文标题</th>
                    <th className="pb-1.5 font-extrabold text-center">状态</th>
                    <th className="pb-1.5 font-extrabold text-right">浏览量 (PV)</th>
                    <th className="pb-1.5 font-extrabold text-right">发布时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/40">
                  {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                    stats.recentArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors duration-100">
                        <td className="py-1.5 font-medium text-zinc-800 dark:text-zinc-250 max-w-[280px] truncate text-[11px]">
                          {article.title}
                        </td>
                        <td className="py-1.5 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-1.25 py-0.25 rounded",
                            article.status === "PUBLISHED" 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900/60 dark:text-zinc-500"
                          )}>
                            {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                          </span>
                        </td>
                        <td className="py-1.5 text-right font-mono font-bold text-zinc-600 dark:text-zinc-400 text-[11px]">
                          {article.viewCount}
                        </td>
                        <td className="py-1.5 text-right text-zinc-400 dark:text-zinc-500 font-mono text-[9px]">
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("zh-CN")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400 text-[10px] font-mono">
                        NO ARTICLES FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右下：微型按键控制命令栏 */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-between gap-4 bg-zinc-50/10 dark:bg-zinc-950/20">
            <div>
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-550 flex items-center gap-1.5 uppercase tracking-widest mb-2.5">
                <span className="w-1 h-2.5 bg-red-500 rounded-xs" />
                系统快速命令按键矩阵
              </h3>
              
              {/* 高频一体化指令组，平铺仅留细边 */}
              <div className="flex flex-col gap-1">
                {[
                  { label: "撰写新文章", key: "W", path: "/articles/new", desc: "Markdown 创作" },
                  { label: "配置场景热区", key: "E", path: "/scenes", desc: "主视觉 Sprite" },
                  { label: "审核读者评论", key: "C", path: "/comments", desc: "审核与审核反馈" },
                  { label: "静态媒体图库", key: "M", path: "/media", desc: "MinIO 图床" },
                  { label: "配置系统偏好", key: "S", path: "/settings", desc: "社交配置" }
                ].map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between px-2 py-1.5 rounded border border-zinc-200/60 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 hover:border-indigo-500/30 hover:bg-indigo-50/5 dark:hover:bg-indigo-500/5 transition-all duration-150 group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-350 group-hover:text-indigo-500 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-550 font-medium">{item.desc}</span>
                    </div>
                    <kbd className="inline-flex h-4 items-center rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1 font-mono text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500 select-none shadow-xs group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                      {item.key}
                    </kbd>
                  </a>
                ))}
              </div>
            </div>

            {/* 胶囊状态提示 */}
            <div className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed bg-white/40 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/60 p-2 rounded flex items-start gap-1.5 font-medium select-none">
              <span className="text-indigo-500 shrink-0 font-bold">ℹ</span>
              <span>工作台以一式分割网格集中承载统计指标，您可以利用侧边栏与快捷 Kbd 快速进行博文运维。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
