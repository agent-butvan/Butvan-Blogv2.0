"use client";

import { AlertTriangle } from "lucide-react";

/**
 * 通用确认弹窗
 * - 用于删除、切换状态等需要二次确认的操作
 * - 支持自定义标题、描述、确认/取消文案、按钮样式
 */
export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = "确认操作",
  description = "确定要执行此操作吗？此操作可能不可撤销。",
  confirmLabel = "确定",
  cancelLabel = "取消",
  variant = "danger", // danger | warning | primary
  loading = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}) {
  if (!open) return null;

  const confirmColors: Record<string, string> = {
    danger: "bg-red-500 hover:bg-red-600 focus:ring-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/20",
    primary: "bg-primary hover:opacity-90 focus:ring-primary/20",
  };

  const iconColors: Record<string, string> = {
    danger: "text-red-500 bg-red-50 dark:bg-red-950/20",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
    primary: "text-primary bg-primary/10 dark:bg-primary/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* 弹窗 */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 shadow-xl animate-slide-up">
        <div className="p-6 text-center">
          {/* 图标 */}
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconColors[variant]}`}
          >
            <AlertTriangle size={22} />
          </div>

          {/* 标题 */}
          <h3 className="font-heading text-lg font-semibold text-neutral-dark dark:text-zinc-100 mb-2">
            {title}
          </h3>

          {/* 描述 */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
        </div>

        {/* 按钮 */}
        <div className="flex items-center border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-bl-2xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-br-2xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 ${confirmColors[variant]}`}
          >
            {loading ? "处理中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
