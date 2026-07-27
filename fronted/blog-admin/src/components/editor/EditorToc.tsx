"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, PanelRightClose, PanelRightOpen, AlignLeft } from "lucide-react";
import { cn } from "@heroui/react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

interface EditorTocProps {
  editor: any;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * 后台编辑器大厂极简风格大纲/目录 (TOC) 组件
 * - 参考 语雀 / Notion / Vercel 简约设计风格
 * - 无边框冗余，全景透光融入编辑器主体
 * - 动态树轨高亮 (Active Track Line) 与渐进缩进
 */
export default function EditorToc({
  editor,
  collapsed = false,
  onToggleCollapse,
  className,
}: EditorTocProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activePos, setActivePos] = useState<number | null>(null);

  /**
   * 从 Tiptap/ProseMirror 文档中动态提取所有 Heading 标题
   */
  const updateToc = useCallback(() => {
    if (!editor || editor.isDestroyed) {
      setTocItems([]);
      return;
    }

    const items: TocItem[] = [];
    const doc = editor.state.doc;
    const { selection } = editor.state;
    const currentCursorPos = selection.from;
    let closestHeadingPos: number | null = null;

    doc.descendants((node: any, pos: number) => {
      if (node.type.name === "heading") {
        const level = node.attrs.level || 1;
        const text = node.textContent.trim();
        if (text) {
          items.push({
            id: `editor-heading-${pos}`,
            text,
            level,
            pos,
          });

          if (pos <= currentCursorPos) {
            closestHeadingPos = pos;
          }
        }
      }
    });

    setTocItems(items);
    setActivePos(closestHeadingPos ?? (items.length > 0 ? items[0].pos : null));
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    updateToc();

    editor.on("update", updateToc);
    editor.on("selectionUpdate", updateToc);

    return () => {
      editor.off("update", updateToc);
      editor.off("selectionUpdate", updateToc);
    };
  }, [editor, updateToc]);

  /**
   * 点击大纲条目：定位光标与只滚动内层编辑器容器，绝不上移外层 Dashboard 布局
   */
  const handleItemClick = (item: TocItem) => {
    if (!editor || editor.isDestroyed) return;

    // 1. 设置选区
    editor.chain().setTextSelection(item.pos).run();
    setActivePos(item.pos);

    // 2. 找到内层可滚动编辑区容器
    const editorDom = editor.view.dom as HTMLElement;
    const scrollContainer =
      (editorDom.closest(".overflow-y-auto") as HTMLElement) || editorDom.parentElement;

    if (scrollContainer) {
      const headings = editorDom.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const targetHeading = Array.from(headings).find(
        (h) => (h.textContent || "").trim() === item.text
      ) as HTMLElement;

      if (targetHeading) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const headingRect = targetHeading.getBoundingClientRect();
        const targetScrollTop =
          scrollContainer.scrollTop + (headingRect.top - containerRect.top) - 16;

        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      }
    }

    // 3. 兜底防护：防止浏览器原生聚焦把最外层 AdminLayout 视口上推露白
    requestAnimationFrame(() => {
      const adminMain = document.querySelector("main.overflow-y-auto") as HTMLElement;
      if (adminMain && adminMain.scrollTop > 0) {
        adminMain.scrollTop = 0;
      }
    });
  };

  // 折叠最小化状态
  if (collapsed) {
    return (
      <div className={cn("flex flex-col items-center py-4 px-1.5 border-l border-zinc-100 dark:border-zinc-850 select-none shrink-0", className)}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
          title="展开大纲目录"
        >
          <PanelRightOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "w-52 shrink-0 flex flex-col border-l border-zinc-100 dark:border-zinc-850/80 bg-zinc-50/20 dark:bg-zinc-900/10 select-none transition-all duration-200 h-full overflow-hidden py-3 px-3",
        className
      )}
    >
      {/* 极简顶栏 Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-100 dark:border-zinc-850/60 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          <AlignLeft size={13} className="text-zinc-400 dark:text-zinc-500" />
          <span>目录大纲</span>
          {tocItems.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-350 dark:text-zinc-600">
              ({tocItems.length})
            </span>
          )}
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
            title="收起目录"
          >
            <PanelRightClose size={14} />
          </button>
        )}
      </div>

      {/* 极简树状轨道列表 */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar text-xs">
        {tocItems.length > 0 ? (
          <div className="relative border-l border-zinc-200/50 dark:border-zinc-800/50 ml-1.5 pl-0.5 space-y-1">
            {tocItems.map((item) => {
              const isActive = activePos === item.pos;

              // 根据层级计算紧凑微缩进
              const paddingLeft =
                item.level === 1
                  ? "pl-2.5 font-medium"
                  : item.level === 2
                  ? "pl-4 text-zinc-600 dark:text-zinc-400"
                  : item.level === 3
                  ? "pl-6 text-zinc-500 dark:text-zinc-500 text-[11px]"
                  : "pl-8 text-zinc-400 dark:text-zinc-500 text-[11px]";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "relative w-full text-left py-1 text-xs leading-relaxed transition-all duration-150 rounded-r-md block truncate cursor-pointer group",
                    paddingLeft,
                    isActive
                      ? "text-primary font-semibold translate-x-0.5 dark:text-primary"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:translate-x-0.5"
                  )}
                  title={item.text}
                >
                  {/* 当前激活项的精细靠左指示轨 */}
                  {isActive && (
                    <span className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-full transition-all" />
                  )}
                  <span className="truncate block">{item.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-1.5 text-zinc-400 dark:text-zinc-600">
            <p className="text-[11px] font-mono">暂无目录</p>
            <p className="text-[10px] text-zinc-350 dark:text-zinc-600 scale-95">
              输入 # 标题 即可自动生成
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
