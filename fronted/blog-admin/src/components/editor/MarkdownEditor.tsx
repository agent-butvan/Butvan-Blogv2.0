"use client";

import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";

/**
 * Markdown 编辑器（动态导入，避免 SSR 时加载 CodeMirror 报错）
 */
const MDEditor = dynamic<MDEditorProps>(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

/**
 * Markdown 编辑器封装组件
 * - 基于 @uiw/react-md-editor（GitHub 风格）
 * - 客户端动态加载，避免 SSR 水合问题
 * - 左编辑 / 右预览分屏模式
 */
export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  placeholder = "开始 Markdown 写作...",
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={height}
        visibleDragbar={false}
        preview="live"
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
