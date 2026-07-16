"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Eye,
  Users,
  Plus,
  ArrowRight,
  Zap
} from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn } from "@heroui/react";
import TrafficTrendChart from "@/components/dashboard/TrafficTrendChart";
import type { ApiLogItem } from "@/types/api-log";

/** 仪表盘统计数据 */
interface DashboardStats {
  articleCount: number;
  commentCount: number;
  totalViews: number;
  noteCount: number;
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

  // 实时 API 日志列表（保存最新 8 条）
  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 实时脉冲波形图（保持 15 个点）
  const [pulseData, setPulseData] = useState<number[]>([15, 35, 10, 45, 20, 60, 15, 30, 25, 70, 12, 38, 55, 22, 45]);
  const [pulseIndex, setPulseIndex] = useState(0);

  // 用来产生实时闪烁动效的指示
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

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

  // 拉取主仪表盘指标
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
          noteCount: 0
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

  // 1. 初始化拉取最近日志做占位
  // 2. 建立与后端的 WebSocket 连接
  useEffect(() => {
    // 拉取初始化日志
    apiClient.get<ApiResponse<{ records: ApiLogItem[] }>>("/admin/api-logs", {
      params: { page: 1, size: 8 }
    }).then((res) => {
      if (res.data?.data?.records) {
        setApiLogs(res.data.data.records);
      }
    }).catch((err) => {
      console.error("加载初始化日志失败:", err);
    }).finally(() => {
      setLogsLoading(false);
    });

    if (typeof window === "undefined") return;

    // 建立 WS 连接
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    let url = "";
    try {
      const parsed = new URL(backendUrl);
      url = `${wsProto}://${parsed.host}/ws/admin-dashboard-monitor`;
    } catch {
      url = `${wsProto}://${window.location.host}/ws/admin-dashboard-monitor`;
    }

    const connectWs = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "api-log" && payload.data) {
            const newLog = payload.data as ApiLogItem;
            // 实时滚动：新生成的日志滑入顶部
            setApiLogs(prev => [newLog, ...prev.slice(0, 7)]);
            // 脉冲波形图向左滚动并存入最新耗时
            setPulseData(prev => [...prev.slice(1), newLog.costTime]);
            setPulseIndex(i => i + 1);
            // 激活脉冲闪烁效果
            setHasNewPulse(true);
            setTimeout(() => setHasNewPulse(false), 800);
          }
        } catch (err) {
          // 降级防崩溃
        }
      };

      ws.onclose = () => {
        // 断线 5 秒后尝试重连
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWs();
          }
        }, 5000);
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
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

  /** 根据 URI 判断请求来源并打上 Badge 标记 */
  const renderSourceBadge = (uri: string) => {
    const norm = (uri || "").toLowerCase();
    if (norm.includes("/admin/")) {
      return (
        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold px-1.5 py-0.5 rounded-md text-[8.5px] tracking-wide select-none">
          ADMIN
        </span>
      );
    }
    if (norm.includes("/weixin/")) {
      return (
        <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold px-1.5 py-0.5 rounded-md text-[8.5px] tracking-wide select-none">
          WECHAT
        </span>
      );
    }
    return (
      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-md text-[8.5px] tracking-wide select-none">
        CLIENT
      </span>
    );
  };

  /** 请求方式对应的色块配置 */
  const getMethodStyle = (method: string) => {
    const norm = (method || "").toUpperCase();
    if (norm === "GET") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (norm === "POST") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (norm === "DELETE") return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    if (norm === "PUT") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
  };

  /** 耗时延迟对应的警告样式 */
  const getCostTimeColor = (cost: number) => {
    if (cost >= 500) return "text-rose-600 dark:text-rose-400 font-bold";
    if (cost >= 200) return "text-amber-600 dark:text-amber-400 font-semibold";
    return "text-emerald-600 dark:text-emerald-400";
  };

  // 生成实时脉冲折线图的 SVG 数据坐标
  const buildSvgPath = () => {
    const width = 280;
    const height = 90;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const count = pulseData.length;
    const stepX = chartWidth / (count - 1);

    // 最大耗时映射，最小设为 120ms 防止图表太平
    const maxVal = Math.max(...pulseData, 120);

    const points = pulseData.map((val, idx) => {
      const x = padding + idx * stepX;
      // 耗时映射到 Y 轴（数值越大 Y 坐标越小，在折线图上为尖峰）
      const ratio = val / maxVal;
      const y = padding + chartHeight - ratio * chartHeight;
      return { x, y };
    });

    const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    
    // 生成闭合的填充区域
    const fillPath = `M ${points[0].x.toFixed(1)} ${height - padding} ` +
                     points.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
                     ` L ${points[points.length - 1].x.toFixed(1)} ${height - padding} Z`;

    const lastPoint = points[points.length - 1];

    return { polylinePoints, fillPath, lastPoint };
  };

  const svgData = buildSvgPath();
  const currentCostTime = pulseData[pulseData.length - 1];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 p-4 sm:p-6 -m-4 sm:-m-6 font-sans text-zinc-800 dark:text-zinc-200 transition-colors duration-200 text-left">
      
      {/* 1. NextUI Header 横幅带胶囊 CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-zinc-200/50 dark:border-zinc-850 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
            {greeting}，可梵
          </h1>
          {/* 金句极简一行 */}
          <p className="text-xs text-zinc-500 dark:text-zinc-455 flex items-center flex-wrap gap-1 leading-none font-medium mt-0.5">
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
            <span className="hidden sm:inline-block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 font-mono bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 px-2.5 py-1.5 rounded-xl shadow-xs">
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
        
        {/* 2. 四大核心指标卡片 */}
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
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-550 tracking-tight leading-none">
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
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 font-mono">
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
                    <span className="absolute text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-350">{ring.val}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-bold tracking-tight">{ring.label}</span>
                </div>
              ))}
            </div>

            {/* 系统实时微指标 */}
            <div className="flex flex-col gap-2">
              {[
                { label: "API 响应延迟", val: `${stats?.systemMetrics?.apiDelay ?? 0} ms`, progress: stats?.systemMetrics?.apiDelay ?? 15, barColor: "bg-indigo-500" },
                { label: "物理 CPU 占用率", val: `${stats?.systemMetrics?.cpuUsage ?? "0.0"} %`, progress: stats?.systemMetrics?.cpuUsage ?? 5, barColor: "bg-[#0070F3]" },
                { label: "JVM 内存占用率", val: `${stats?.systemMetrics?.memoryUsage ?? "0.0"} %`, progress: stats?.systemMetrics?.memoryUsage ?? 35, barColor: "bg-emerald-500" }
              ].map((bar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                    <span>{bar.label}</span>
                    <span className="font-mono font-bold text-zinc-850 dark:text-zinc-200">{bar.val}</span>
                  </div>
                  <div className="h-1.25 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-300", bar.barColor)} style={{ width: `${Math.min(bar.progress, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 底层：实时监控与滚动日志 + 心跳波形图的完美组合 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 左侧大面板：Live API 日志与假可视化的极致组合 */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[360px]">
            <div>
              {/* 看板头部 */}
              <div className="flex items-center justify-between mb-4.5 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">实时接口监控大屏</h3>
                  <span className="text-[8.5px] font-extrabold text-white bg-rose-500 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5 uppercase tracking-wide">
                    <Zap size={9} fill="white" />
                    WebSocket Connected
                  </span>
                </div>
                {/* 实时闪烁标志 */}
                <div className="flex items-center gap-1.5 select-none">
                  <span className="relative flex h-2 w-2">
                    <span className={cn("absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", hasNewPulse && "animate-ping")}></span>
                    <span className={cn("relative inline-flex rounded-full h-2 w-2 transition-colors duration-300", hasNewPulse ? "bg-emerald-400" : "bg-emerald-500")}></span>
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 font-mono tracking-wider">
                    REALTIME STREAMING
                  </span>
                </div>
              </div>

              {/* 上半部核心：假可视化 + 心跳波形图的物理折线 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5 items-center select-none bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-zinc-800/40 rounded-2xl p-4">
                {/* 左侧：精美心跳波形图 (SVG) */}
                <div className="md:col-span-8 flex flex-col items-center">
                  <div className="w-full relative h-24 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl shadow-2xs overflow-hidden flex items-center justify-center">
                    {/* 背景网格线 */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,112,243,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,112,243,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    <svg className="w-full h-full" viewBox="0 0 280 90" preserveAspectRatio="none">
                      <defs>
                        {/* 折线渐变 */}
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                        </linearGradient>
                        {/* 阴影渐变 */}
                        <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* 区域面积填充 */}
                      <path d={svgData.fillPath} fill="url(#fillGradient)" className="transition-all duration-300" />
                      {/* 核心心跳折线 */}
                      <polyline
                        fill="none"
                        stroke="url(#strokeGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={svgData.polylinePoints}
                        className="transition-all duration-300"
                      />
                      {/* 最新起伏呼吸点 */}
                      {svgData.lastPoint && (
                        <circle
                          cx={svgData.lastPoint.x}
                          cy={svgData.lastPoint.y}
                          r="4"
                          className={cn("fill-emerald-500 stroke-white dark:stroke-zinc-950 stroke-2", hasNewPulse && "animate-bounce")}
                        />
                      )}
                    </svg>
                  </div>
                </div>

                {/* 右侧：测速核心统计卡片 */}
                <div className="md:col-span-4 flex flex-col justify-center text-left space-y-3.5 md:pl-2">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">最新接口耗时</span>
                    <span className={cn("text-3xl font-extrabold font-mono italic tracking-tight block transition-all duration-300", getCostTimeColor(currentCostTime))}>
                      {currentCostTime} <span className="text-xs font-sans not-italic font-bold text-zinc-400">ms</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[9.5px] font-bold text-zinc-400 block">心跳波形数</span>
                      <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">{pulseData.length} pts</span>
                    </div>
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-850" />
                    <div>
                      <span className="text-[9.5px] font-bold text-zinc-400 block">实时累计推送</span>
                      <span className="text-xs font-bold font-mono text-zinc-850 dark:text-zinc-200">{pulseIndex} pkts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下半部核心：实时滚动日志列表 */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse min-w-[500px] table-fixed">
                  <thead>
                    <tr className="border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-400 text-[10px] uppercase font-bold tracking-wider select-none">
                      <th className="pb-2 w-20">来源</th>
                      <th className="pb-2 w-1/3">接口描述</th>
                      <th className="pb-2 w-16 text-center">方式</th>
                      <th className="pb-2 w-2/5">请求地址 (URI)</th>
                      <th className="pb-2 w-20 text-right">耗时</th>
                      <th className="pb-2 w-20 text-right">发生时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/60 text-zinc-700 dark:text-zinc-300">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400 text-[11px] font-mono">
                          CONNECTING AND FETCHING LIVE FEED...
                        </td>
                      </tr>
                    ) : apiLogs.length > 0 ? (
                      apiLogs.map((logItem) => (
                        <tr
                          key={logItem.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-all duration-300 ease-out animate-[fadeIn_0.5s_ease-out]"
                        >
                          <td className="py-2">
                            {renderSourceBadge(logItem.uri)}
                          </td>
                          <td className="py-2 font-semibold text-zinc-850 dark:text-zinc-200 truncate text-[11.5px]" title={logItem.apiName}>
                            {logItem.apiName}
                          </td>
                          <td className="py-2 text-center">
                            <span className={cn("text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider", getMethodStyle(logItem.method))}>
                              {logItem.method}
                            </span>
                          </td>
                          <td className="py-2 font-mono text-zinc-500 truncate text-[10.5px]" title={logItem.uri}>
                            {logItem.uri}
                          </td>
                          <td className={cn("py-2 text-right font-mono italic text-[11px]", getCostTimeColor(logItem.costTime))}>
                            {logItem.costTime} <span className="text-[9px] font-sans not-italic text-zinc-400">ms</span>
                          </td>
                          <td className="py-2 text-right text-zinc-400 dark:text-zinc-550 font-mono text-[10px]">
                            {logItem.createdAt ? new Date(logItem.createdAt).toLocaleTimeString("zh-CN") : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-450 text-[11px] font-mono">
                          NO LIVE API LOGS STREAMING
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 查看完整日志的链接 */}
            <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-4 select-none">
              <Link href="/api-logs" className="text-xs font-bold text-primary hover:text-blue-600 transition-colors flex items-center gap-1 group">
                查看全部接口日志
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
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
                    <kbd className="inline-flex h-4.5 items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.25 font-mono text-[8.5px] font-bold text-zinc-550 shadow-2xs group-hover:bg-[#0070F3] group-hover:text-white group-hover:border-[#0070F3] transition-all">
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
