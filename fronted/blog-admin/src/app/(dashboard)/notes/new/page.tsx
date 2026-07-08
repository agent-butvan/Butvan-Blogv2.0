"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteForm from "@/components/forms/NoteForm";
import { createNote } from "@/lib/note-api";
import type { NoteSaveDTO } from "@/types/note";
import { toast } from "@/lib/toast";

/**
 * 新建手记页面
 * - 使用 NoteForm 高保真编辑器工作台，与新建文章页面保持一致交互模式
 * - 顶栏吸顶 Header + 侧边抽屉属性面板 + 右下角常驻字数统计
 */
export default function NewNotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: NoteSaveDTO) => {
    setSaving(true);

    try {
      const created = await createNote(data);

      const msg =
        data.status === "PUBLISHED" ? "手记已发布！正在跳转编辑页..." : "草稿已保存！正在跳转编辑页...";
      toast.success(msg);

      // 短暂延迟后跳转，让用户看到成功提示
      setTimeout(() => {
        if (created?.id) {
          router.push(`/notes/${created.id}`);
        } else {
          router.push("/notes");
        }
      }, 600);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      const errMsg = axiosErr?.response?.data?.msg || "保存失败，请重试";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 手记编辑器工作台 */}
      <NoteForm onSave={handleSave} saving={saving} />
    </div>
  );
}
