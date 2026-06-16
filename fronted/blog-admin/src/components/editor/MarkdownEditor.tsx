"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@heroui/react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

// 动态导入 InitializedMDXEditor，禁用 SSR 以避免 CodeMirror 和 Lexical 在服务端报错
const MDXEditorWrapper = dynamic(
  () => import("./InitializedMDXEditor"),
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
 * Markdown 编辑器封装通用组件（已升级为所见即所得风格）
 * - 采用 Next.js 客户端动态加载，完美契合 React 19 / SSR 水合规范
 * - 默认隐藏/移除传统的分屏预览机制，直接在当前编辑区域内以排版完的格式渲染
 * - 智能监听全局暗黑模式，无缝切换明暗配色
 */
export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  placeholder = "在这里开始你的写作吧... 支持输入 Markdown 快捷键（例如：输入 '# ' 自动转换为一级标题，输入 '> ' 转换为引用，支持直接拖拽/粘贴图片上传）",
  preview = "edit", // 忽略 preview 属性，始终展示单栏所见即所得界面
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const editorRef = useRef<MDXEditorMethods>(null);

  // 检测和监听系统与页面的暗黑模式类名变化
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

  // 监听外层 value 的更新，保证编辑器内容能够正确重置或载入（处理异步加载数据）
  useEffect(() => {
    if (editorRef.current) {
      // 避免重复设置导致光标重置
      const currentMarkdown = editorRef.current.getMarkdown();
      if (currentMarkdown !== value) {
        editorRef.current.setMarkdown(value || "");
      }
    }
  }, [value]);

  return (
    <div 
      className="relative w-full flex flex-col rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 transition-all duration-200"
      style={{ minHeight: `${height}px` }}
    >
      <MDXEditorWrapper
        editorRef={editorRef}
        markdown={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full flex-1 flex flex-col text-sm text-zinc-800 dark:text-zinc-200",
          colorMode === "dark" ? "dark-theme" : "",
          "mdxeditor-custom"
        )}
        contentEditableClassName="min-h-[500px] max-w-none p-6 outline-none focus:outline-none focus:ring-0 prose dark:prose-invert custom-editor-content"
      />
    </div>
  );
}
