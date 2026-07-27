"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ListTree, ChevronRight, Hash } from "lucide-react";
import { cn } from "@heroui/react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

interface EditorTocProps {
  editor: any;
  /** 是否折叠展开大纲面板 */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * 后台编辑器实时大纲/目录（TOC）组件
 * - 实时提取 Tiptap 编辑器内所有 Heading 标题（H1 - H6）
 * - 参考前台博客详情页样式呈现多级缩进与高亮
 * - 点击条目可精确定位光标并滚动编辑器至目标位置
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
   * 从 Tiptap/ProseMirror doc 提取所有标题节点
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

          // 计算离当前光标最近的上方标题作为激活态
          if (pos <= currentCursorPos) {
            closestHeadingPos = pos;
          }
        }
      }
    });

    setTocItems(items);
    setActivePos(closestHeadingPos ?? (items.length > 0 ? items[0].pos : null));
  }, [editor]);

  // 监听编辑器更新和选区/光标移动
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
   * 点击大纲项：跳转光标并平滑滚动
   */
  const handleItemClick = (item: TocItem) => {
    if (!editor || editor.isDestroyed) return;

    // 1. 设置光标与选区到目标 position
    editor.chain().focus().setTextSelection(item.pos).run();
    setActivePos(item.pos);

    // 2. 获取目标 Node DOM 并平滑滚动
    try {
      const domNode = editor.view.nodeDOM(item.pos) as HTMLElement | null;
      if (domNode && typeof domNode.scrollIntoView === "function") {
        domNode.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // 退化处理：查询选择器
        const editorEl = editor.view.dom as HTMLElement;
        const headings = editorEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const matchingHeading = Array.from(headings).find(
          (h) => (h.textContent || "").trim() === item.text
        );
        if (matchingHeading) {
          matchingHeading.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } catch (e) {
      console.warn("滚动定位至标题失败:", e);
    }
  };

  if (collapsed) {
    return (
      <div className={cn("flex flex-col items-center py-3 px-1 border-l border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 select-none", className)}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-primary hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          title="展开文章目录"
        >
          <ListTree size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "w-56 shrink-0 flex flex-col border-l border-zinc-200/50 dark:border-zinc-850 bg-zinc-50/40 dark:bg-zinc-900/20 select-none transition-all duration-200 h-full overflow-hidden",
        className
      )}
    >
      {/* 头部标题与控制按钮 */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200/40 dark:border-zinc-800/40 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold font-heading text-zinc-600 dark:text-zinc-300">
          <ListTree size={14} className="text-primary" />
          <span>文章目录</span>
          {tocItems.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-normal">
              {tocItems.length}
            </span>
          )}
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            title="收起目录"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* 目录列表核心区域 */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
        {tocItems.length > 0 ? (
          tocItems.map((item) => {
            const isActive = activePos === item.pos;

            // 根据 level 计算级联左边距与缩进视觉
            const indentClass =
              item.level === 1
                ? "pl-2 font-bold text-zinc-800 dark:text-zinc-200"
                : item.level === 2
                ? "pl-4 font-semibold text-zinc-700 dark:text-zinc-300"
                : item.level === 3
                ? "pl-6 font-normal text-zinc-600 dark:text-zinc-400 text-[11px]"
                : "pl-8 font-normal text-zinc-500 dark:text-zinc-500 text-[11px]";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full text-left py-1.5 px-2 rounded-lg text-xs leading-relaxed transition-all duration-150 flex items-center gap-1.5 group cursor-pointer truncate",
                  indentClass,
                  isActive
                    ? "bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-primary shadow-xs border-l-2 border-primary"
                    : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-primary"
                )}
                title={`Level ${item.level}: ${item.text}`}
              >
                <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity font-mono shrink-0">
                  H{item.level}
                </span>
                <span className="truncate">{item.text}</span>
              </button>
            );
          })
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-zinc-400 dark:text-zinc-600">
            <Hash size={20} className="opacity-40" />
            <p className="text-[11px] font-mono">正文中未包含标题</p>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500">
              提示：使用 # + 空格 可快速添加标题
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
