"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  X, 
  Loader2, 
  Check, 
  Trash, 
  Trash2, 
  ShieldAlert, 
  RotateCcw, 
  Reply, 
  ExternalLink,
  MessageSquare,
  Globe,
  Terminal,
  FileText
} from "lucide-react";
import { cn } from "@heroui/react";
import { 
  fetchAdminComments, 
  updateCommentStatus, 
  replyComment, 
  deleteComment 
} from "@/lib/comments-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";
import type { CommentItem } from "@/types/comment";

/**
 * 评论状态 Tab 定义
 */
const STATUS_TABS = [
  { label: "全部", value: "" },
  { label: "待审核", value: "PENDING" },
  { label: "已通过", value: "APPROVED" },
  { label: "垃圾评论", value: "SPAM" },
  { label: "回收站", value: "TRASH" }
];

export default function CommentsPage() {
  // 分页与列表状态
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  // 检索过滤条件
  const [currentTab, setCurrentTab] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchVal, setSearchVal] = useState("");

  // 回复 Modal 状态
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [targetComment, setTargetComment] = useState<CommentItem | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // 彻底删除确认 Modal 状态
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 状态流转加载状态 (防抖/防重点击)
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<number, boolean>>({});

  /** 加载评论列表数据 */
  const loadComments = async (pageNum: number, tabStatus: string, searchKey: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminComments({
        page: pageNum,
        size,
        status: tabStatus || undefined,
        keyword: searchKey || undefined
      });
      setComments(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("加载评论列表失败:", err);
      toast.error(err.message || "加载评论列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 监听条件触发加载 (Tab/页码/搜索关键词)
  useEffect(() => {
    loadComments(page, currentTab, keyword);
  }, [page, currentTab, keyword]);

  /** 触发搜索查询 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchVal.trim());
  };

  /** 清空搜索 */
  const handleClearSearch = () => {
    setSearchVal("");
    setKeyword("");
    setPage(1);
  };

  /** 切换 Tab 页签 */
  const handleTabChange = (status: string) => {
    setCurrentTab(status);
    setPage(1);
  };

  /** 更新评论状态的操作 */
  const handleStatusChange = async (id: number, targetStatus: string) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await updateCommentStatus(id, targetStatus);
      toast.success("评论状态更新成功");
      // 局部刷新或者重新加载
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("更新评论状态失败:", err);
      toast.error(err.message || "状态更新失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  /** 打开回复弹窗 */
  const handleOpenReply = (comment: CommentItem) => {
    setTargetComment(comment);
    setReplyContent("");
    setReplyModalOpen(true);
  };

  /** 提交回复 */
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetComment) return;
    if (!replyContent.trim()) {
      toast.error("请输入回复内容");
      return;
    }

    setReplySubmitting(true);
    try {
      await replyComment(targetComment.id, replyContent.trim());
      toast.success("回复发表成功");
      setReplyModalOpen(false);
      // 重新加载列表以同步状态
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("快捷回复失败:", err);
      toast.error(err.message || "快捷回复失败");
    } finally {
      setReplySubmitting(false);
    }
  };

  /** 触发彻底物理删除请求 */
  const handleDeleteRequest = (id: number) => {
    setConfirmDeleteId(id);
  };

  /** 确认物理删除评论 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteComment(confirmDeleteId);
      toast.success("评论已永久删除");
      setConfirmDeleteId(null);
      // 如果当前页只有一条数据且不是第一页，则退回上一页
      if (comments.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        loadComments(page, currentTab, keyword);
      }
    } catch (err: any) {
      console.error("删除评论失败:", err);
      toast.error(err.message || "删除评论失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 计算总页数
  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">评论管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / COMMENTS (共 {total} 条评论)
          </p>
        </div>
      </div>

      {/* 紧凑过滤区 (Tab 状态切换 & 模糊搜索) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50">
        {/* 状态 Tabs */}
        <div className="flex items-center gap-1 select-none overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap outline-none border-0",
                currentTab === tab.value
                  ? "bg-primary text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 flex-1 w-full sm:w-60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索发言人、邮箱或评论正文..."
              className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-150 outline-none placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-0 leading-normal"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 评论表格 - 高信息密度, 拒绝过度模块留白 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[950px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-5 py-3 w-56">评论发言人</th>
              <th className="px-5 py-3">评论正文内容</th>
              <th className="px-5 py-3 w-48">归属文章</th>
              <th className="px-5 py-3 w-36 text-center">发布时间</th>
              <th className="px-5 py-3 w-44 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={20} className="animate-spin text-primary" />
                    <span className="text-[11px] font-medium tracking-wide">拉取评论数据列表中...</span>
                  </div>
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-zinc-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <MessageSquare size={22} className="text-zinc-300 dark:text-zinc-700" />
                    <span className="text-[11px]">本状态下暂无评论数据记录</span>
                  </div>
                </td>
              </tr>
            ) : (
              comments.map((comment) => {
                const isPending = comment.status === "PENDING";
                const isApproved = comment.status === "APPROVED";
                const isSpam = comment.status === "SPAM";
                const isTrash = comment.status === "TRASH";
                const isActionLoading = statusLoadingMap[comment.id] || false;

                return (
                  <tr
                    key={comment.id}
                    className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150"
                  >
                    {/* 发言人栏 - 高密度合并展示头像、昵称、邮箱 */}
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={comment.avatarUrl}
                          alt="avatar"
                          className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/30 dark:border-zinc-700/30 object-cover"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-dark dark:text-zinc-150 truncate max-w-[120px] leading-snug">
                              {comment.nickname}
                            </span>
                            {comment.userId && (
                              <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#b0a2ff] px-1 rounded text-[8px] font-bold select-none leading-none scale-90 origin-left">
                                博主
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-none">
                            {comment.visitorWebsite ? (
                              <a
                                href={comment.visitorWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-primary hover:underline flex items-center gap-0.5"
                              >
                                <span>{comment.nickname}</span>
                                <Globe size={8} />
                              </a>
                            ) : (
                              <span>访客</span>
                            )}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-mono truncate select-all leading-normal">
                            {comment.visitorWebsite || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 评论内容栏 */}
                    <td className="px-5 py-3 align-top">
                      <div className="space-y-1">
                        {comment.replyTo && (
                          <div className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-850 px-1 py-0.5 rounded leading-none select-none">
                            <span>回复 @{comment.replyTo}</span>
                          </div>
                        )}
                        <p className="text-zinc-800 dark:text-zinc-200 text-xs whitespace-pre-wrap break-words leading-relaxed font-sans max-h-24 overflow-y-auto custom-scrollbar pr-1">
                          {comment.content}
                        </p>
                        {/* 状态徽章与是否已回复 */}
                        <div className="flex items-center gap-2 pt-1 select-none">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none scale-95 origin-left",
                              isApproved && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
                              isPending && "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
                              isSpam && "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
                              isTrash && "bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            )}
                          >
                            {isApproved && "已通过"}
                            {isPending && "待审核"}
                            {isSpam && "垃圾"}
                            {isTrash && "回收站"}
                          </span>

                          {comment.isAuthorReplied && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none scale-95 origin-left">
                              博主已回
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 所属文章栏 */}
                    <td className="px-5 py-3 align-top font-medium text-zinc-500 dark:text-zinc-400">
                      {comment.articleTitle ? (
                        <div className="space-y-1">
                          <div className="flex items-start gap-1">
                            <FileText size={12} className="text-zinc-400 mt-0.5 shrink-0" />
                            <span className="text-zinc-850 dark:text-zinc-200 font-semibold leading-tight line-clamp-2">
                              {comment.articleTitle}
                            </span>
                          </div>
                          {comment.articleSlug && (
                            <a
                              href={`/articles/${comment.articleId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-primary hover:underline"
                            >
                              <span>跳转详情</span>
                              <ExternalLink size={8} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-mono">—</span>
                      )}
                    </td>

                    {/* 发布时间栏 */}
                    <td className="px-5 py-3 align-top text-center font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* 操作栏 - 精致紧凑, 根据不同状态提供不同管理闭环 */}
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-center justify-end gap-1 select-none">
                        {isActionLoading ? (
                          <Loader2 size={13} className="animate-spin text-zinc-400 mr-2" />
                        ) : (
                          <>
                            {/* 回复按钮：非回收站且非垃圾评论状态可回复 */}
                            {!isTrash && !isSpam && (
                              <button
                                onClick={() => handleOpenReply(comment)}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer outline-none border-0"
                                title="快捷回复"
                              >
                                <Reply size={13} />
                              </button>
                            )}

                            {/* 待审核下 -> 审核通过 */}
                            {isPending && (
                              <button
                                onClick={() => handleStatusChange(comment.id, "APPROVED")}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 hover:text-emerald-500 transition-all cursor-pointer outline-none border-0"
                                title="审核通过"
                              >
                                <Check size={13} />
                              </button>
                            )}

                            {/* 待审核或已通过 -> 移到垃圾评论 */}
                            {(isPending || isApproved) && (
                              <button
                                onClick={() => handleStatusChange(comment.id, "SPAM")}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-amber-50 dark:hover:bg-amber-955/35 hover:text-amber-500 transition-all cursor-pointer outline-none border-0"
                                title="标记为垃圾评论"
                              >
                                <ShieldAlert size={13} />
                              </button>
                            )}

                            {/* 非回收站 -> 移到回收站 */}
                            {!isTrash ? (
                              <button
                                onClick={() => handleStatusChange(comment.id, "TRASH")}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer outline-none border-0"
                                title="移至回收站"
                              >
                                <Trash size={13} />
                              </button>
                            ) : (
                              // 回收站下 -> 恢复到待审核
                              <button
                                onClick={() => handleStatusChange(comment.id, "PENDING")}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer outline-none border-0"
                                title="还原为待审核"
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}

                            {/* 垃圾评论或回收站下 -> 彻底物理删除 */}
                            {(isSpam || isTrash) && (
                              <button
                                onClick={() => handleDeleteRequest(comment.id)}
                                className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all cursor-pointer outline-none border-0"
                                title="彻底物理删除"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控制区 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 select-none">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            SHOWING PAGE {page} OF {totalPages} (TOTAL {total} RECORDS)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="h-7 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 transition-colors cursor-pointer outline-none"
            >
              上一页
            </button>
            <span className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300 px-2 select-none">
              {page}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="h-7 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 transition-colors cursor-pointer outline-none"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 管理员快捷回复 Modal */}
      {replyModalOpen && targetComment && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-xs animate-fade-in"
              onClick={() => !replySubmitting && setReplyModalOpen(false)}
            />

            {/* 弹窗面板 */}
            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 shadow-xl animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-heading text-base font-bold text-neutral-dark dark:text-zinc-150 flex items-center gap-1.5">
                    <Reply size={16} className="text-primary" />
                    <span>快捷回复评论</span>
                  </h3>
                  <button
                    disabled={replySubmitting}
                    onClick={() => setReplyModalOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleReplySubmit} className="mt-4 space-y-4">
                  {/* 原评论预览 */}
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-850 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      <span>评论人: {targetComment.nickname}</span>
                      <span>•</span>
                      <span>{new Date(targetComment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-350 text-xs break-words line-clamp-3 leading-relaxed">
                      {targetComment.content}
                    </p>
                  </div>

                  {/* 回复内容框 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      我的回复内容
                    </label>
                    <textarea
                      disabled={replySubmitting}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="输入对该评论的回复内容，支持换行..."
                      rows={4}
                      className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed"
                    />
                  </div>

                  {/* 底栏按钮 */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={replySubmitting}
                      onClick={() => setReplyModalOpen(false)}
                      className="flex-1 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={replySubmitting}
                      className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {replySubmitting && <Loader2 size={13} className="animate-spin" />}
                      <span>发布回复</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 彻底物理删除二次确认 Modal */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="确认彻底删除评论"
        description="确定要彻底物理删除这条评论吗？此操作属于敏感的不可逆行为，一旦在数据库中执行，其所有数据及与前台对应的展示关系都将永久丢失且无法恢复。"
        confirmLabel="彻底删除"
        cancelLabel="取消"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
