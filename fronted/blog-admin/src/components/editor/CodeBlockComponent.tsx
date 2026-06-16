"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Check, Copy, ChevronDown } from "lucide-react";

/**
 * 高颜值 Tiptap 代码块 React 节点渲染组件
 * - 采用 macOS 三色经典窗口控制按钮装饰
 * - 支持直接交互切换编程语言的下拉菜单
 * - 右侧一键复制，提供动画反馈与对齐提示
 * - 统一采用高品质深色编辑器主题（类似 Carbon / VS Code），在明暗模式下均展现极致的高级质感
 */
export default function CodeBlockComponent({
  node: {
    attrs: { language },
  },
  updateAttributes,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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

  const currentLabel = LANGUAGES.find(l => l.value === language)?.label || "Plain Text";

  return (
    <NodeViewWrapper className="code-block-container relative rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-950 text-zinc-100 my-6 shadow-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary">
      {/* 头部控制栏 (仿 macOS 窗口) */}
      <div 
        contentEditable={false} 
        className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-850/80 text-xs text-zinc-400 font-mono select-none"
      >
        {/* 左侧：macOS 三色圆点 + 语言选择器 */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          
          <div className="h-3.5 w-px bg-zinc-800" />
          
          <div className="relative flex items-center group">
            <select
              value={language || "plaintext"}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="bg-transparent pr-6 py-0.5 border-none outline-none cursor-pointer text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 appearance-none font-mono transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-zinc-900 text-zinc-300">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-0.5 pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
        </div>

        {/* 右侧：复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border border-transparent hover:border-zinc-700/50"
          title="复制全部代码"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容编辑区 */}
      <pre 
        id={`code-block-${language}`} 
        className="p-5 m-0 font-mono text-sm leading-relaxed overflow-x-auto bg-transparent focus:outline-none focus-visible:outline-none"
      >
        <NodeViewContent as={"code" as any} className="focus:outline-none" />
      </pre>
    </NodeViewWrapper>
  );
}
