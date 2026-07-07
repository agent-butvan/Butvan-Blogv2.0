"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Pin,
  Loader2,
  X,
  Eye,
  MessageSquare,
  Heart,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Smile,
  Brain,
  Coffee,
  HeartHandshake,
  Star,
  Waves
} from "lucide-react";
import { cn, Button, Select, Label, ListBox, SearchField } from "@heroui/react";
import { fetchNotes, fetchNoteDetail, updateNote, deleteNote } from "@/lib/note-api";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { PageResult } from "@/types/common";
import type { NoteItem, NoteStatus } from "@/types/note";

/** 心情图标映射 */
const MOOD_ICONS: Record<string, { icon: any; label: string; color: string }> = {
  "开心": { icon: Smile, label: "开心", color: "text-amber-500" },
  "思考中": { icon: Brain, label: "思考中", color: "text-purple-500" },
  "忙碌": { icon: Coffee, label: "忙碌", color: "text-rose-500" },
  "放松": { icon: Waves, label: "放松", color: "text-sky-500" },
  "感动": { icon: HeartHandshake, label: "感动", color: "text-pink-500" },
  "平静": { icon: Star, label: "平静", color: "text-emerald-500" },
};

/** 天气图标映射 */
const WEATHER_ICONS: Record<string, { icon: any; label: string }> = {
  "晴": { icon: Sun, label: "晴" },
  "多云": { icon: CloudSun, label: "多云" },
  "阴": { icon: Cloud, label: "阴" },
  "雨": { icon: CloudRain, label: "雨" },
  "雪": { icon: Snowflake, label: "雪" },
  "风": { icon: Wind, label: "风" },
};

/**
 * 手记管理工作台 — 精简版表格
 * 支持搜索、状态筛选、分页、批量删除
 * 展示心情/天气徽章、配图缩略图
 */
export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // 操作状态
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const pageSize = 10;

  /** 加载手记列表 */
  const fetchNoteList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotes({
        page,
        size: pageSize,
        status: (statusFilter || undefined) as NoteStatus | undefined,
        keyword: keyword || undefined,
      });
      setNotes(data.records);
      setTotal(data.total);
    } catch {
      setNotes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, keyword]);

  useEffect(() => {
    fetchNoteList();
  }, [fetchNoteList]);

  // 单选/全选
  const handleCheckAll = (checked: boolean) => {
    setCheckedIds(checked ? notes.map((n) => n.id) : []);
  };
  const handleCheckOne = (id: number, checked: boolean) => {
    setCheckedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  /** 删除确认 */
  const handleDeleteRequest = (id: number) => {
    setDeleteError(null);
    setIsBulkDelete(false);
    setConfirmDeleteId(id);
  };
  const handleBulkDeleteRequest = () => {
    if (checkedIds.length === 0) return;
    setDeleteError(null);
    setIsBulkDelete(true);
    setConfirmDeleteId(checkedIds[0]);
  };
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(checkedIds.map((id) => deleteNote(id)));
        setCheckedIds([]);
      } else if (confirmDeleteId) {
        await deleteNote(confirmDeleteId);
        setCheckedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
      }
      setConfirmDeleteId(null);
      fetchNoteList();
    } catch {
      setDeleteError(isBulkDelete ? "批量删除部分失败" : "删除失败");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const isAllChecked = notes.length > 0 && checkedIds.length === notes.length;
  const isSomeChecked = checkedIds.length > 0 && checkedIds.length < notes.length;

  /** 渲染心情徽章 */
  const moodBadge = (mood?: string) => {
    if (!mood) return <span className="text-zinc-300 dark:text-zinc-700 font-mono text-[10px]">-</span>;
    const config = MOOD_ICONS[mood];
    if (!config) return <span className="text-zinc-400 text-[10px]">{mood}</span>;
    const Icon = config.icon;
    return (
      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium", config.color)}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  /** 渲染天气徽章 */
  const weatherBadge = (weather?: string) => {
    if (!weather) return null;
    const config = WEATHER_ICONS[weather];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  /** 状态标签 */
  const statusBadge = (status: string) => {
    const dotColors: Record<string, string> = {
      PUBLISHED: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]",
      DRAFT: "bg-zinc-400",
    };
    const label: Record<string, string> = { PUBLISHED: "已发布", DRAFT: "草稿" };
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[status] || "bg-zinc-400")} />
        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{label[status] || status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">手记管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / NOTES (共 {total} 篇手记)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/notes/new")}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4.5 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>写手记</span>
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {deleteError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/35 p-3.5 text-xs font-medium text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="cursor-pointer p-0.5 rounded-full hover:bg-red-100/50">
            <X size={13} />
          </button>
        </div>
      )}

      {/* 搜索 + 状态筛选 */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={keyword}
          onChange={(value) => { setKeyword(value); setPage(1); }}
          className="w-full sm:max-w-xs"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="搜索手记标题..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="flex items-end gap-1.5">
          <Label className="text-xs text-zinc-500 dark:text-zinc-400 pb-2">状态</Label>
          <Select
            selectedKey={statusFilter || "all"}
            onSelectionChange={(key) => {
              setStatusFilter(key === "all" ? "" : (key as string));
              setPage(1);
            }}
            className="w-32"
          >
            <Select.Trigger className="h-9 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox aria-label="状态筛选">
                <ListBox.Item id="all" textValue="全部状态">全部状态<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="PUBLISHED" textValue="已发布">已发布<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="DRAFT" textValue="草稿">草稿<ListBox.ItemIndicator /></ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* 手记表格 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[700px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-4 py-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  ref={(input) => { if (input) input.indeterminate = isSomeChecked; }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary accent-primary cursor-pointer"
                />
              </th>
              <th className="px-5 py-3.5">手记标题</th>
              <th className="px-5 py-3.5 w-20 text-center">心情</th>
              <th className="px-5 py-3.5 w-20 text-center">天气</th>
              <th className="px-5 py-3.5 w-24 text-center">发布状态</th>
              <th className="px-5 py-3.5 w-16 text-center">浏览</th>
              <th className="px-5 py-3.5 w-16 text-center">点赞</th>
              <th className="px-5 py-3.5 w-36">更新日期</th>
              <th className="px-5 py-3.5 w-24 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-[11px] font-medium">加载手记列表中...</span>
                  </div>
                </td>
              </tr>
            ) : notes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-zinc-400">
                  <span className="text-[11px]">暂无手记，</span>
                  <Link href="/notes/new" className="text-primary font-bold hover:underline mx-1">写一篇手记</Link>
                  <span className="text-[11px]">吧！</span>
                </td>
              </tr>
            ) : (
              notes.map((note) => {
                const isChecked = checkedIds.includes(note.id);
                return (
                  <tr key={note.id} className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150">
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckOne(note.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 min-w-0 max-w-0">
                      <div className="flex items-center gap-1.5 max-w-full min-w-0">
                        <span className="font-semibold text-neutral-dark dark:text-zinc-150 truncate flex-1 min-w-0 group-hover:text-primary transition-colors" title={note.title}>
                          {note.title}
                        </span>
                        {note.isPinned && <Pin size={10} className="text-amber-500 shrink-0 fill-amber-500/20" />}
                        <a href={`http://localhost:3000/notes/${note.slug}`} target="_blank" rel="noreferrer"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-primary transition-all shrink-0"
                          title="前台预览">
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      {note.summary && (
                        <div className="text-[11px] text-zinc-450 dark:text-zinc-500 truncate mt-1" title={note.summary}>{note.summary}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 w-20 text-center">{moodBadge(note.mood)}</td>
                    <td className="px-5 py-3.5 w-20 text-center">{weatherBadge(note.weather)}</td>
                    <td className="px-5 py-3.5 w-24 text-center">{statusBadge(note.status)}</td>
                    <td className="px-5 py-3.5 w-16 text-center font-mono font-medium text-zinc-500">{note.viewCount}</td>
                    <td className="px-5 py-3.5 w-16 text-center font-mono font-medium text-zinc-500">{note.likeCount}</td>
                    <td className="px-5 py-3.5 w-36 text-zinc-450 dark:text-zinc-500 font-mono text-[10px]">
                      {note.updatedAt ? new Date(note.updatedAt).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "--"}
                    </td>
                    <td className="px-5 py-3.5 w-24">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => router.push(`/notes/${note.id}`)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary transition-all cursor-pointer" title="编辑">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => handleDeleteRequest(note.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all cursor-pointer" title="删除">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-zinc-500 font-medium font-mono">SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 text-zinc-650 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed font-bold">
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && p - arr[idx - 1] > 1 && <span className="text-zinc-400 px-1">...</span>}
                <button onClick={() => setPage(p)}
                  className={cn("h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                    page === p ? "bg-primary border-primary text-white" : "border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600")}>
                  {p}
                </button>
              </span>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 text-zinc-650 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed font-bold">
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 批量控制面板 */}
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-35 flex items-center gap-4.5 px-6 py-3 rounded-2xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08)] border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 select-none",
        checkedIds.length > 0 ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}>
        <span className="text-[11px] font-bold text-zinc-500 font-mono">已选中 {checkedIds.length} 项</span>
        <button onClick={handleBulkDeleteRequest} disabled={actionLoading}
          className="h-8 px-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95">
          <Trash2 size={10.5} />批量删除
        </button>
        <button onClick={() => setCheckedIds([])} className="p-1 rounded-full text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition-colors cursor-pointer" title="取消">
          <X size={12.5} />
        </button>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title={isBulkDelete ? "确认批量删除" : "确认删除"}
        description={isBulkDelete ? `确定要删除选中的 ${checkedIds.length} 篇手记吗？` : "确定要删除这篇手记吗？此操作不可撤销。"}
        confirmLabel="删除"
        cancelLabel="取消"
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
