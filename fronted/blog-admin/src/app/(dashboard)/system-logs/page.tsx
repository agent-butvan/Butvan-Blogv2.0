"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Search, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@heroui/react";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG">("ALL");
  const [keyword, setKeyword] = useState("");
  const [isLocked, setIsLocked] = useState(false); // 是否锁定滚动（暂停自动滚底）
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. 初始化 WebSocket 日志监听 (连接标识包含 system- 以便后端过滤路由)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    let url = "";
    
    try {
      const parsed = new URL(backendUrl);
      url = `${wsProto}://${parsed.host}/ws/system-console-${Math.random().toString(36).substring(2, 9)}`;
    } catch {
      url = `${wsProto}://${window.location.host}/ws/system-console-${Math.random().toString(36).substring(2, 9)}`;
    }

    const connectWs = () => {
      setWsStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("open");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "system-log" && payload.data) {
            const rawLine = payload.data;
            setLogs((prev) => {
              const next = [...prev, rawLine];
              // 内存安全上限裁剪：保留最新的 500 行，防浏览器内存溢出卡死
              return next.slice(-500);
            });
          }
        } catch {}
      };

      ws.onclose = () => {
        setWsStatus("closed");
        // 5秒后进行断线自动重连
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

  // 2. 自动滚到底部 (只要没有被锁定 isLocked)
  useEffect(() => {
    if (!isLocked && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isLocked]);

  // 3. 多色日志单行格式化上色器
  const renderLogLine = useCallback((line: string, index: number) => {
    const isInfo = line.includes("INFO") || line.includes("info");
    const isWarn = line.includes("WARN") || line.includes("warn");
    const isError = line.includes("ERROR") || line.includes("error");
    const isDebug = line.includes("DEBUG") || line.includes("debug");

    let lineClass = "text-zinc-300";
    if (isInfo) lineClass = "text-emerald-400";
    else if (isWarn) lineClass = "text-amber-400 font-medium";
    else if (isError) lineClass = "text-rose-400 font-bold";
    else if (isDebug) lineClass = "text-cyan-400";

    return (
      <div 
        key={index} 
        className={cn(
          "font-mono text-[11px] leading-relaxed py-0.5 border-l-2 pl-2.5 transition-all duration-100 hover:bg-zinc-900/40",
          isInfo ? "border-emerald-500/30" :
          isWarn ? "border-amber-500/30" :
          isError ? "border-rose-500/50 bg-rose-500/5" :
          isDebug ? "border-cyan-500/30" : "border-zinc-800"
        )}
      >
        <span className={lineClass}>{line}</span>
      </div>
    );
  }, []);

  // 4. 对日志进行层级和关键字搜索过滤
  const filteredLogs = logs.filter((line) => {
    // 日志级别筛选
    if (levelFilter !== "ALL") {
      const regex = new RegExp(`\\b${levelFilter}\\b`, "i");
      if (!regex.test(line)) return false;
    }
    // 关键字筛选
    if (keyword.trim()) {
      if (!line.toLowerCase().includes(keyword.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 text-left">
      {/* 头部导航标题区 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-150 flex items-center gap-2">
            <Terminal className="text-primary w-5 h-5" />
            系统控制台日志
          </h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-550 mt-1 font-mono">
            MONITORING / REAL-TIME SPRINGBOOT CONSOLE
          </p>
        </div>

        {/* 连接呼吸状态指示器 */}
        <div className="flex items-center gap-2 text-xs font-mono select-none">
          {wsStatus === "open" && (
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE CONNECTED
            </span>
          )}
          {wsStatus === "connecting" && (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-xl">
              <Loader2 size={12} className="animate-spin" />
              CONNECTING
            </span>
          )}
          {wsStatus === "closed" && (
            <span className="flex items-center gap-1.5 text-rose-500 font-bold bg-rose-500/10 px-3 py-1 rounded-xl">
              <AlertCircle size={12} />
              DISCONNECTED (RETRYING)
            </span>
          )}
        </div>
      </div>

      {/* 控制工具栏区 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 select-none">
        <div className="flex flex-wrap items-center gap-2">
          {/* 日志层级过滤 Pills */}
          {(["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider font-mono cursor-pointer transition-all active:scale-95 border",
                levelFilter === lvl
                  ? lvl === "ERROR" ? "bg-rose-500 border-rose-500 text-white" :
                    lvl === "WARN" ? "bg-amber-500 border-amber-500 text-white" :
                    lvl === "INFO" ? "bg-emerald-500 border-emerald-500 text-white" :
                    lvl === "DEBUG" ? "bg-cyan-500 border-cyan-500 text-white" :
                    "bg-primary border-primary text-white"
                  : "bg-white dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* 实时滚动锁定切换 */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95",
              isLocked
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20"
                : "bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border-zinc-200/60 dark:border-zinc-800"
            )}
            title={isLocked ? "点击开启滚屏追踪" : "点击锁定屏幕滚动，便于仔细审查日志"}
          >
            {isLocked ? <Play size={12} className="animate-pulse" /> : <Pause size={12} />}
            <span>{isLocked ? "开启滚屏" : "锁定滚屏"}</span>
          </button>

          {/* 清理屏幕 */}
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 text-rose-600 dark:text-rose-400 transition-all cursor-pointer active:scale-95"
            title="一键清空当前屏幕已捕获日志"
          >
            <Trash2 size={12} />
            <span>清屏</span>
          </button>
        </div>
      </div>

      {/* 搜索过滤条 */}
      <div className="relative select-none">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-400">
          <Search size={13} />
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="过滤控制台输出关键字 (大小写不敏感)..."
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-hidden text-neutral-dark dark:text-zinc-100"
        />
      </div>

      {/* 暗黑极客 Terminal 日志容器 */}
      <div 
        ref={terminalRef}
        className="bg-zinc-950 rounded-2xl border border-zinc-900 p-4.5 h-[620px] overflow-y-auto shadow-2xl shadow-primary/5 select-text selection:bg-primary/30 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <div className="space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[570px] text-zinc-650 font-mono text-[10.5px]">
              <Terminal size={22} className="mb-2 text-zinc-800 opacity-60" />
              <span>TERMINAL IDLE / WAITING FOR STDOUT LOGSTREAM</span>
            </div>
          ) : (
            filteredLogs.map((line, idx) => renderLogLine(line, idx))
          )}
        </div>
      </div>
    </div>
  );
}
