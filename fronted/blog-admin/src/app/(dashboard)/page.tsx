"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  ArrowRight,
  Activity,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Columns4,
  Plus
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
  noteCount: number;
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
  const router = useRouter();
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
    setFormattedDate(`${month}月${date}日 ${dayOfWeek}`);

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

    // 随机名言
    try {
      const randomIndex = Math.floor(Math.random() * INSIGHT_QUOTES.length);
      setQuote(INSIGHT_QUOTES[randomIndex] || INSIGHT_QUOTES[0]);
    } catch {
      // 优雅防崩
    }
  }, []);

  // 绑定快捷键，支持 W/E/C/M/S 快速导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true")) {
        return;
      }
      const key = e.key.toLowerCase();
      switch (key) {
        case "w":
          router.push("/articles/new");
          break;
        case "e":
          router.push("/scenes");
          break;
        case "c":
          router.push("/comments");
          break;
        case "m":
          router.push("/media");
          break;
        case "s":
          router.push("/settings");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

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
          noteCount: 0,
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
      iconColor: "text-blue-650 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
    },
    { 
      label: "评论总数", 
      value: stats?.commentCount ?? 0, 
      icon: MessageSquare, 
      iconColor: "text-pink-650 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30"
    },
    { 
      label: "累计访问量", 
      value: stats?.totalViews ?? 0, 
      icon: Eye, 
      iconColor: "text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
    },
    { 
      label: "手记总数", 
      value: stats?.noteCount ?? 0, 
      icon: Users, 
      iconColor: "text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 p-4 sm:p-6 -m-4 sm:-m-6 font-sans text-zinc-800 dark:text-zinc-200 transition-colors duration-200 text-left">
      
      {/* 1. NextUI Header 横幅带胶囊 CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-zinc-200/50 dark:border-zinc-850 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-550 tracking-tight leading-none">
            {greeting}，可梵
          </h1>
          {/* 金句极简一行 */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center flex-wrap gap-1 leading-none font-medium mt-0.5">
            <span>{quote.text}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-normal">
              —— {quote.author} {quote.source}
            </span>
          </p>
        </div>

        {/* 交互右侧控制栏 */}
        <div className="flex items-center flex-wrap gap-3.5">
          <div className="flex items-center gap-2">
            {/* 时间指示标签 */}
            <span className="hidden sm:inline-block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 px-2.5 py-1.5 rounded-xl shadow-xs">
              {formattedDate}
            </span>
            
            {/* NextUI Invite 蓝色高质感 CTA */}
            <Link
              href="/articles/new"
              className="bg-[#0070F3] hover:bg-[#0062D2] active:scale-95 text-white text-xs font-bold px-4 py-2.25 rounded-xl shadow-[0_4px_12px_rgba(0,112,243,0.3)] hover:shadow-[0_4px_16px_rgba(0,112,243,0.45)] transition-all duration-150 flex items-center gap-1"
            >
              <Plus size={13} strokeWidth={2.5} />
              写文章
            </Link>
          </div>
        </div>
      </div>

      {/* 主页面格栅 */}
      <div className="space-y-6">
        
        {/* 2. 四大核心指标卡片（NextUI Pro 浮空卡片） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                  {card.label}
                </span>
                <div className={cn("p-1.5 rounded-lg shrink-0", card.iconColor)}>
                  <card.icon size={13} />
                </div>
              </div>
              
              <div className="flex items-baseline justify-between mt-2.5">
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                  {loading ? "..." : card.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. 中间层：流量趋势分析卡片 & 系统与内容健康卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 左侧：Sales Performance 流量趋势卡片 */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-[#0070F3] rounded-full" />
                  Traffic Performance / 流量走势
                </h3>
                <p className="text-[10px] text-zinc-400">实时读取主站每日访问 PV 数据统计</p>
              </div>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                Last 7 Days
              </span>
            </div>

            {/* 图表舱 */}
            <div className="w-full py-1">
              <TrafficTrendChart data={stats?.trafficTrend || []} loading={loading} />
            </div>
          </div>

          {/* 右侧：健康度指标 & 系统资源监控 */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                Service Health / 系统与数据状态
              </h3>
              <p className="text-[10px] text-zinc-400">系统性能占用与内容分类审核指标</p>
            </div>

            {/* 3环形指示 */}
            <div className="grid grid-cols-3 gap-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              {[
                { 
                  label: "文章规整度", 
                  val: `${stats?.aiStorageMetrics?.tokenBalance ?? 100.0}%`, 
                  color: "text-indigo-500", 
                  percent: stats?.aiStorageMetrics?.tokenBalance ?? 100.0 
                },
                { 
                  label: "评论通过率", 
                  val: `${stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0}%`, 
                  color: "text-emerald-500", 
                  percent: stats?.aiStorageMetrics?.inferenceSuccessRate ?? 100.0 
                },
                { 
                  label: "空间空闲率", 
                  val: `${stats?.aiStorageMetrics?.storageFree ?? 75.0}%`, 
                  color: "text-blue-500", 
                  percent: stats?.aiStorageMetrics?.storageFree ?? 75.0 
                },
              ].map((ring, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center select-none">
                  <div className="relative flex items-center justify-center w-11 h-11">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="2" className="text-zinc-100 dark:text-zinc-850" fill="transparent" />
                      <circle 
                        cx="22" 
                        cy="22" 
                        r="18" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        className={ring.color} 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - ring.percent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{ring.val}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-bold tracking-tight">{ring.label}</span>
                </div>
              ))}
            </div>

            {/* 系统实时微指标 */}
            <div className="flex flex-col gap-2">
              {[
                { label: "API 响应延迟", val: `${stats?.systemMetrics?.apiDelay ?? 14} ms`, progress: 15, barColor: "bg-indigo-500" },
                { label: "物理 CPU 占用率", val: `${stats?.systemMetrics?.cpuUsage ?? "0.0"} %`, progress: stats?.systemMetrics?.cpuUsage ?? 5, barColor: "bg-[#0070F3]" },
                { label: "JVM 内存占用率", val: `${stats?.systemMetrics?.memoryUsage ?? "0.0"} %`, progress: stats?.systemMetrics?.memoryUsage ?? 35, barColor: "bg-emerald-500" }
              ].map((bar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-550">
                    <span>{bar.label}</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{bar.val}</span>
                  </div>
                  <div className="h-1.25 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-300", bar.barColor)} style={{ width: `${Math.min(bar.progress, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 底层：近期文章列表卡片 & 快捷指令面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 左侧：All Articles 表格卡片 */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            
            {/* Table Header Action Bar (胶囊控制组) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-250">近期博文动态</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-200/30 font-bold font-mono">
                  {stats?.recentArticles?.length ?? 0}
                </span>
              </div>

            </div>

            {/* NextUI Grid Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[450px]">
                <thead>
                  <tr className="border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-2">博文标题</th>
                    <th className="pb-2 text-center">状态</th>
                    <th className="pb-2 text-right">浏览量 (PV)</th>
                    <th className="pb-2 text-right">发布日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/60">
                  {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                    stats.recentArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                        <td className="py-2.25 font-semibold text-zinc-700 dark:text-zinc-200 max-w-[280px] truncate text-[11.5px]">
                          {article.title}
                        </td>
                        <td className="py-2.25 text-center">
                          <span className={cn(
                            "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide",
                            article.status === "PUBLISHED" 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-zinc-100 text-zinc-450 dark:bg-zinc-950 dark:text-zinc-500"
                          )}>
                            {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                          </span>
                        </td>
                        <td className="py-2.25 text-right font-mono font-bold text-zinc-650 dark:text-zinc-400">
                          {article.viewCount}
                        </td>
                        <td className="py-2.25 text-right text-zinc-400 dark:text-zinc-550 font-mono text-[10px]">
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("zh-CN")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-400 text-[11px] font-mono">
                        NO ARTICLES RECORDED
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右侧：System Operations 快捷控制面板 */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                  Quick Access / 快捷指令
                </h3>
                <span className="text-[9px] font-bold text-zinc-400">Shortcuts</span>
              </div>
              
              <div className="flex flex-col gap-2">
                {[
                  { label: "撰写博文", key: "W", path: "/articles/new", desc: "Markdown 编辑器" },
                  { label: "配置场景热区", key: "E", path: "/scenes", desc: "Sprite 热区图裁剪" },
                  { label: "审核最新评论", key: "C", path: "/comments", desc: "互动与过滤中心" },
                  { label: "媒体资源管理器", key: "M", path: "/media", desc: "MinIO 图床管理器" },
                  { label: "博主公开名片", key: "S", path: "/settings", desc: "主页社交与页脚" }
                ].map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10 hover:border-indigo-500/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-none mt-1">{item.desc}</span>
                    </div>
                    <kbd className="inline-flex h-4.5 items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.25 font-mono text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 shadow-2xs group-hover:bg-[#0070F3] group-hover:text-white group-hover:border-[#0070F3] transition-all">
                      {item.key}
                    </kbd>
                  </a>
                ))}
              </div>
            </div>

            {/* 提示胶囊 */}
            <div className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-200/40 dark:border-zinc-800/80 p-3 rounded-xl flex items-start gap-2 shadow-3xs select-none">
              <span className="text-[#0070F3] mt-0.5 font-bold">ⓘ</span>
              <span>当前面板已升级为 NextUI Pro 微悬浮质感。您可以利用侧边栏与快捷 kbd 模块极速运维您的主站。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
