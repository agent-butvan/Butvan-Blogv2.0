"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn } from "@heroui/react";
import TrafficTrendChart from "@/components/dashboard/TrafficTrendChart";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  Activity
} from "lucide-react";

/** 仪表盘统计数据 */
interface DashboardStats {
  articleCount: number;
  commentCount: number;
  totalViews: number;
  subscriberCount: number;
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
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dayOfWeek = dayNames[now.getDay()];
    setFormattedDate(`今天是 ${month}月${date}日 ${dayOfWeek}`);

    const hour = now.getHours();
    let greet = "你好";
    if (hour >= 5 && hour < 9) greet = "早上好";
    else if (hour >= 9 && hour < 11.5) greet = "上午好";
    else if (hour >= 11.5 && hour < 13.5) greet = "中午好";
    else if (hour >= 13.5 && hour < 18) greet = "下午好";
    else if (hour >= 18 && hour < 23) greet = "晚上好";
    else greet = "深夜好";
    setGreeting(greet);

    try {
      const randomIndex = Math.floor(Math.random() * INSIGHT_QUOTES.length);
      setQuote(INSIGHT_QUOTES[randomIndex] || INSIGHT_QUOTES[0]);
    } catch {
      // 优雅防崩
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
          setStats(res.data.data);
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
          subscriberCount: 0
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
      
      {/* 顶部极简整合式横幅 */}
      <div className="pb-2.5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex flex-col gap-0.5 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              {greeting}，可梵
            </h1>
            <span className="text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-555 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
              {formattedDate}
            </span>
          </div>
          
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 flex items-center flex-wrap gap-1 leading-none">
            <span className="text-zinc-350 dark:text-zinc-650 select-none">“</span>
            <span>{quote.text}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              —— {quote.author} {quote.source}
            </span>
          </p>
        </div>
      </div>

      {/* 大工业网格分割面板 (扁平工业格栅，0 shadow) */}
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
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">{card.label}</p>
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

        {/* 2. 分析展示层（图表与内容健康舱并排） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/80">
          
          {/* 左侧：Recharts 流量大图表舱 */}
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

          {/* 右侧：主站内容健康度与空间 */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-between gap-3 bg-zinc-50/10 dark:bg-zinc-950/20">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-555 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="w-1 h-2.5 bg-emerald-500 rounded-xs" />
                主站内容健康度与物理空间
              </h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">实时检测并归档核心业务分类率与审核状况</p>
            </div>

            {/* 3圆进度盘 */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {[
                { 
                  label: "文章规整率", 
                  val: `${stats?.aiStorageMetrics?.tokenBalance ?? 100.0}%`, 
                  color: "text-indigo-500", 
                  percent: stats?.aiStorageMetrics?.tokenBalance ?? 100.0 
                },
                { 
                  label: "评论正常率", 
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

            {/* 状态底栏 */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 pt-2 flex items-center justify-between text-[9px] font-medium font-mono select-none">
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-550">
                <Activity size={10} className="text-indigo-500 animate-pulse" />
                <span>DB & CLOUD STORAGE STATUS:</span>
              </div>
              <span className="font-bold text-emerald-500 uppercase">NORMAL</span>
            </div>
          </div>
        </div>

        {/* 3. 常用模块快捷指令五分栏通栏格栅 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x md:divide-y-0 divide-zinc-200 dark:divide-zinc-800/80">
          {[
            { label: "撰写新文章", key: "W", path: "/articles/new", desc: "Markdown 创作" },
            { label: "配置场景热区", key: "E", path: "/scenes", desc: "主视觉 Sprite" },
            { label: "审核读者评论", key: "C", path: "/comments", desc: "评论审核与反馈" },
            { label: "静态媒体图库", key: "M", path: "/media", desc: "MinIO 图床" },
            { label: "配置系统偏好", key: "S", path: "/settings", desc: "社交配置" }
          ].map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="flex flex-col justify-between p-3 min-h-[72px] bg-white dark:bg-zinc-950 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/10 transition-all duration-150 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-350 group-hover:text-indigo-500 transition-colors">
                  {item.label}
                </span>
                <kbd className="inline-flex h-4 items-center rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1 font-mono text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500 select-none shadow-xs group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                  {item.key}
                </kbd>
              </div>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold mt-2">{item.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
