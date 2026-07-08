"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteForm from "@/components/forms/NoteForm";
import { fetchNoteDetail, updateNote } from "@/lib/note-api";
import type { NoteDetail, NoteSaveDTO } from "@/types/note";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

/**
 * 编辑手记页面
 * - 加载已有手记数据并预填充 NoteForm
 * - 使用与编辑文章页面一致的交互模式（顶栏吸顶 + 侧边抽屉）
 */
export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载手记数据
  useEffect(() => {
    fetchNoteDetail(id)
      .then((data) => {
        if (data) setNote(data);
        else setError("手记不存在");
      })
      .catch(() => setError("加载手记数据失败"))
      .finally(() => setLoading(false));
  }, [id]);

  // 保存更新
  const handleSave = async (data: NoteSaveDTO) => {
    setSaving(true);
    setError(null);

    try {
      await updateNote(id, data);
      const msg = data.status === "PUBLISHED" ? "手记已更新并发布！" : "手记已更新！";
      toast.success(msg);
      // 更新本地缓存
      setNote((prev) =>
        prev ? { ...prev, ...data } : null
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      const errMsg = axiosErr?.response?.data?.msg || "保存失败，请重试";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 select-none">
        <Loader2 size={28} className="animate-spin text-zinc-350 dark:text-zinc-655" />
      </div>
    );
  }

  // 加载失败
  if (error && !note) {
    return (
      <div className="max-w-md mx-auto text-center py-24 select-none">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">{error}</p>
        <button
          onClick={() => router.push("/notes")}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
        >
          返回手记列表
        </button>
      </div>
    );
  }

  const initialData: NoteSaveDTO = {
    title: note?.title || "",
    slug: note?.slug,
    summary: note?.summary,
    content: note?.content || "",
    coverImageUrl: note?.coverImageUrl,
    coverImageUrls: note?.coverImageUrls,
    mood: note?.mood,
    weather: note?.weather,
    location: note?.location,
    status: note?.status || "DRAFT",
    isPinned: note?.isPinned,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 手记编辑器工作台 */}
      <NoteForm initialData={initialData} onSave={handleSave} saving={saving} />
    </div>
  );
}
