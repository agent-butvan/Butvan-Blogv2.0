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
  Square
} from "lucide-react";
import { cn } from "@heroui/react";
import { fetchAdminLikes, deleteLikes, LikeItem } from "@/lib/likes-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";

/**
 * 极轻量级 UserAgent 提取友好设备和系统表示
 */
const parseUA = (ua?: string | null): { name: string; isMobile: boolean } => {
  if (!ua) return { name: "未知设备", isMobile: false };
  let browser = "Other";
  let os = "Other";
  
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  
  const isMobile = ua.includes("Mobi") || ua.includes("Android") || ua.includes("iPhone") || ua.includes("iPad");
  return { name: `${browser} · ${os}`, isMobile };
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

  // 悬浮展现 UA 的 Tooltip 状态控制
  const [hoveredUaId, setHoveredUaId] = useState<number | null>(null);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchVal.trim());
  };

  const handleClearSearch = () => {
    setSearchVal("");
    setKeyword("");
    setPage(1);
  };

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

  return (
    <div className="w-full flex flex-col gap-3.5 p-3.5">
      {/* 顶部简明标题与操作栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 px-4 py-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center">
            <Heart size={16} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">点赞记录管理</h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">查看前台文章游客和登录用户的点赞流水，支持安全过滤与物理删除</p>
          </div>
        </div>

        {/* 顶部条件查询 */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="搜索 IP 地址 / 文章标题"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white cursor-pointer select-none"
          >
            筛选
          </button>
        </form>
      </div>

      {/* 批量操作控制浮格 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/20 rounded-lg px-4 py-2 text-xs animate-[fadeIn_0.15s_ease-out]">
          <span className="font-semibold text-rose-700 dark:text-rose-400">已选中 {selectedIds.length} 条点赞记录流水</span>
          <button
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            批量彻底删除
          </button>
        </div>
      )}

      {/* 表格面板层 */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 overflow-hidden flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 py-24 select-none">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs text-zinc-400">正在拉取点赞流水，请稍候...</span>
          </div>
        ) : likes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-zinc-400 dark:text-zinc-500 select-none">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-350 dark:text-zinc-650">
              <Heart size={20} />
            </div>
            <span className="text-xs">暂无符合条件的点赞记录流水</span>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto select-none">
              <thead>
                <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 text-[11px] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20 font-semibold tracking-wider">
                  <th className="px-4 py-3.5 w-10">
                    <button onClick={handleSelectAll} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      {selectedIds.length === likes.length ? (
                        <CheckSquare size={15} className="text-primary" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">点赞对象/文章</th>
                  <th className="px-4 py-3">点赞人/来源</th>
                  <th className="px-4 py-3 w-32">IP 地址</th>
                  <th className="px-4 py-3 w-40">设备环境</th>
                  <th className="px-4 py-3 w-44">点赞时间</th>
                </tr>
              </thead>
              <tbody className="text-xs text-zinc-600 dark:text-zinc-300 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {likes.map((item) => {
                  const uaInfo = parseUA(item.userAgent);
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all duration-100",
                        isSelected ? "bg-primary/5 dark:bg-primary/5 font-medium" : ""
                      )}
                    >
                      {/* 复选框 */}
                      <td className="px-4 py-3">
                        <button onClick={() => handleSelectOne(item.id)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                          {isSelected ? (
                            <CheckSquare size={15} className="text-primary" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      {/* 点赞对象/文章 */}
                      <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-1.5 max-w-[280px]">
                          <span className="truncate" title={item.articleTitle}>
                            {item.articleTitle}
                          </span>
                          {item.articleSlug && (
                            <a
                              href={getArticleClientUrl(item.articleSlug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-primary transition-colors flex-shrink-0 cursor-pointer"
                              title="在新窗口预览文章"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 点赞人/来源 */}
                      <td className="px-4 py-3">
                        {item.userId ? (
                          <div className="flex items-center gap-2">
                            {item.userAvatar ? (
                              <img
                                src={resolveAvatarUrl(item.userAvatar)}
                                alt={item.userNickname}
                                className="w-5 h-5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase">
                                {item.userNickname.charAt(0)}
                              </div>
                            )}
                            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">{item.userNickname}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase">用户</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-150/70 dark:bg-zinc-800 text-zinc-500 uppercase">游客</span>
                          </div>
                        )}
                      </td>

                      {/* IP 地址 */}
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Globe size={11} className="text-zinc-450 dark:text-zinc-650" />
                          <span>{item.ipAddress === "0:0:0:0:0:0:0:1" || item.ipAddress === "::1" ? "127.0.0.1" : item.ipAddress}</span>
                        </div>
                      </td>

                      {/* 设备环境 */}
                      <td className="px-4 py-3 relative">
                        <div
                          onMouseEnter={() => setHoveredUaId(item.id)}
                          onMouseLeave={() => setHoveredUaId(null)}
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 cursor-help"
                        >
                          {uaInfo.isMobile ? (
                            <Smartphone size={11} className="text-zinc-450" />
                          ) : (
                            <Laptop size={11} className="text-zinc-450" />
                          )}
                          <span className="underline decoration-dotted decoration-zinc-300 dark:decoration-zinc-700">{uaInfo.name}</span>

                          {/* 悬停详情 Tooltip（用精美悬浮浮格展示全部 UA 信息） */}
                          {hoveredUaId === item.id && (
                            <div className="absolute left-4 bottom-7.5 z-40 bg-zinc-950 text-zinc-200 text-[10px] p-2 rounded-lg max-w-[260px] break-all font-mono leading-relaxed shadow-xl border border-zinc-800 animate-[fadeIn_0.1s_ease-out] select-text">
                              <div className="font-bold text-primary mb-1 border-b border-zinc-800 pb-0.5">完整 User-Agent</div>
                              {item.userAgent}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 点赞时间 */}
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} />
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

        {/* 底部简明分页栏 */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/50 dark:border-zinc-800/40 text-xs">
            <span className="text-zinc-400">显示第 {(page - 1) * size + 1} 到 {Math.min(page * size, total)} 条，共 {total} 条</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-40 disabled:hover:bg-transparent text-zinc-500 font-semibold cursor-pointer"
              >
                上一页
              </button>
              <button
                disabled={page * size >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-40 disabled:hover:bg-transparent text-zinc-500 font-semibold cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 确认物理删除的模态窗 */}
      <ConfirmModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onConfirm={handleBatchDelete}
        title="确认批量删除点赞流水？"
        message={`您确定要彻底从数据库中删除选中的 ${selectedIds.length} 条点赞记录吗？该操作属于物理删除，删除后该点赞对应的文章点赞计数不会减少，但流水数据将永久丢失。`}
        confirmText="确认彻底物理删除"
        cancelText="取消"
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
}
