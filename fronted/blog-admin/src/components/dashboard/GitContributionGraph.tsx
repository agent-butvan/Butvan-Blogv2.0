"use client";

import { useState, useEffect } from "react";
import { Loader2, GitPullRequest, HelpCircle } from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn, Tooltip } from "@heroui/react";

interface GitActivity {
  date: string;
  count: number;
}

export default function GitContributionGraph() {
  const [activities, setActivities] = useState<GitActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 动态生成包含建站初期(2026-06)至今的近 12 个月份选项
  const getMonthOptions = () => {
    const options: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 从当前月反向往前推 12 个月
    for (let i = 0; i < 12; i++) {
      let y = currentYear;
      let m = currentMonth - i;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      // 如果早于项目诞生前(2026年6月前)，可停止生成
      if (y < 2026 || (y === 2026 && m < 6)) {
        break;
      }
      const monthStr = `${y}-${String(m).padStart(2, '0')}`;
      options.push(monthStr);
    }
    return options;
  };

  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0] || "2026-07");

  const loadActivity = async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ApiResponse<GitActivity[]>>("/admin/git/activity", {
        params: { month }
      });
      if (res.data?.data) {
        setActivities(res.data.data);
      }
    } catch (err: any) {
      console.error("加载 Git 提交活跃度失败:", err);
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity(selectedMonth);
  }, [selectedMonth]);

  // 计算所选月份总提交次数
  const totalCommits = activities.reduce((acc, curr) => acc + curr.count, 0);

  // 点击日期格子触发全局事件联动唤起 Git 监视器并带上过滤日期
  const handleDayClick = (date: string) => {
    window.dispatchEvent(
      new CustomEvent("open-git-modal", {
        detail: { date }
      })
    );
  };

  // 根据提交次数获取对应的颜色等级 (LeetCode 绿墙色系)
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-650 border border-zinc-200/20 dark:border-zinc-800/40";
    if (count <= 2) return "bg-emerald-100 dark:bg-emerald-950/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10";
    if (count <= 4) return "bg-emerald-300 dark:bg-emerald-800/60 hover:bg-emerald-400 dark:hover:bg-emerald-700/60 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20";
    if (count <= 8) return "bg-emerald-500 hover:bg-emerald-600 text-white dark:text-emerald-50 border border-emerald-600/30";
    return "bg-emerald-700 hover:bg-emerald-800 text-white dark:text-white border border-emerald-800/50";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center h-full min-h-[220px]">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={20} />
        <span className="text-[10px] font-mono text-zinc-450">CALCULATING GIT CONTRIBUTIONS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center h-full min-h-[220px] text-rose-500 text-xs">
        <span>无法加载活跃度，请检查 Git 环境</span>
        <button onClick={() => loadActivity(selectedMonth)} className="mt-2.5 px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg hover:opacity-90 active:scale-95 text-[10px]">
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.025)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between h-full gap-4 text-left">
      {/* 头部信息与月份选择器 */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
            Git Activity / 代码活跃度
          </h3>
          <p className="text-[10px] text-zinc-400">{selectedMonth} 月提交热力分布</p>
        </div>
        
        {/* 右侧：月份选择下拉框 + 提交计数标牌 */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 text-[11px] font-mono rounded-lg px-2 py-1 outline-none transition-colors cursor-pointer"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-xl text-[10.5px] font-mono shadow-3xs">
            <GitPullRequest size={11} />
            {totalCommits} COMMITS
          </div>
        </div>
      </div>

      {/* 贡献网格 */}
      <div className="flex-1 flex flex-col justify-center">
        {activities.length > 0 ? (
          <div className="grid grid-cols-7 gap-2 max-w-[280px] mx-auto py-1">
            {activities.map((item) => {
              // 提起日期号数，例如 "2026-07-01" -> 1
              const dayNum = new Date(item.date).getDate();

              return (
                <Tooltip key={item.date} delay={0}>
                  <div
                    onClick={() => handleDayClick(item.date)}
                    className={cn(
                      "aspect-square h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer select-none active:scale-95",
                      getColorClass(item.count)
                    )}
                  >
                    {dayNum}
                  </div>
                  <Tooltip.Content>
                    <div className="px-2 py-1 text-[10px] font-sans text-left">
                      <span className="font-bold block text-zinc-150">{item.date}</span>
                      <span className="text-emerald-400 font-bold font-mono">{item.count} 次提交</span>
                    </div>
                  </Tooltip.Content>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-zinc-400 font-mono text-xs py-8">
            NO ACTIVITY DATA
          </div>
        )}
      </div>

      {/* 底部 Legend 图例 */}
      <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-550 border-t border-zinc-100 dark:border-zinc-800 pt-3 select-none">
        <span className="font-mono">{selectedMonth}</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-850 border border-zinc-200/10" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 dark:bg-emerald-950/30" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-800/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
