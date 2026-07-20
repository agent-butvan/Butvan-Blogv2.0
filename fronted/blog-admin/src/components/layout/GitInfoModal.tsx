"use client";

import { useState, useEffect } from "react";
import { GitBranch, GitCommit, Calendar, User, X, Loader2, RefreshCw } from "lucide-react";
import Portal from "../common/Portal";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn } from "@heroui/react";

interface GitCommitItem {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface GitInfo {
  currentBranch: string;
  branches: string[];
  commits: GitCommitItem[];
}

export default function GitInfoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<GitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGitInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ApiResponse<GitInfo>>("/admin/git/info");
      if (res.data?.data) {
        setData(res.data.data);
      } else {
        setError("无法获取 Git 信息");
      }
    } catch (err: any) {
      console.error("加载 Git 信息失败:", err);
      setError(err?.message || "网络请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGitInfo();
    }
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 遮罩层 */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />

        {/* 弹窗主体 */}
        <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-all duration-300 animate-slide-up text-left">
          
          {/* 头部 */}
          <div className="flex items-center justify-between p-4.5 border-b border-zinc-150 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
                <GitBranch size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Git 版本库状态监视
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  LOCAL GIT REPOSITORY STATUS & LOGS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchGitInfo}
                disabled={loading}
                className="p-1.5 rounded-lg text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                title="重新加载"
              >
                <RefreshCw size={13} className={cn(loading && "animate-spin")} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* 状态加载 / 错误 */}
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-[11px] font-mono">LOADING LOCAL GIT FEED...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-rose-500 gap-2">
              <X className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-full" size={40} />
              <span className="text-xs font-semibold">{error}</span>
              <button
                onClick={fetchGitInfo}
                className="mt-3 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg active:scale-95 transition-all"
              >
                重试加载
              </button>
            </div>
          ) : (
            <>
              {/* 分支概览区块 */}
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-150 dark:border-zinc-800 space-y-3">
                <div className="flex items-center flex-wrap gap-2.5 text-xs">
                  <span className="text-zinc-450 font-bold uppercase text-[10px] tracking-wide">当前活动分支:</span>
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-lg font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {data?.currentBranch}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <span className="text-zinc-450 font-bold uppercase text-[10px] tracking-wide mt-1 shrink-0">本地分支列表:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data?.branches.map((b) => (
                      <span
                        key={b}
                        className={cn(
                          "px-2 py-0.5 rounded-md font-mono font-bold text-[10.5px] border",
                          b === data.currentBranch
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-white dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800"
                        )}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 提交记录列表 */}
              <div className="flex-1 overflow-y-auto p-4.5 space-y-4 custom-scrollbar">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 select-none">
                  最近提交记录 (COMMITS HISTORY)
                </h4>
                {data?.commits && data.commits.length > 0 ? (
                  <div className="relative border-l border-zinc-200/80 dark:border-zinc-800 ml-2.5 pl-5 space-y-5">
                    {data.commits.map((commit, idx) => (
                      <div key={commit.hash} className="relative group text-left">
                        {/* 左侧标记节点 */}
                        <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 group-hover:border-primary group-hover:bg-primary/10 transition-colors duration-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-primary transition-colors" />
                        </span>

                        <div className="space-y-1.5">
                          {/* 提交信息标题 */}
                          <div className="text-xs font-semibold text-zinc-850 dark:text-zinc-150 leading-snug group-hover:text-primary transition-colors duration-150">
                            {commit.message}
                          </div>

                          {/* 提交元数据属性 */}
                          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded-md font-bold text-zinc-600 dark:text-zinc-450">
                              <GitCommit size={9} />
                              {commit.hash}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {commit.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {commit.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-400 font-mono text-xs">
                    NO COMMIT HISTORY FOUND
                  </div>
                )}
              </div>
            </>
          )}

          {/* 尾部说明 */}
          <div className="p-3 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center select-none">
            <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 font-mono">
              PRODUCED BY LOCAL ENGINE / INTEGRATED SOURCE WATCHER
            </span>
          </div>

        </div>
      </div>
    </Portal>
  );
}
