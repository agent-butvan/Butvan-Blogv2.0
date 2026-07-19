"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  Download,
  FileArchive,
  Filter,
  RotateCcw
} from "lucide-react";
import { cn, SearchField } from "@heroui/react";
import {
  fetchApiLogs,
  clearApiLogs,
  fetchLogArchives,
  deleteLogArchive,
  downloadLogArchive
} from "@/lib/api-log";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { ApiLogItem, LogArchiveItem } from "@/types/api-log";

export default function ApiLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [method, setMethod] = useState("");
  const [minCost, setMinCost] = useState<string>("");
  const [maxCost, setMaxCost] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 选项卡状态与归档包数据
  const [activeTab, setActiveTab] = useState<"logs" | "archives">("logs");
  const [archives, setArchives] = useState<LogArchiveItem[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [showArchiveDeleteConfirm, setShowArchiveDeleteConfirm] = useState(false);

  // 操作状态
  const [actionError, setActionError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const pageSize = 12;

  /** 加载归档包列表 */
  const loadArchives = useCallback(async () => {
    setArchivesLoading(true);
    try {
      const data = await fetchLogArchives();
      setArchives(data);
    } catch (err) {
      console.error("加载日志归档失败:", err);
      setArchives([]);
    } finally {
      setArchivesLoading(false);
    }
  }, []);

  /** 执行归档流式下载 */
  const handleDownloadArchive = async (filename: string) => {
    try {
      const blob = await downloadLogArchive(filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setActionError(err.message || "下载归档包失败");
    }
  };

  /** 物理删除归档包 */
  const handleConfirmDeleteArchive = async () => {
    if (!selectedArchive) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteLogArchive(selectedArchive);
      setShowArchiveDeleteConfirm(false);
      setSelectedArchive(null);
      loadArchives();
    } catch (err: any) {
      setActionError(err.message || "删除归档包失败");
    } finally {
      setActionLoading(false);
    }
  };

  /** 加载 API 日志列表 */
  const loadApiLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApiLogs({
        page,
        size: pageSize,
        keyword: keyword || undefined,
        method: method || undefined,
        minCost: minCost !== "" ? Number(minCost) : undefined,
        maxCost: maxCost !== "" ? Number(maxCost) : undefined,
      });
      setLogs(data.records || []);
      setTotal(data.total);
    } catch (err) {
      console.error("加载 API 测速日志失败:", err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, method, minCost, maxCost]);

  useEffect(() => {
    if (activeTab === "logs") {
      loadApiLogs();
    } else {
      loadArchives();
    }
  }, [activeTab, loadApiLogs, loadArchives]);

  /** 执行一键清空日志 */
  const handleClearLogs = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await clearApiLogs();
      setShowClearConfirm(false);
      setPage(1);
      loadApiLogs();
    } catch (err: any) {
      setActionError(err.message || "清空日志失败");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

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

  return (
    <div className="space-y-5 text-left">
      {/* 页面头部区域 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-550 flex items-center gap-2">
            <Activity className="text-primary w-5 h-5 animate-pulse" />
            接口调用日志
          </h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-550 mt-1 font-mono">
            MONITORING / API SPEED LOGS (共 {total} 条日志记录)
          </p>
        </div>
        
        {/* 清空日志按钮 */}
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={logs.length === 0 || loading}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] py-2 px-4.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={13} />
          <span>清空日志</span>
        </button>
      </div>

      {/* 选项卡 Tab 控制 - Pills 悬浮胶囊风格 */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/20 w-fit rounded-2xl select-none">
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "logs"
              ? "bg-white dark:bg-zinc-800 text-neutral-dark dark:text-white shadow-sm border border-zinc-250/20"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
          )}
        >
          接口测速日志
        </button>
        <button
          onClick={() => setActiveTab("archives")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "archives"
              ? "bg-white dark:bg-zinc-800 text-neutral-dark dark:text-white shadow-sm border border-zinc-250/20"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
          )}
        >
          日志归档管理
        </button>
      </div>

      {/* 异常错误浮筒 */}
      {actionError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/35 p-3.5 text-xs font-medium text-red-700 dark:text-red-400 flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={13} />
            {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="cursor-pointer p-0.5 rounded-full hover:bg-red-100/50">
            <X size={13} />
          </button>
        </div>
      )}

      {activeTab === "logs" ? (
        <>
          {/* 搜索与筛选控制栏 - 强制同一行展示 */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-3.5 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 select-none w-full">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
              {/* 搜索输入框 */}
              <SearchField
                value={keyword}
                onChange={(value) => { setKeyword(value); setPage(1); }}
                className="w-full sm:w-64 shrink-0"
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="检索接口名称、IP、请求地址..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>

              {/* 请求方式筛选 */}
              <div className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-650 dark:text-zinc-350 shrink-0">
                <Filter size={12} className="text-zinc-400 dark:text-zinc-550 shrink-0" />
                <select
                  value={method}
                  onChange={(e) => { setMethod(e.target.value); setPage(1); }}
                  className="border-none bg-transparent p-0 pr-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-hidden cursor-pointer focus:ring-0 leading-normal"
                >
                  <option value="">全部请求方式</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* 耗时区间筛选 */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                <div className="flex h-9 items-center px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-[90px]">
                  <input
                    type="number"
                    value={minCost}
                    onChange={(e) => { setMinCost(e.target.value); setPage(1); }}
                    placeholder="最小耗时"
                    className="w-full border-none bg-transparent p-0 text-xs font-semibold text-zinc-750 dark:text-zinc-300 outline-hidden focus:ring-0 font-mono"
                  />
                  {minCost && <span className="text-[9px] text-zinc-400 dark:text-zinc-500 ml-1">ms</span>}
                </div>
                <span className="text-zinc-400">-</span>
                <div className="flex h-9 items-center px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-[90px]">
                  <input
                    type="number"
                    value={maxCost}
                    onChange={(e) => { setMaxCost(e.target.value); setPage(1); }}
                    placeholder="最大耗时"
                    className="w-full border-none bg-transparent p-0 text-xs font-semibold text-zinc-755 dark:text-zinc-300 outline-hidden focus:ring-0 font-mono"
                  />
                  {maxCost && <span className="text-[9px] text-zinc-400 dark:text-zinc-500 ml-1">ms</span>}
                </div>
              </div>
            </div>

            {/* 重置筛选按钮 */}
            {(keyword || method || minCost || maxCost) && (
              <button
                onClick={() => {
                  setKeyword("");
                  setMethod("");
                  setMinCost("");
                  setMaxCost("");
                  setPage(1);
                }}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 active:scale-95 transition-all cursor-pointer w-full sm:w-auto justify-center shrink-0"
              >
                <RotateCcw size={12} />
                <span>重置筛选</span>
              </button>
            )}
          </div>

          {/* 数据日志核心表格 */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
            <table className="w-full text-xs text-left border-collapse min-w-[850px] table-fixed">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
                  <th className="px-5 py-3.5 w-1/4">接口描述</th>
                  <th className="px-5 py-3.5 w-20 text-center">方式</th>
                  <th className="px-5 py-3.5 w-1/3">请求地址 (URI)</th>
                  <th className="px-5 py-3.5 w-32">客户端 IP</th>
                  <th className="px-5 py-3.5 w-24 text-right">响应耗时</th>
                  <th className="px-5 py-3.5 w-40 text-right">请求时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-[11px] font-medium">正在拉取 API 日志中...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-zinc-400 font-mono">
                      NO API SPEED LOGS RECORDED
                    </td>
                  </tr>
                ) : (
                  logs.map((logItem) => (
                    <tr key={logItem.id} className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150">
                      <td className="px-5 py-3 truncate font-semibold text-neutral-dark dark:text-zinc-150" title={logItem.apiName}>
                        {logItem.apiName}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={cn("text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider", getMethodStyle(logItem.method))}>
                          {logItem.method}
                        </span>
                      </td>
                      <td className="px-5 py-3 truncate font-mono text-[11px] text-zinc-500" title={logItem.uri}>
                        {logItem.uri}
                      </td>
                      <td className="px-5 py-3 font-mono text-zinc-500">
                        {logItem.ip}
                      </td>
                      <td className={cn("px-5 py-3 text-right font-mono italic text-[11.5px]", getCostTimeColor(logItem.costTime))}>
                        {logItem.costTime} <span className="text-[9px] font-sans not-italic text-zinc-400">ms</span>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-450 dark:text-zinc-550 font-mono text-[10px]">
                        {logItem.createdAt ? new Date(logItem.createdAt).toLocaleString("zh-CN") : "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页控制栏 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs pt-2 select-none">
              <span className="text-zinc-500 font-medium font-mono">SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 text-zinc-650 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && p - arr[idx - 1] > 1 && <span className="text-zinc-400 px-1">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={cn(
                          "h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                          page === p
                            ? "bg-primary border-primary text-white"
                            : "border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600"
                        )}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 text-zinc-650 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* 日志归档包管理核心表格 */
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
          <table className="w-full text-xs text-left border-collapse min-w-[700px] table-fixed">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest select-none">
                <th className="px-5 py-3.5 w-1/2">归档日志包名称</th>
                <th className="px-5 py-3.5 w-32 text-center">文件大小</th>
                <th className="px-5 py-3.5 w-48 text-right">生成日期</th>
                <th className="px-5 py-3.5 w-32 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
              {archivesLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-[11px] font-medium">正在扫描物理日志文件...</span>
                    </div>
                  </td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-zinc-400 font-mono">
                    NO LOG ARCHIVES FOUND
                  </td>
                </tr>
              ) : (
                archives.map((archive) => (
                  <tr key={archive.fileName} className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150">
                    <td className="px-5 py-3 truncate font-mono text-[11.5px] font-bold text-neutral-dark dark:text-zinc-150" title={archive.fileName}>
                      <div className="flex items-center gap-2">
                        <FileArchive size={14} className="text-zinc-400 dark:text-zinc-500 group-hover:text-primary transition-all" />
                        {archive.fileName}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-[11px] text-zinc-500 font-semibold">
                      {archive.fileSize}
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-450 dark:text-zinc-550 font-mono text-[10.5px]">
                      {archive.lastModified ? new Date(archive.lastModified).toLocaleString("zh-CN") : "--"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => handleDownloadArchive(archive.fileName)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-805 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 transition-all cursor-pointer active:scale-95"
                          title="流式下载此日志包"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedArchive(archive.fileName);
                            setShowArchiveDeleteConfirm(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white transition-all cursor-pointer active:scale-95"
                          title="物理删除此归档"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 清空日志确认弹窗 */}
      <ConfirmModal
        open={showClearConfirm}
        variant="danger"
        title="确认清空接口日志"
        description="您确定要清空数据库中所有 API 测速日志记录吗？该操作不可逆，请谨慎选择。"
        confirmLabel="清空"
        cancelLabel="取消"
        loading={actionLoading}
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
