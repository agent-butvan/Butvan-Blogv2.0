"use client";

import { useState, useEffect } from "react";
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
  preview?: "edit" | "live" | "preview";
}

/**
 * Markdown 编辑器封装组件
 * - 基于 @uiw/react-md-editor（GitHub 风格）
 * - 客户端动态加载，避免 SSR 水合问题
 * - 支持通过 preview 属性动态控制分屏状态
 */
export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  placeholder = "开始 Markdown 写作...",
  preview = "live",
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkDark = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setColorMode(isDark ? "dark" : "light");
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={height}
        visibleDragbar={false}
        preview={preview}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
