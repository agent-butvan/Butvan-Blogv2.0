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
  serviceStatus?: {
    database: boolean;
    redis: boolean;
    minio: boolean;
    storageType: string;
  };
}

interface PulsePoint {
  costTime: number;
  apiName: string;
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

// 图表默认背景起伏数据
const DEFAULT_PULSES: PulsePoint[] = [
  { costTime: 12, apiName: "获取初始化数据" },
  { costTime: 25, apiName: "加载文章列表" },
  { costTime: 8, apiName: "验证权限" },
  { costTime: 40, apiName: "获取评论内容" },
  { costTime: 15, apiName: "解析站点配置" },
  { costTime: 65, apiName: "拉取分类树" },
  { costTime: 18, apiName: "获取侧边栏" },
  { costTime: 32, apiName: "加载微信设置" },
  { costTime: 8, apiName: "测速心跳" },
  { costTime: 22, apiName: "校验Token" },
  { costTime: 15, apiName: "加载系统指标" },
  { costTime: 48, apiName: "加载手记" },
  { costTime: 95, apiName: "更新用户信息" },
  { costTime: 12, apiName: "获取文章归整率" },
  { costTime: 28, apiName: "工作台加载就绪" }
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "你的选择，毫无意义。", author: "TOBY FOX", source: "《DELTARUNE》" });

  // 实时 API 日志大池子 (最多保存最近 40 条做前台过滤筛选)
  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 分类查询 Tabs 状态
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLIENT' | 'ADMIN' | 'WECHAT'>('ALL');

  // 为每个分类维护独立的 15 点脉冲图波形
  const [pulseAll, setPulseAll] = useState<PulsePoint[]>(DEFAULT_PULSES);
  const [pulseClient, setPulseClient] = useState<PulsePoint[]>(DEFAULT_PULSES);
  const [pulseAdmin, setPulseAdmin] = useState<PulsePoint[]>(DEFAULT_PULSES);
  const [pulseWechat, setPulseWechat] = useState<PulsePoint[]>(DEFAULT_PULSES);

  // SVG 折点 Hover tooltip 状态
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; name: string } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 用来产生实时闪烁动效的指示
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);
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
    // 初始拉取多一点(40条)，用于 Tab 切换时的初始本地过滤体验
    apiClient.get<ApiResponse<{ records: ApiLogItem[] }>>("/admin/api-logs", {
      params: { page: 1, size: 40 }
    }).then((res) => {
      if (res.data?.data?.records) {
        const records = res.data.data.records;
        setApiLogs(records);

        // 提取各自的波形数据占位
        const classifyList = (filterFn: (uri: string) => boolean) => {
          return records
            .filter(r => filterFn(r.uri))
            .slice(0, 15)
            .reverse()
            .map(r => ({ costTime: r.costTime, apiName: r.apiName }));
        };

        const listAll = records.slice(0, 15).reverse().map(r => ({ costTime: r.costTime, apiName: r.apiName }));
        const listAdmin = classifyList(uri => (uri || "").toLowerCase().includes("/admin/"));
        const listWechat = classifyList(uri => (uri || "").toLowerCase().includes("/weixin/"));
        const listClient = classifyList(uri => !(uri || "").toLowerCase().includes("/admin/") && !(uri || "").toLowerCase().includes("/weixin/"));

        if (listAll.length >= 5) setPulseAll(prev => [...prev.slice(0, 15 - listAll.length), ...listAll]);
        if (listAdmin.length >= 2) setPulseAdmin(prev => [...prev.slice(0, 15 - listAdmin.length), ...listAdmin]);
        if (listWechat.length >= 2) setPulseWechat(prev => [...prev.slice(0, 15 - listWechat.length), ...listWechat]);
        if (listClient.length >= 2) setPulseClient(prev => [...prev.slice(0, 15 - listClient.length), ...listClient]);
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
      url = `${wsProto}://${parsed.host}/ws/admin-dashboard-${Math.random().toString(36).substring(2, 9)}`;
    } catch {
      url = `${wsProto}://${window.location.host}/ws/admin-dashboard-${Math.random().toString(36).substring(2, 9)}`;
    }

    const connectWs = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "api-log" && payload.data) {
            const newLog = payload.data as ApiLogItem;
            
            // 收到新消息，塞入大池子最前端 (保持大池子最多 50 条做筛选过滤，过滤重复 id 规避 React key 冲突)
            setApiLogs(prev => [newLog, ...prev.filter(item => item.id !== newLog.id).slice(0, 49)]);

            // 同时推送并滚动对应分类的电波数组
            const uri = (newLog.uri || "").toLowerCase();
            const newPt = { costTime: newLog.costTime, apiName: newLog.apiName };

            setPulseAll(prev => [...prev.slice(1), newPt]);
            if (uri.includes("/admin/")) {
              setPulseAdmin(prev => [...prev.slice(1), newPt]);
            } else if (uri.includes("/weixin/")) {
              setPulseWechat(prev => [...prev.slice(1), newPt]);
            } else {
              setPulseClient(prev => [...prev.slice(1), newPt]);
            }

            setPulseIndex(i => i + 1);
            setHasNewPulse(true);
            setTimeout(() => setHasNewPulse(false), 800);
          }
        } catch (err) {
          // 降级防崩溃
        }
      };

      ws.onclose = () => {
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

  // 根据当前激活的 Tab 分类，获取对应的心跳数据数组
  const getActivePulseData = (): PulsePoint[] => {
    if (activeTab === 'ADMIN') return pulseAdmin;
    if (activeTab === 'WECHAT') return pulseWechat;
    if (activeTab === 'CLIENT') return pulseClient;
    return pulseAll;
  };

  // 过滤展示出的最新 8 条日志列表
  const getFilteredLogs = (): ApiLogItem[] => {
    return apiLogs
      .filter(item => {
        if (activeTab === 'ALL') return true;
        const uri = (item.uri || "").toLowerCase();
        if (activeTab === 'ADMIN') return uri.includes('/admin/');
        if (activeTab === 'WECHAT') return uri.includes('/weixin/');
        return !uri.includes('/admin/') && !uri.includes('/weixin/');
      })
      .slice(0, 8);
  };

  // 生成实时脉冲折线图的 SVG 数据坐标
  const buildSvgPath = () => {
    const width = 280;
    const height = 90;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const data = getActivePulseData();
    const count = data.length;
    const stepX = chartWidth / (count - 1);

    // 最大耗时映射，最小设为 120ms 防止图表太平
    const maxVal = Math.max(...data.map(p => p.costTime), 120);

    const points = data.map((item, idx) => {
      const x = padding + idx * stepX;
      const ratio = item.costTime / maxVal;
      const y = padding + chartHeight - ratio * chartHeight;
      return { x, y, value: item.costTime, name: item.apiName };
    });

    const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    
    // 生成闭合的填充区域
    const fillPath = `M ${points[0].x.toFixed(1)} ${height - padding} ` +
                     points.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
                     ` L ${points[points.length - 1].x.toFixed(1)} ${height - padding} Z`;

    const lastPoint = points[points.length - 1];

    return { polylinePoints, fillPath, lastPoint, points };
  };

  const currentPulses = getActivePulseData();
  const currentCostTime = currentPulses[currentPulses.length - 1]?.costTime ?? 0;
  const svgData = buildSvgPath();
  const displayLogs = getFilteredLogs();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 p-4 sm:p-6 -m-4 sm:-m-6 font-sans text-zinc-800 dark:text-zinc-200 transition-colors duration-200 text-left">
      
      {/* 1. NextUI Header 横幅带胶囊 CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-zinc-200/50 dark:border-zinc-850 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
            {greeting}，可梵
          </h1>
          {/* 金句极简一行 */}
          <p className="text-xs text-zinc-500 dark:text-zinc-450 flex items-center flex-wrap gap-1 leading-none font-medium mt-0.5">
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
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest leading-none">
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
          
          {/* 左侧大面板：Live API 日志与心跳脉冲图 (支持 Tabs 分类过滤 & Hover Tooltip) */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[380px]">
            <div>
              {/* 大屏控制头部 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4.5 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">实时接口监控大屏</h3>
                  <span className="text-[8.5px] font-extrabold text-white bg-rose-500 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5 uppercase tracking-wide">
                    <Zap size={9} fill="white" />
                    WS Stream
                  </span>
                  
                  {/* 实时闪烁标志 */}
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className={cn("absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", hasNewPulse && "animate-ping")}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {/* 分类切换 Tabs 胶囊组件 */}
                <div className="flex items-center bg-zinc-100/70 dark:bg-zinc-950/40 p-0.75 rounded-xl border border-zinc-200/40 dark:border-zinc-800/80 text-[10px] font-bold select-none">
                  {[
                    { id: 'ALL', label: "全部" },
                    { id: 'CLIENT', label: "前台" },
                    { id: 'ADMIN', label: "后台" },
                    { id: 'WECHAT', label: "微信" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setHoveredPoint(null);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg transition-all cursor-pointer",
                        activeTab === tab.id
                          ? "bg-white dark:bg-zinc-900 text-primary shadow-3xs"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 上半部：实时脉冲图 (SVG Hover Tooltip) */}
              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-5 mb-5 items-center bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-zinc-800/40 rounded-2xl p-4">
                
                {/* 悬浮气泡 Tooltip 节点 */}
                {hoveredPoint && (
                  <div
                    className="absolute z-20 pointer-events-none bg-zinc-950/95 dark:bg-zinc-900/95 text-white text-[9.5px] p-2 rounded-lg border border-zinc-800 shadow-md flex flex-col space-y-0.5 select-none font-sans"
                    style={{
                      left: `${hoveredPoint.x}px`,
                      top: `${hoveredPoint.y - 8}px`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <span className="font-extrabold text-[8px] uppercase tracking-wider text-zinc-450 max-w-[150px] truncate block">
                      {hoveredPoint.name}
                    </span>
                    <span className="font-bold font-mono text-emerald-400">
                      {hoveredPoint.value} ms
                    </span>
                  </div>
                )}

                {/* 左侧：SVG 心跳波形图 */}
                <div className="md:col-span-8 flex flex-col items-center">
                  <div className="w-full relative h-24 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl shadow-2xs overflow-hidden flex items-center justify-center">
                    {/* 背景网格 */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,112,243,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,112,243,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    <svg className="w-full h-full" viewBox="0 0 280 90" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={svgData.fillPath} fill="url(#fillGradient)" className="transition-all duration-300" />
                      <polyline
                        fill="none"
                        stroke="url(#strokeGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={svgData.polylinePoints}
                        className="transition-all duration-300"
                      />
                      {svgData.lastPoint && (
                        <circle
                          cx={svgData.lastPoint.x}
                          cy={svgData.lastPoint.y}
                          r="3.5"
                          className={cn("fill-emerald-500 stroke-white dark:stroke-zinc-950 stroke-2", hasNewPulse && "animate-bounce")}
                        />
                      )}
                      
                      {/* 实实在在渲染出折点小圈以提供高亮交互反馈 */}
                      {svgData.points.map((p, idx) => (
                        <circle
                          key={`dot-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredIndex === idx ? 3.5 : 1.5}
                          className={cn(
                            "transition-all duration-200 pointer-events-none",
                            hoveredIndex === idx
                              ? "fill-emerald-400 stroke-white dark:stroke-zinc-950 stroke-1"
                              : "fill-blue-500 stroke-white dark:stroke-zinc-950 stroke-[0.5]"
                          )}
                        />
                      ))}

                      {/* 透明触控点实现 Hover Tooltip (利用 clientRect 差值保证 100% 真实物理像素坐标映射) */}
                      {svgData.points.map((p, idx) => (
                        <circle
                          key={`touch-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r="12"
                          fill="transparent"
                          className="cursor-pointer pointer-events-auto"
                          onMouseEnter={(e) => {
                            setHoveredIndex(idx);
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            const circleRect = e.currentTarget.getBoundingClientRect();
                            if (rect) {
                              const x = circleRect.left - rect.left + circleRect.width / 2;
                              const y = circleRect.top - rect.top;
                              setHoveredPoint({ x, y, value: p.value, name: p.name });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredIndex(null);
                            setHoveredPoint(null);
                          }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* 右侧：指标卡 */}
                <div className="md:col-span-4 flex flex-col justify-center text-left space-y-3 md:pl-2">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">当前分类耗时</span>
                    <span className={cn("text-3xl font-extrabold font-mono italic tracking-tight block transition-all duration-300", getCostTimeColor(currentCostTime))}>
                      {currentCostTime} <span className="text-xs font-sans not-italic font-bold text-zinc-400">ms</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 block">心跳点数</span>
                      <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">{currentPulses.length} pts</span>
                    </div>
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-850" />
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 block">累计网络包</span>
                      <span className="text-xs font-bold font-mono text-zinc-850 dark:text-zinc-200">{pulseIndex} pkts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下半部：包含 IP 的滚动接口日志 */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse min-w-[600px] table-fixed">
                  <thead>
                    <tr className="border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-400 text-[10px] uppercase font-bold tracking-wider select-none">
                      <th className="pb-2 w-20">来源</th>
                      <th className="pb-2 w-32">接口描述</th>
                      <th className="pb-2 w-16 text-center">方式</th>
                      <th className="pb-2 w-28">客户端 IP</th>
                      <th className="pb-2 w-2/5">请求地址 (URI)</th>
                      <th className="pb-2 w-20 text-right">耗时</th>
                      <th className="pb-2 w-20 text-right">发生时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/60 text-zinc-700 dark:text-zinc-300">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400 text-[11px] font-mono">
                          CONNECTING AND FETCHING LIVE FEED...
                        </td>
                      </tr>
                    ) : displayLogs.length > 0 ? (
                      displayLogs.map((logItem) => (
                        <tr
                          key={logItem.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-all duration-300 ease-out animate-[fadeIn_0.5s_ease-out]"
                        >
                          <td className="py-2.5">
                            {renderSourceBadge(logItem.uri)}
                          </td>
                          <td className="py-2.5 font-semibold text-zinc-850 dark:text-zinc-200 truncate text-[11.5px]" title={logItem.apiName}>
                            {logItem.apiName}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={cn("text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider", getMethodStyle(logItem.method))}>
                              {logItem.method}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-zinc-550 text-[11px] truncate" title={logItem.ip}>
                            {logItem.ip}
                          </td>
                          <td className="py-2.5 font-mono text-zinc-550 truncate text-[10.5px]" title={logItem.uri}>
                            {logItem.uri}
                          </td>
                          <td className={cn("py-2.5 text-right font-mono italic text-[11px]", getCostTimeColor(logItem.costTime))}>
                            {logItem.costTime} <span className="text-[9px] font-sans not-italic text-zinc-400">ms</span>
                          </td>
                          <td className="py-2.5 text-right text-zinc-400 dark:text-zinc-550 font-mono text-[10.5px]">
                            {logItem.createdAt ? new Date(logItem.createdAt).toLocaleTimeString("zh-CN") : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-450 text-[11px] font-mono">
                          NO LIVE API LOGS IN THIS CATEGORY
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 底部查看详情 */}
            <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-4 select-none">
              <Link href="/api-logs" className="text-xs font-bold text-primary hover:text-blue-600 transition-colors flex items-center gap-1 group">
                查看全部接口日志
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 右侧：System Operations 服务连接状态监控面板 */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                  Service Status / 服务连接监控
                </h3>
                <span className="text-[9px] font-bold text-zinc-400">Monitoring</span>
              </div>
              
              <div className="flex flex-col gap-2">
                {[
                  {
                    name: "PostgreSQL 数据库",
                    driver: "Driver: org.postgresql.Driver",
                    port: "Port: 5432",
                    status: stats ? (stats.serviceStatus?.database ? "healthy" : "error") : "loading"
                  },
                  {
                    name: "Redis 缓存引擎",
                    driver: "Driver: Lettuce (Spring Data)",
                    port: "Port: 6379",
                    status: stats ? (stats.serviceStatus?.redis ? "healthy" : "error") : "loading"
                  },
                  {
                    name: "Storage / 存储媒介",
                    driver: stats?.serviceStatus?.storageType === "local" ? "Storage: Local File System" : "Bucket: butvan-blog",
                    port: stats?.serviceStatus?.storageType === "local" ? "uploads/" : "Port: 9000",
                    status: stats ? (stats.serviceStatus?.storageType === "local" ? "inactive" : (stats.serviceStatus?.minio ? "healthy" : "error")) : "loading"
                  }
                ].map((item) => {
                  let cardStyle = "border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10";
                  let lightClass = "bg-zinc-400";
                  let pulseClass = "";
                  let statusLabel = "N/A";
                  let textColor = "text-zinc-400";

                  if (item.status === "healthy") {
                    cardStyle = "border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-500/5 hover:bg-emerald-50/10 dark:hover:bg-emerald-500/10";
                    lightClass = "bg-emerald-500";
                    pulseClass = "animate-ping bg-emerald-400";
                    statusLabel = "Connected";
                    textColor = "text-emerald-500";
                  } else if (item.status === "error") {
                    cardStyle = "border-rose-500/15 hover:border-rose-500/30 bg-rose-50/5 dark:bg-rose-500/5 hover:bg-rose-50/10 dark:hover:bg-rose-500/10 animate-pulse";
                    lightClass = "bg-rose-500";
                    pulseClass = "animate-ping bg-rose-400";
                    statusLabel = "Disconnected";
                    textColor = "text-rose-500";
                  } else if (item.status === "loading") {
                    cardStyle = "border-amber-500/10 hover:border-amber-500/25 bg-amber-50/5 dark:bg-amber-500/5";
                    lightClass = "bg-amber-500";
                    pulseClass = "animate-ping bg-amber-400";
                    statusLabel = "Checking...";
                    textColor = "text-amber-500";
                  } else if (item.status === "inactive") {
                    cardStyle = "border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-900/5 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10";
                    lightClass = "bg-zinc-400";
                    statusLabel = "Local Active";
                    textColor = "text-zinc-500";
                  }

                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 shadow-2xs hover:shadow-xs group select-none ${cardStyle}`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-none mt-1.5 flex gap-2">
                          <span>{item.driver}</span>
                          <span className="opacity-40">|</span>
                          <span>{item.port}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold tracking-tight ${textColor}`}>
                          {statusLabel}
                        </span>
                        <span className="relative flex h-2 w-2">
                          {pulseClass && (
                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}`}></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${lightClass}`}></span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 提示胶囊 */}
            <div className="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-200/40 dark:border-zinc-800/80 p-3 rounded-xl flex items-start gap-2 shadow-3xs select-none">
              <span className="text-indigo-500 mt-0.5 font-bold">ⓘ</span>
              <span>核心服务状态每当您进入工作台时实时测试连通，以确保发布、缓存清除及媒体上传的稳定。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
