"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Check, Copy, Code, ChevronDown } from "lucide-react";

/**
 * Tiptap 代码块 React 节点渲染组件
 * - 渲染扁平精美的卡片边框
 * - 左上角：代码图标与编程语言选择下拉框（直接绑定并修改 node language 属性）
 * - 右上角：一键复制源码按钮（支持复制反馈动画）
 */
export default function CodeBlockComponent({
  node: {
    attrs: { language },
  },
  updateAttributes,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  // 复制当前代码块所有文本到剪贴板
  const handleCopy = async () => {
    // 获取编辑器内该代码块节点的文本内容
    const preEl = document.getElementById(`code-block-${language}`);
    const text = preEl?.textContent || "";
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const LANGUAGES = [
    { value: "plaintext", label: "Plain Text" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash/Shell" },
  ];

  return (
    <NodeViewWrapper className="code-block relative rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 my-5 overflow-hidden">
      {/* 顶部控制栏 */}
      <div 
        contentEditable={false} 
        className="flex items-center justify-between px-4 py-2 bg-zinc-100/70 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-850 text-xs text-zinc-500 font-mono select-none"
      >
        <div className="flex items-center gap-2">
          <Code size={13} className="text-zinc-400" />
          <div className="relative flex items-center">
            <select
              value={language || "plaintext"}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="bg-transparent pr-5 py-0.5 border-none outline-none cursor-pointer text-[11px] font-bold text-zinc-650 dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-200 appearance-none font-mono transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-0.5 pointer-events-none text-zinc-400" />
          </div>
        </div>

        {/* 右侧：复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-all cursor-pointer"
          title="复制全部代码"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-500" />
              <span className="text-emerald-500">已复制</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码编辑区 */}
      <pre 
        id={`code-block-${language}`} 
        className="p-4 m-0 font-mono text-sm leading-relaxed overflow-x-auto bg-transparent"
      >
        <NodeViewContent as={"code" as any} />
      </pre>
    </NodeViewWrapper>
  );
}
