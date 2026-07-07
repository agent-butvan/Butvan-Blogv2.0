"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Loader2, Smile, Brain, Coffee, HeartHandshake, Star, Waves, Sun, CloudSun, Cloud, CloudRain, Snowflake, Wind, MapPin } from "lucide-react";
import { cn, Input, TextArea, Select, ListBox } from "@heroui/react";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import { fetchNoteDetail, updateNote } from "@/lib/note-api";
import type { NoteDetail, NoteSaveDTO } from "@/types/note";
import { toast } from "@/lib/toast";

/** 心情选项 */
const MOOD_OPTIONS = [
  { value: "", label: "无", icon: null },
  { value: "开心", label: "开心", icon: Smile },
  { value: "思考中", label: "思考中", icon: Brain },
  { value: "忙碌", label: "忙碌", icon: Coffee },
  { value: "放松", label: "放松", icon: Waves },
  { value: "感动", label: "感动", icon: HeartHandshake },
  { value: "平静", label: "平静", icon: Star },
];

/** 天气选项 */
const WEATHER_OPTIONS = [
  { value: "", label: "无", icon: null },
  { value: "晴", label: "晴", icon: Sun },
  { value: "多云", label: "多云", icon: CloudSun },
  { value: "阴", label: "阴", icon: Cloud },
  { value: "雨", label: "雨", icon: CloudRain },
  { value: "雪", label: "雪", icon: Snowflake },
  { value: "风", label: "风", icon: Wind },
];

/**
 * 编辑手记页面
 * - 加载已有手记数据并预填充表单
 * - 双栏布局：左 MarkdownEditor + 右元数据面板
 */
export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [mood, setMood] = useState("");
  const [weather, setWeather] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载手记数据
  useEffect(() => {
    fetchNoteDetail(id)
      .then((data) => {
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setSummary(data.summary || "");
          setMood(data.mood || "");
          setWeather(data.weather || "");
          setLocation(data.location || "");
          setStatus(data.status || "DRAFT");
        } else {
          setError("手记不存在");
        }
      })
      .catch(() => setError("加载手记数据失败"))
      .finally(() => setLoading(false));
  }, [id]);

  /** 保存手记（草稿或发布） */
  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error("请输入手记标题");
      return;
    }
    if (!content.trim()) {
      toast.error("请输入手记内容");
      return;
    }

    setSaving(true);
    try {
      const dto: NoteSaveDTO = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || undefined,
        mood: mood || undefined,
        weather: weather || undefined,
        location: location.trim() || undefined,
        status: publish ? "PUBLISHED" : "DRAFT",
      };
      await updateNote(id, dto);
      const msg = publish ? "手记已更新并发布！" : "手记已更新！";
      toast.success(msg);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      toast.error(axiosErr?.response?.data?.msg || "保存失败，请重试");
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
  if (error && !title && !content) {
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

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* 顶部面包屑控制条 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/notes")}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            手记管理
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
            {title || "编辑手记"}
          </span>
          {/* 状态徽标 */}
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
            status === "PUBLISHED"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status === "PUBLISHED" ? "bg-emerald-500" : "bg-zinc-400")} />
            {status === "PUBLISHED" ? "已发布" : "草稿"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4 text-xs font-bold text-zinc-650 dark:text-zinc-350 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            保存草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 px-4 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            发布手记
          </button>
        </div>
      </div>

      {/* 双栏布局：左正文 + 右元数据 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：标题 + 编辑器 */}
        <div className="flex-1 min-w-0 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="手记标题..."
            className="w-full h-12 rounded-xl border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-base font-bold"
          />
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height={520}
            placeholder="记录此刻的灵感、心情或思考..."
          />
        </div>

        {/* 右侧：元数据面板 */}
        <div className="w-full lg:w-64 shrink-0 space-y-5">
          {/* 摘要 */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">摘要</h3>
            <TextArea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="写一段简短摘要..."
              rows={3}
              className="w-full rounded-xl border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs"
            />
          </div>

          {/* 心情 */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Smile size={13} /> 心情
            </h3>
            <Select
              selectedKey={mood || "none"}
              onSelectionChange={(key) => setMood(key === "none" ? "" : (key as string))}
              className="w-full"
            >
              <Select.Trigger className="h-9 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label="选择心情">
                  {MOOD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <ListBox.Item key={opt.value || "none"} id={opt.value || "none"} textValue={opt.label}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon size={14} />}
                          <span>{opt.label}</span>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    );
                  })}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* 天气 */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sun size={13} /> 天气
            </h3>
            <Select
              selectedKey={weather || "none"}
              onSelectionChange={(key) => setWeather(key === "none" ? "" : (key as string))}
              className="w-full"
            >
              <Select.Trigger className="h-9 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox aria-label="选择天气">
                  {WEATHER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <ListBox.Item key={opt.value || "none"} id={opt.value || "none"} textValue={opt.label}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon size={14} />}
                          <span>{opt.label}</span>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    );
                  })}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* 位置 */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={13} /> 位置
            </h3>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="如：杭州·西湖"
              className="w-full h-9 rounded-xl border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
