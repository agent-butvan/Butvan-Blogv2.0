"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  Globe,
  ExternalLink,
  Trash2,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileCode2,
  Pencil,
} from "lucide-react";
import { cn } from "@heroui/react";
import { resolveAssetUrl } from "@/lib/image-url";

/**
 * Tiptap 编辑器中嵌入 HTML 页面节点的自定义 NodeView 渲染组件
 * - 仿 macOS / 现代浏览器窗体外壳
 * - 支持编辑器内直观操作：新标签页查看、修改自定义标题、自适应全屏切换、节点删除
 */
export default function HtmlEmbedNodeView(props: any) {
  const { node, updateAttributes, deleteNode } = props;
  const rawSrc = node.attrs.src || "";
  const title = node.attrs.title || "嵌入 HTML 页面";
  const [isExpanded, setIsExpanded] = useState(false);

  // 解析完整的访问 URL (处理相对路径 /uploads/...)
  const resolvedSrc = rawSrc.startsWith("/") ? resolveAssetUrl(rawSrc) : rawSrc;

  // 提取文件名或自定义标题作为展示标题
  const displayTitle =
    title && title !== "嵌入 HTML 页面"
      ? title
      : (rawSrc.split("/").pop() || "嵌入页面.html").replace(/\.(html|htm)$/i, "");

  // 修改 HTML 区域标题处理
  const handleEditTitle = () => {
    const inputTitle = prompt("设置该 HTML 预览区域的标题：", displayTitle);
    if (inputTitle !== null) {
      const trimmed = inputTitle.trim();
      updateAttributes({ title: trimmed || displayTitle });
    }
  };

  return (
    <NodeViewWrapper className="my-6 not-prose select-none group/embed">
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-none overflow-hidden transition-all duration-300",
          isExpanded ? "fixed inset-4 z-50 my-0 rounded-xl" : "relative w-full"
        )}
      >
        {/* 1. 仿 Mac 浏览器顶栏控制条 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/60 backdrop-blur-md">
          {/* 左侧：Mac 三色窗体控制按钮 + 可点击修改的自定义标题芯片 */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/10" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/10" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/10" />
            
            <div
              onClick={handleEditTitle}
              title="点击修改 HTML 区域标题"
              className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:text-white hover:border-emerald-500/50 hover:bg-zinc-800 text-[11px] font-mono cursor-pointer group/title transition-all"
            >
              <FileCode2 size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] font-medium">{displayTitle}</span>
              <Pencil size={10} className="text-zinc-500 group-hover/title:text-emerald-400 transition-colors ml-0.5" />
            </div>
          </div>

          {/* 中间：网络地址/安全提示 Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs font-sans">
            <Globe size={12} className="text-zinc-500" />
            <span className="truncate max-w-[280px] font-mono text-[11px]">
              {resolvedSrc || "未包含有效的 HTML 源文件"}
            </span>
          </div>

          {/* 右侧：快捷交互按钮组 */}
          <div className="flex items-center gap-1">
            {/* 修改标题按钮 */}
            <button
              type="button"
              onClick={handleEditTitle}
              title="修改区域标题"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <Pencil size={14} />
            </button>

            {/* 新标签页打开链接 */}
            {resolvedSrc && (
              <a
                href={resolvedSrc}
                target="_blank"
                rel="noopener noreferrer"
                title="在新标签页中打开查看"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}

            {/* 切换全屏/高度控制 */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "还原窗口大小" : "展开全屏预览"}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* 删除当前嵌入节点 */}
            <button
              type="button"
              onClick={deleteNode}
              title="移除该 HTML 嵌入页面"
              className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 2. HTML Iframe 主内容渲染区 */}
        <div className="relative w-full bg-white dark:bg-zinc-950">
          {resolvedSrc ? (
            <iframe
              src={resolvedSrc}
              title={displayTitle}
              className={cn(
                "w-full border-none bg-white transition-all",
                isExpanded ? "h-[calc(100vh-60px)]" : "h-[460px]"
              )}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 text-sm">
              <FileCode2 size={32} className="text-zinc-600 mb-2" />
              <p>暂无有效的 HTML 页面资源</p>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
