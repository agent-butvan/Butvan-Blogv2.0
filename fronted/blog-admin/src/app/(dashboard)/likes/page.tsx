"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  X, 
  Loader2, 
  Trash2, 
  ExternalLink,
  Globe,
  Heart,
  Calendar,
  Smartphone,
  Laptop,
  CheckSquare,
  Square,
  User,
  FileText
} from "lucide-react";
import { cn } from "@heroui/react";
import { fetchAdminLikes, deleteLikes, LikeItem } from "@/lib/likes-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";

/**
 * 极轻量级 UserAgent 提取友好设备和系统表示
 */
const parseUA = (ua?: string | null): { browser: string; os: string; isMobile: boolean; deviceType: 'desktop' | 'mobile' | 'tablet' } => {
  if (!ua) return { browser: "未知", os: "未知", isMobile: false, deviceType: "desktop" };
  let browser = "Other";
  let os = "Other";
  
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  
  const isTablet = ua.includes("iPad") || (ua.includes("Android") && !ua.includes("Mobi"));
  const isMobile = !isTablet && (ua.includes("Mobi") || ua.includes("iPhone") || ua.includes("Android"));
  const deviceType = isTablet ? "tablet" : (isMobile ? "mobile" : "desktop");
  
  return { browser, os, isMobile: isMobile || isTablet, deviceType };
};

/**
 * 时间友好化格式
 */
const formatTime = (timeStr?: string | null): string => {
  if (!timeStr) return "";
  try {
    const d = new Date(timeStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const r = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${r} ${h}:${min}:${s}`;
  } catch {
    return timeStr;
  }
};

/**
 * 头像地址解析
 */
const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
};

export default function LikesPage() {
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchVal, setSearchVal] = useState("");

  // 复选管理
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 悬停设备环境 UA 定位及内容控制
  const [uaTooltipPos, setUaTooltipPos] = useState<{ top: number; left: number; text: string } | null>(null);

  const loadLikes = async (pageNum: number, searchKey: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminLikes({
        page: pageNum,
        size,
        keyword: searchKey || undefined
      });
      setLikes(data.records || []);
      setTotal(data.total || 0);
      setSelectedIds([]); // 加载新页面清空复选
    } catch (err: any) {
      console.error("加载点赞流水失败:", err);
      toast.error(err.message || "拉取点赞记录失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes(page, keyword);
  }, [page, keyword]);

  // 全选/反选
  const handleSelectAll = () => {
    if (selectedIds.length === likes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(likes.map(item => item.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 批量物理删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await deleteLikes(selectedIds);
      toast.success("物理删除选中的点赞流水成功");
      setBatchModalOpen(false);
      
      // 页码适配
      const remainingCount = total - selectedIds.length;
      const maxPage = Math.ceil(remainingCount / size) || 1;
      if (page > maxPage) {
        setPage(maxPage);
      } else {
        loadLikes(page, keyword);
      }
    } catch (err: any) {
      console.error("批量物理删除点赞记录失败:", err);
      toast.error(err.message || "批量删除点赞失败");
    } finally {
      setDeleting(false);
    }
  };

  // 预览文章地址，链接到前台页面
  const getArticleClientUrl = (slug: string) => {
    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
    return `${clientUrl}/article/${slug}`;
  };

  // 导出 CSV 格式的点赞流水
  const handleExportCSV = () => {
    if (likes.length === 0) {
      toast.error("没有可导出的数据");
      return;
    }
    // CSV 头部
    const headers = ["ID", "文章标题", "文章Slug", "点赞人/来源", "UID", "IP地址", "设备系统", "浏览器", "点赞时间"];
    // CSV 内容
    const rows = likes.map(item => {
      const uaInfo = parseUA(item.userAgent);
      const userType = item.userId ? `会员(${item.userNickname})` : "游客";
      return [
        item.id,
        `"${(item.articleTitle || '').replace(/"/g, '""')}"`,
        `"${(item.articleSlug || '').replace(/"/g, '""')}"`,
        `"${userType}"`,
        item.userId || "",
        item.ipAddress || "",
        uaInfo.os || "",
        uaInfo.browser || "",
        formatTime(item.createdAt)
      ];
    });
    
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `点赞记录流水_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("当前页数据导出成功");
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 - 与其他页面高度统一 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">点赞记录管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / LIKES (共 {total} 条点赞记录)
          </p>
        </div>
      </div>

      {/* 筛选 + 搜索栏与辅助状态工具栏 - 与 articles 高度统一 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 w-full transition-all focus-within:ring-2 focus-within:ring-rose-500/15 focus-within:border-rose-500/60">
            <Search size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setKeyword(e.target.value.trim());
                setPage(1);
              }}
              placeholder="搜索 IP 地址 / 文章标题..."
              className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-800 dark:text-zinc-100 outline-none placeholder-zinc-400 dark:placeholder-zinc-650 focus:ring-0 leading-normal"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  setKeyword("");
                  setPage(1);
                }}
                className="text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200 cursor-pointer border-0 bg-transparent"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 辅助状态与工具区 */}
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-3 animate-[fadeIn_0.15s_ease-out] select-none">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-xs font-mono">
                  已选中 {selectedIds.length} 项
                </span>
              </div>
              <button
                onClick={() => setBatchModalOpen(true)}
                className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Trash2 size={11} />
                <span>批量删除</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 select-none">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>RUNNING</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="h-8 px-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-600 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>导出 CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 表格面板层 - 与全站统一采用 rounded-2xl 卡片包裹表格 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col min-h-[300px]">
        {loading ? (
          /* 排线骨架屏加载占位 */
          <div className="flex-1">
            <table className="w-full text-left border-collapse table-auto select-none">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50/70 dark:bg-zinc-900/40 uppercase tracking-widest">
                  <th className="px-4 py-3.5 w-10"></th>
                  <th className="px-4 py-3">点赞对象/文章</th>
                  <th className="px-4 py-3">点赞人/来源</th>
                  <th className="px-4 py-3 w-32">IP 地址</th>
                  <th className="px-4 py-3 w-40">设备环境</th>
                  <th className="px-4 py-3 w-44">点赞时间</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50 animate-pulse">
                    <td className="px-4 py-3 w-10">
                      <div className="w-4 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-[3px]"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-[3px]"></div>
                        <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-2/3"></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                        <div className="flex flex-col gap-1 w-24">
                          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-full"></div>
                          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-2/3"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-[3px] w-28"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : likes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-zinc-400 dark:text-zinc-500 select-none">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center text-zinc-350 dark:text-zinc-650">
              <Heart size={20} />
            </div>
            <span className="text-xs">暂无符合条件的点赞记录流水</span>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto select-none">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  <th className="px-4 py-3.5 w-10">
                    <button onClick={handleSelectAll} className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer border-0 bg-transparent">
                      {selectedIds.length === likes.length ? (
                        <CheckSquare size={15} className="text-rose-500" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">点赞对象/文章</th>
                  <th className="px-4 py-3.5">点赞人/来源</th>
                  <th className="px-4 py-3.5 w-32">IP 地址</th>
                  <th className="px-4 py-3.5 w-40">设备环境</th>
                  <th className="px-4 py-3.5 w-44">点赞时间</th>
                </tr>
              </thead>
              <tbody className="text-xs text-zinc-600 dark:text-zinc-350 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {likes.map((item) => {
                  const uaInfo = parseUA(item.userAgent);
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-zinc-50/50 dark:hover:bg-zinc-950/25 transition-colors duration-150",
                        isSelected ? "bg-rose-500/5 dark:bg-rose-500/5" : ""
                      )}
                    >
                      {/* 复选框 */}
                      <td className="px-4 py-2.5">
                        <button onClick={() => handleSelectOne(item.id)} className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer border-0 bg-transparent">
                          {isSelected ? (
                            <CheckSquare size={15} className="text-rose-500" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      {/* 点赞对象/文章 */}
                      <td className="px-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <div className="w-6 h-6 rounded-[3px] bg-rose-500/5 text-rose-500 border border-rose-500/10 flex items-center justify-center shrink-0">
                            <FileText size={11} />
                          </div>
                          <span className="truncate text-[12px] font-bold text-zinc-800 dark:text-zinc-200" title={item.articleTitle}>
                            {item.articleTitle}
                          </span>
                          {item.articleSlug && (
                            <a
                              href={getArticleClientUrl(item.articleSlug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                              title="在新窗口预览文章"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 点赞人/来源 */}
                      <td className="px-4 py-2.5">
                        {item.userId ? (
                          <div className="flex items-center gap-2">
                            {item.userAvatar ? (
                              <img
                                src={resolveAvatarUrl(item.userAvatar)}
                                alt={item.userNickname}
                                className="w-6 h-6 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-[10px] font-bold uppercase border border-rose-500/10">
                                {item.userNickname.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col select-text">
                              <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[110px] leading-tight text-[11px]">
                                {item.userNickname}
                              </span>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">UID: {item.userId}</span>
                            </div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold bg-rose-500/10 text-rose-500 uppercase border border-rose-500/20 scale-90 origin-left">
                              会员
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/40 dark:border-zinc-700/50 text-zinc-400 dark:text-zinc-550 shrink-0">
                              <User size={11} />
                            </div>
                            <div className="flex flex-col select-text">
                              <span className="text-zinc-700 dark:text-zinc-400 font-bold leading-tight text-[11px]">游客</span>
                              <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono mt-0.5" title={item.ipAddress}>
                                {item.ipAddress === "0:0:0:0:0:0:0:1" || item.ipAddress === "::1" ? "127.0.0.1" : item.ipAddress.split('.').slice(0, 2).join('.') + '.*.*'}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase border border-zinc-200/50 dark:border-zinc-700/45 scale-90 origin-left">
                              访客
                            </span>
                          </div>
                        )}
                      </td>

                      {/* IP 地址 */}
                      <td className="px-4 py-2.5 select-text">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.75 font-mono text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800 rounded-[3px] text-zinc-500 dark:text-zinc-400">
                          <Globe size={10} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>{item.ipAddress === "0:0:0:0:0:0:0:1" || item.ipAddress === "::1" ? "127.0.0.1" : item.ipAddress}</span>
                        </div>
                      </td>

                      {/* 设备环境 */}
                      <td className="px-4 py-2.5">
                        <div
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setUaTooltipPos({
                              top: rect.top - 8,
                              left: rect.left + rect.width / 2,
                              text: item.userAgent
                            });
                          }}
                          onMouseLeave={() => setUaTooltipPos(null)}
                          className="inline-flex items-center gap-1.5 cursor-help"
                        >
                          {uaInfo.deviceType === "mobile" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-250/20 dark:border-amber-900/30">
                              <Smartphone size={10} />
                              <span>{uaInfo.os}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border border-zinc-200/35 dark:border-zinc-700/40">
                              <Laptop size={10} />
                              <span>{uaInfo.os}</span>
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">({uaInfo.browser})</span>
                        </div>
                      </td>

                      {/* 点赞时间 */}
                      <td className="px-4 py-2.5">
                        <div className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-450 dark:text-zinc-500">
                          <Calendar size={10.5} className="shrink-0 text-zinc-400 dark:text-zinc-600" />
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 底部简明分页栏 - 样式对齐全站 */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/50 dark:border-zinc-800/40 text-xs">
            <span className="text-zinc-500 dark:text-zinc-450 font-medium font-mono">
              SHOWING PAGE {page} OF {Math.ceil(total / size) || 1} ({total} ITEMS)
            </span>
            <div className="flex items-center gap-1.5 font-bold select-none">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 transition-all cursor-pointer font-bold outline-none active:scale-[0.98]"
              >
                上一页
              </button>
              <button
                disabled={page * size >= total}
                onClick={() => setPage(p => p + 1)}
                className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 transition-all cursor-pointer font-bold outline-none active:scale-[0.98]"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 确认物理删除的模态窗 */}
      <ConfirmModal
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        onConfirm={handleBatchDelete}
        title="确认批量删除点赞流水？"
        description={`您确定要彻底从数据库中删除选中的 ${selectedIds.length} 条点赞记录吗？该操作属于物理删除，删除后该点赞对应的文章点赞计数不会减少，但流水数据将永久丢失。`}
        confirmLabel="确认彻底物理删除"
        cancelLabel="取消"
        variant="danger"
        loading={deleting}
      />

      {/* 设备 UA 悬浮详情（借助 Portal 全局无遮挡挂载） */}
      {uaTooltipPos && (
        <Portal>
          <div 
            style={{ 
              position: 'fixed', 
              top: `${uaTooltipPos.top}px`, 
              left: `${uaTooltipPos.left}px`,
              transform: 'translate(-50%, -100%)' 
            }}
            className="z-50 w-72 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-200 text-[10px] p-2.5 rounded-md break-all font-mono leading-relaxed shadow-xl border border-zinc-800 dark:border-zinc-800 animate-[fadeIn_0.12s_ease-out] pointer-events-none select-text animate-[fadeIn_0.1s_ease-out]"
          >
            <div className="font-bold text-rose-400 mb-1.5 border-b border-zinc-850 pb-1 flex items-center justify-between">
              <span>完整 User-Agent</span>
              <span className="text-[9px] text-zinc-500 font-normal font-sans">设备指纹</span>
            </div>
            <div className="text-zinc-350 leading-relaxed font-mono">{uaTooltipPos.text}</div>
            {/* 气泡指向小尖角 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[5px] border-transparent border-t-zinc-950/95 dark:border-t-zinc-950/95"></div>
          </div>
        </Portal>
      )}
    </div>
  );
}
