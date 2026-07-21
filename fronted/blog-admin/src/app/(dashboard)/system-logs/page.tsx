"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Search, 
  Loader2, 
  AlertCircle,
  Filter,
  RotateCcw,
  X
} from "lucide-react";
import { cn } from "@heroui/react";

/**
 * 文本关键字高亮辅助函数
 */
const highlightText = (text: string, search: string, useRegex: boolean) => {
  if (!search.trim()) return text;
  try {
    let regex: RegExp;
    if (useRegex) {
      regex = new RegExp(`(${search})`, "gi");
    } else {
      const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      regex = new RegExp(`(${escaped})`, "gi");
    }
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) => 
          regex.test(part) ? (
            <mark key={idx} className="bg-yellow-500/35 text-yellow-100 px-0.5 rounded font-semibold font-mono">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return text;
  }
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG">("ALL");
  const [keyword, setKeyword] = useState("");
  const [excludeKeyword, setExcludeKeyword] = useState("");
  const [threadFilter, setThreadFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [highlightKeyword, setHighlightKeyword] = useState(true);
  const [maxLines, setMaxLines] = useState<number>(500);
  const [isLocked, setIsLocked] = useState(false); // 是否锁定滚动（暂停自动滚底）
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const maxLinesRef = useRef<number>(500);

  useEffect(() => {
    maxLinesRef.current = maxLines;
  }, [maxLines]);

  // 1. 初始化 WebSocket 日志监听 (连接标识包含 system- 以便后端过滤路由)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 生产环境使用当前页面域名（nginx 反向代理 /ws → 后端），开发环境直连 localhost:8080
    const { hostname, protocol, host } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const wsBase = isLocal ? 'ws://localhost:8080' : `${protocol === 'https:' ? 'wss' : 'ws'}://${host}`;
    const url = `${wsBase}/ws/system-console-${Math.random().toString(36).substring(2, 9)}`;

    let isDestroyed = false;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      if (isDestroyed) return;
      setWsStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isDestroyed) {
          setWsStatus("open");
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "system-log" && payload.data) {
            const rawLine = payload.data;
            setLogs((prev) => {
              const next = [...prev, rawLine];
              // 内存安全上限裁剪
              return next.slice(-maxLinesRef.current);
            });
          } else if (payload.type === "system-log-history" && Array.isArray(payload.data)) {
            setLogs(payload.data.slice(-maxLinesRef.current));
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!isDestroyed) {
          setWsStatus("closed");
          // 5秒后进行断线自动重连
          reconnectTimer = setTimeout(() => {
            if (!isDestroyed && wsRef.current?.readyState === WebSocket.CLOSED) {
              connectWs();
            }
          }, 5000);
        }
      };
    };

    connectWs();

    return () => {
      isDestroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        const ws = wsRef.current;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close();
        } else if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        wsRef.current = null;
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

    const content = highlightKeyword ? highlightText(line, keyword, isRegex) : line;

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
        <span className={lineClass}>{content}</span>
      </div>
    );
  }, [keyword, isRegex, highlightKeyword]);

  // 4. 对日志进行层级和关键字搜索过滤
  const filteredLogs = logs.filter((line) => {
    // 日志级别筛选
    if (levelFilter !== "ALL") {
      const regex = new RegExp(`\\b${levelFilter}\\b`, "i");
      if (!regex.test(line)) return false;
    }
    // 排除关键字筛选
    if (excludeKeyword.trim()) {
      if (line.toLowerCase().includes(excludeKeyword.toLowerCase())) return false;
    }
    // 线程名称筛选
    if (threadFilter.trim()) {
      if (!line.toLowerCase().includes(threadFilter.toLowerCase())) return false;
    }
    // 类名/Logger 筛选
    if (classFilter.trim()) {
      if (!line.toLowerCase().includes(classFilter.toLowerCase())) return false;
    }
    // 仅异常筛选 (包含 Exception/Error/Failed/堆栈信息)
    if (exceptionsOnly) {
      const hasException = /exception|error|runtimeexception|failed|nested exception|at\s+[\w\.\$]+\([\w\.\$]+:\d+\)/i.test(line);
      if (!hasException) return false;
    }
    // 关键字/正则筛选
    if (keyword.trim()) {
      if (isRegex) {
        try {
          const regex = new RegExp(keyword, "i");
          if (!regex.test(line)) return false;
        } catch {
          return false;
        }
      } else {
        if (!line.toLowerCase().includes(keyword.toLowerCase())) return false;
      }
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

      {/* 极客日志控制工具栏 */}
      <div className="bg-zinc-50 dark:bg-zinc-900/10 p-4 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 space-y-3.5 select-none text-xs">
        {/* 第一行：状态过滤 Pills + 基本操作 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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
            {/* 最大展示行数选择 */}
            <div className="flex h-8 items-center gap-1.5 px-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] text-zinc-500">
              <span className="font-medium">上限</span>
              <select
                value={maxLines}
                onChange={(e) => setMaxLines(Number(e.target.value))}
                className="border-none bg-transparent p-0 pr-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 outline-hidden cursor-pointer focus:ring-0 leading-normal font-mono"
              >
                <option value={100}>100 行</option>
                <option value={200}>200 行</option>
                <option value={500}>500 行</option>
                <option value={1000}>1000 行</option>
              </select>
            </div>

            {/* 实时滚动锁定切换 */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer border active:scale-95",
                isLocked
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20"
                  : "bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border-zinc-200/60 dark:border-zinc-800"
              )}
              title={isLocked ? "点击开启滚屏追踪" : "点击锁定屏幕滚动，便于仔细审查日志"}
            >
              {isLocked ? <Play size={11} className="animate-pulse" /> : <Pause size={11} />}
              <span>{isLocked ? "开启滚屏" : "锁定滚屏"}</span>
            </button>

            {/* 清理屏幕 */}
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 text-rose-600 dark:text-rose-400 transition-all cursor-pointer active:scale-95"
              title="一键清空当前屏幕已捕获日志"
            >
              <Trash2 size={11} />
              <span>清屏</span>
            </button>
          </div>
        </div>

        {/* 第二行：高级搜索过滤面板（多列紧凑网格） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* 包含关键字 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search size={12} />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="检索包含关键字 (大小写不敏感)..."
              className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-hidden text-neutral-dark dark:text-zinc-100"
            />
          </div>

          {/* 排除关键字 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-rose-400 dark:text-rose-500/80">
              <X size={12} />
            </span>
            <input
              type="text"
              value={excludeKeyword}
              onChange={(e) => setExcludeKeyword(e.target.value)}
              placeholder="排除关键字 (忽略含该词日志)..."
              className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-hidden text-neutral-dark dark:text-zinc-100"
            />
          </div>

          {/* 线程名称 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 font-mono text-[10px]">
              [T]
            </span>
            <input
              type="text"
              value={threadFilter}
              onChange={(e) => setThreadFilter(e.target.value)}
              placeholder="按线程过滤 (如 main, task-)..."
              className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-hidden text-neutral-dark dark:text-zinc-100"
            />
          </div>

          {/* 类名包名 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 font-mono text-[10px]">
              L:
            </span>
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Logger/包名 (如 ApiLogAspect)..."
              className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-hidden text-neutral-dark dark:text-zinc-100"
            />
          </div>
        </div>

        {/* 第三行：条件辅助开关 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-200/30 dark:border-zinc-800/30 font-mono">
          <div className="flex flex-wrap items-center gap-4 text-[10.5px] font-semibold text-zinc-550 dark:text-zinc-400">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary"
              />
              <span>正则匹配</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightKeyword}
                onChange={(e) => setHighlightKeyword(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary"
              />
              <span>匹配高亮</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exceptionsOnly}
                onChange={(e) => setExceptionsOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary"
              />
              <span className="text-rose-500 dark:text-rose-400">只看异常 (Exception)</span>
            </label>
          </div>

          {/* 重置高级筛选 */}
          {(keyword || excludeKeyword || threadFilter || classFilter || levelFilter !== "ALL" || isRegex || !highlightKeyword || exceptionsOnly || maxLines !== 500) && (
            <button
              onClick={() => {
                setKeyword("");
                setExcludeKeyword("");
                setThreadFilter("");
                setClassFilter("");
                setLevelFilter("ALL");
                setIsRegex(false);
                setHighlightKeyword(true);
                setExceptionsOnly(false);
                setMaxLines(500);
              }}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-zinc-150/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-[10.5px] font-bold text-zinc-650 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>重置高级筛选</span>
            </button>
          )}
        </div>
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
