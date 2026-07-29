"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  Globe,
  ExternalLink,
  Trash2,
  FileCode2,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@heroui/react";
import { resolveAssetUrl } from "@/lib/image-url";

/**
 * Tiptap 编辑器中嵌入 HTML 页面节点的自定义 NodeView 渲染组件
 * - 仿 macOS / 现代浏览器窗体外壳
 * - 支持 UI 弹窗优雅设置自定义标题、新标签页查看、节点删除
 */
export default function HtmlEmbedNodeView(props: any) {
  const { node, updateAttributes, deleteNode } = props;
  const rawSrc = node.attrs.src || "";
  const title = node.attrs.title || "嵌入 HTML 页面";
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  // 解析完整的访问 URL (处理相对路径 /uploads/...)
  const resolvedSrc = rawSrc.startsWith("/") ? resolveAssetUrl(rawSrc) : rawSrc;

  // 提取文件名或自定义标题作为展示标题
  const displayTitle =
    title && title !== "嵌入 HTML 页面"
      ? title
      : (rawSrc.split("/").pop() || "嵌入页面.html").replace(/\.(html|htm)$/i, "");

  // 打开修改标题 UI 模态框
  const handleOpenTitleModal = () => {
    setTempTitle(displayTitle);
    setShowTitleModal(true);
  };

  // 保存标题提交
  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempTitle.trim();
    updateAttributes({ title: trimmed || displayTitle });
    setShowTitleModal(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose select-none group/embed">
      <div className="relative w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-none overflow-hidden transition-all duration-300">
        {/* 1. 仿 Mac 浏览器顶栏控制条 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/60 backdrop-blur-md">
          {/* 左侧：Mac 三色窗体控制按钮 + 可点击修改的自定义标题芯片 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/10 shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/10 shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/10 shrink-0" />
            
            <div
              onClick={handleOpenTitleModal}
              title="点击修改 HTML 区域标题"
              className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:text-white hover:border-emerald-500/50 hover:bg-zinc-800 text-[11px] font-mono cursor-pointer group/title transition-all min-w-0"
            >
              <FileCode2 size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[220px] font-medium">{displayTitle}</span>
              <Pencil size={10} className="text-zinc-500 group-hover/title:text-emerald-400 transition-colors ml-0.5 shrink-0" />
            </div>
          </div>

          {/* 中间：网络地址/安全提示 Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs font-sans">
            <Globe size={12} className="text-zinc-500 shrink-0" />
            <span className="truncate max-w-[280px] font-mono text-[11px]">
              {resolvedSrc || "未包含有效的 HTML 源文件"}
            </span>
          </div>

          {/* 右侧：快捷交互按钮组 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 修改标题按钮 */}
            <button
              type="button"
              onClick={handleOpenTitleModal}
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
              className="w-full h-[460px] border-none bg-white block"
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

      {/* 3. 质感 UI 模态对话框：修改预览区标题 */}
      {showTitleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            {/* 模态框 Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <FileCode2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    设置 HTML 预览区域标题
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    此标题将展示在正文与预览卡片最顶栏
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTitleModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 模态框 Form 表单 */}
            <form onSubmit={handleSaveTitle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  预览卡片标题
                </label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="请输入标题..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans"
                />
              </div>

              {/* 模态框 Footer 按钮组 */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTitleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
