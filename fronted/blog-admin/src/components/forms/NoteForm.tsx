"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@heroui/react";
import {
  Save,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowLeft,
  Settings,
  Smile,
  Sun,
  MapPin,
  MessageSquare,
  Image,
  Pin,
} from "lucide-react";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import type { NoteSaveDTO } from "@/types/note";

/** 心情选项 */
const MOOD_OPTIONS = [
  { value: "", label: "无" },
  { value: "开心", label: "开心" },
  { value: "思考中", label: "思考中" },
  { value: "忙碌", label: "忙碌" },
  { value: "放松", label: "放松" },
  { value: "感动", label: "感动" },
  { value: "平静", label: "平静" },
];

/** 天气选项 */
const WEATHER_OPTIONS = [
  { value: "", label: "无" },
  { value: "晴", label: "晴" },
  { value: "多云", label: "多云" },
  { value: "阴", label: "阴" },
  { value: "雨", label: "雨" },
  { value: "雪", label: "雪" },
  { value: "风", label: "风" },
];

export interface NoteFormProps {
  /** 初始数据（编辑模式） */
  initialData?: NoteSaveDTO;
  /** 保存回调 */
  onSave: (data: NoteSaveDTO) => Promise<void>;
  /** 是否正在保存 */
  saving?: boolean;
}

/**
 * 手记后台编辑器工作台
 * - 顶栏吸顶 Header：集成无框大标题、状态切换及侧边栏开关
 * - 双栏写作区：Markdown 编辑器 + 右下角常驻字数统计浮层
 * - 侧边滑出抽屉 (MetaDrawer)：管理摘要、心情、天气、位置等手记专属字段
 */
export default function NoteForm({ initialData, onSave, saving = false }: NoteFormProps) {
  const router = useRouter();

  // 1. UI 视图交互状态
  const [showMeta, setShowMeta] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. 表单核心数据状态
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [mood, setMood] = useState(initialData?.mood || "");
  const [weather, setWeather] = useState(initialData?.weather || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    (initialData?.status as string) === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  );
  const [isPinned, setIsPinned] = useState<boolean>(initialData?.isPinned || false);

  // 3. 正文字数及阅读时间实时统计
  const charCount = content.length;
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const paragraphCount = content.split(/\n+/).filter((p) => p.trim()).length;
  const readingMinutes = Math.ceil(charCount / 300) || 1;

  // 4. 保存与提交逻辑
  const handleTriggerSave = () => {
    const data: NoteSaveDTO = {
      title: title || "无标题",
      slug: slug || undefined,
      summary: summary || undefined,
      content,
      coverImageUrl: coverImageUrl || undefined,
      mood: mood || undefined,
      weather: weather || undefined,
      location: location || undefined,
      status,
      isPinned,
    };
    onSave(data);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-transparent min-h-[calc(100vh-140px)]">
      
      {/* 顶栏吸顶 Header：集成标题与所有核心工作流控制 */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/60 py-3 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-20 select-none">
        
        {/* 左侧：返回列表与无框扁平大标题输入 */}
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/notes")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all cursor-pointer shrink-0"
            title="返回列表"
          >
            <ArrowLeft size={16} />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="记录此刻的灵感、心情或思考..."
            required
            className="flex-1 bg-transparent px-2 h-9 text-lg font-bold font-heading text-neutral-dark dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-700 border-0 outline-none focus:ring-0 focus:outline-none transition-colors leading-none"
          />
        </div>

        {/* 右侧：短链接别名、状态配置与保存 */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* 行内 /notes/ 短链接别名槽 */}
          <div className="flex h-9 items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 text-[11px] font-mono transition-all">
            <span className="text-zinc-400 dark:text-zinc-550 select-none">/notes/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="短别名"
              className="w-18 bg-transparent p-0 border-none outline-none focus:ring-0 text-zinc-700 dark:text-zinc-300 placeholder-zinc-300 dark:placeholder-zinc-700 leading-normal"
            />
          </div>

          {/* 草稿 / 发布单选组合按钮 */}
          <div className="flex h-9 items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/30 dark:border-zinc-900/30">
            <button
              type="button"
              onClick={() => setStatus("DRAFT")}
              className={cn(
                "h-7 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center",
                status === "DRAFT"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-primary"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              草稿
            </button>
            <button
              type="button"
              onClick={() => setStatus("PUBLISHED")}
              className={cn(
                "h-7 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center",
                status === "PUBLISHED"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-primary"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              发布
            </button>
          </div>

          {/* 侧边 Drawer 配置滑块 */}
          <button
            type="button"
            onClick={() => setShowMeta(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all cursor-pointer"
            title="手记属性设置"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* 保存按钮 */}
          <button
            type="button"
            onClick={handleTriggerSave}
            disabled={saving || !title.trim()}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={13} />
            <span>{status === "PUBLISHED" ? "发布手记" : "保存草稿"}</span>
          </button>

        </div>
      </header>

      {/* 主面板写作区：内置实时预览切换与字数信息常驻 */}
      <main className="flex-1 min-h-0 relative">
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-950">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height={640}
            placeholder="记录此刻的灵感、心情或思考..."
          />

          {/* 右下角常驻统计浮层 (EditorStatsOverlay) */}
          <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-[10px] font-mono text-zinc-550 dark:text-zinc-400 select-none shadow-md z-10 flex items-center gap-4.5">
            <div className="flex items-center gap-1">
              <span>共</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{charCount}</strong>
              <span>字符</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <span>中文</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{chineseCharCount}</strong>
              <span>字</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{paragraphCount}</strong>
              <span>段落</span>
            </div>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <span>阅读约</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{readingMinutes}</strong>
              <span>分钟</span>
            </div>
          </div>
        </div>
      </main>

      {/* Portal 挂载侧边抽屉：手记专属属性面板 */}
      {mounted && createPortal(
        <>
          {/* 遮罩层 (Drawer Backdrop) */}
          {showMeta && (
            <div
              className="fixed inset-0 bg-zinc-950/30 dark:bg-zinc-950/50 backdrop-blur-xs z-[998] transition-opacity animate-[fadeIn_0.2s_ease-out]"
              onClick={() => setShowMeta(false)}
            />
          )}

          {/* 侧边滑出抽屉 (Slide Drawer Panel) */}
          <div className={cn(
            "fixed top-0 right-0 z-[999] h-full w-88 bg-white dark:bg-zinc-950 border-l border-zinc-200/80 dark:border-zinc-900/80 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-out flex flex-col gap-5.5 select-none",
            showMeta ? "translate-x-0 animate-[slideIn_0.25s_ease-out]" : "translate-x-full"
          )}>
            
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-900/60 pb-3.5">
              <h2 className="font-heading text-sm font-bold text-neutral-dark dark:text-zinc-200 flex items-center gap-2">
                <Settings size={15} />
                <span>手记设置</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowMeta(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* 抽屉设置表单内容 */}
            <div className="flex-1 space-y-5.5 custom-scrollbar overflow-y-auto pr-1 pb-6">
              
              {/* 摘要与描述 */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare size={11} />
                  <span>外显描述摘要</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="写一段简短摘要..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {/* 封面图片 */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Image size={11} />
                  <span>封面图 URL</span>
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {coverImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mt-2">
                    <img
                      src={coverImageUrl}
                      alt="封面预览"
                      className="h-24 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* 心情 (Select) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Smile size={11} />
                  <span>心情</span>
                </label>
                <div className="relative">
                  <select
                    value={mood || ""}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-880 dark:text-zinc-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                  >
                    {MOOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 天气 (Select) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sun size={11} />
                  <span>天气</span>
                </label>
                <div className="relative">
                  <select
                    value={weather || ""}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-880 dark:text-zinc-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                  >
                    {WEATHER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 位置 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={11} />
                  <span>位置</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：杭州·西湖"
                  className="w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* 属性控制开关组 */}
              <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-900/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 flex items-center gap-1.5">
                    <Pin size={11} />
                    首页置顶
                  </span>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-zinc-650 peer-checked:bg-primary"></div>
                </label>
              </div>

            </div>
          </div>
        </>,
        document.body
      )}

    </form>
  );
}
