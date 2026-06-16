"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Check, Copy, ChevronDown, Code } from "lucide-react";

/**
 * 适配系统明暗模式的高颜值 Tiptap 代码块 React 节点渲染组件
 * - 顶部栏：macOS 经典三色圆点装饰 + 编程语言选择器 + 一键复制
 * - 左侧：实时行号显示列，与代码行高对齐，跟随输入动态变化
 * - 样式：深度适配系统主题（明亮模式下为浅色卡片，暗黑模式下为深色卡片），完美融入“静谧深海”配色规范
 */
export default function CodeBlockComponent({
  node,
  updateAttributes,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || "plaintext";

  // 获取文本并计算行数以渲染行号
  const textContent = node.textContent || "";
  const lines = textContent.split("\n");
  // 即使内容为空也至少显示第一行行号
  const lineCount = Math.max(lines.length, 1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
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
    <NodeViewWrapper className="code-block-container relative rounded-xl border border-zinc-200 dark:border-zinc-800 my-6 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all duration-200 overflow-hidden">
      {/* 顶部控制栏 */}
      <div 
        contentEditable={false} 
        className="code-block-header flex items-center justify-between px-4 py-2.5 border-b text-xs font-mono select-none"
      >
        {/* 左侧：macOS 窗口按钮装饰 + 语言下拉框 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/90 dark:bg-red-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 dark:bg-yellow-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/90 dark:bg-green-500/70 inline-block" />
          </div>
          
          <div className="h-3.5 w-px bg-zinc-250 dark:bg-zinc-850" />
          
          <div className="relative flex items-center group">
            <select
              value={language}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="bg-transparent pr-5 py-0.5 border-none outline-none cursor-pointer text-[11px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-primary dark:group-hover:text-zinc-200 appearance-none font-mono transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-0.5 pointer-events-none text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </div>
        </div>

        {/* 右侧：复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-[10px] font-bold transition-all cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700/50"
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

      {/* 主体区：左侧行号，右侧代码文本 */}
      <div className="code-block-body flex font-mono text-sm leading-relaxed">
        {/* 行号列 */}
        <div 
          contentEditable={false} 
          className="line-numbers-col shrink-0 select-none text-right border-r font-mono"
          style={{ 
            minWidth: "2.8rem",
            padding: "1rem 0.75rem 1rem 1rem"
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="line-number-item">{i + 1}</div>
          ))}
        </div>
        
        {/* 代码内容编辑区 */}
        <pre 
          className="flex-1 m-0 overflow-x-auto bg-transparent focus:outline-none focus-visible:outline-none"
          style={{ padding: "1rem 1rem 1rem 0.75rem" }}
        >
          <NodeViewContent as={"code" as any} className="focus:outline-none block" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
