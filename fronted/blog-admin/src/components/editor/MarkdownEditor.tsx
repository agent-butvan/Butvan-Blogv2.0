"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import SlashMenu, { SLASH_COMMANDS, type SlashCommand } from "./SlashMenu";

// 引入 react-md-editor 及其预览的基础 CSS 样式，解决文本与光标错位、显示在左上方的问题
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

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
 * Markdown 编辑器封装通用组件
 * - 基于 @uiw/react-md-editor（GitHub 风格）
 * - 客户端动态加载，避免 SSR 水合问题
 * - 支持通过 preview 属性动态控制分屏状态
 * - 集成 Slash (/) 斜杠指令唤起悬浮菜单与高阶替换输入
 */
export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  placeholder = "开始 Markdown 写作... (新起一行输入 / 唤起快捷命令)",
  preview = "live",
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  // Slash 菜单状态管理
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filteredCount, setFilteredCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);

  // 检测暗黑模式
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

  // 渲染后捕获并持有底层 textarea 引用，避开 MDEditor.textareaProps 不支持 ref 属性的问题
  useEffect(() => {
    if (containerRef.current) {
      const ta = containerRef.current.querySelector("textarea");
      if (ta) {
        textareaRef.current = ta;
      }
    }
  });

  // 获取当前过滤后的命令列表（用于执行指令时根据 selectedIndex 取出元素）
  const getFilteredCommands = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.id.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 获取光标相对于编辑器 parent 的坐标
  const getCaretCoords = useCallback((textarea: HTMLTextAreaElement, position: number) => {
    const mirror = mirrorRef.current;
    if (!mirror) return { top: 0, left: 0 };

    const computed = window.getComputedStyle(textarea);
    
    // 复制排版与尺寸样式
    const STYLES_TO_COPY = [
      "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant",
      "lineHeight", "letterSpacing", "wordSpacing", "textAlign", "textTransform",
      "textIndent", "textDecoration", "wordWrap", "wordBreak", "whiteSpace",
      "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
      "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
      "borderStyle"
    ] as const;

    STYLES_TO_COPY.forEach((prop) => {
      mirror.style[prop as any] = computed[prop as any];
    });

    mirror.style.width = textarea.clientWidth + "px";
    mirror.style.height = textarea.clientHeight + "px";
    
    // 镜像内容，截取至光标字符
    mirror.textContent = textarea.value.substring(0, position);

    const span = document.createElement("span");
    span.textContent = textarea.value.substring(position, position + 1) || ".";
    mirror.appendChild(span);

    // 偏移计算：
    // Y 坐标 = textarea.offsetTop + span 的 offsetTop - textarea.scrollTop + span 的高度 + 微调
    // X 坐标 = textarea.offsetLeft + span 的 offsetLeft - textarea.scrollLeft
    const top = textarea.offsetTop + span.offsetTop - textarea.scrollTop + span.offsetHeight + 6;
    const left = textarea.offsetLeft + span.offsetLeft - textarea.scrollLeft;

    return { top, left };
  }, []);

  // 执行并回填斜杠快捷命令
  const executeCommand = useCallback((textarea: HTMLTextAreaElement, cmd: SlashCommand) => {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const textBefore = val.substring(0, start);
    const textAfter = val.substring(start);

    // 找到本行中光标前的最后一个斜杠
    const lastSlashIndex = textBefore.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const currentLineStartIndex = textBefore.lastIndexOf("\n") + 1;
      const currentLineBase = textBefore.substring(currentLineStartIndex, lastSlashIndex);

      let replaceResult: { replaceText: string; cursorOffset: number };
      if (typeof cmd.markdown === "function") {
        replaceResult = cmd.markdown(currentLineBase);
      } else {
        replaceResult = {
          replaceText: currentLineBase + cmd.markdown,
          cursorOffset: (currentLineBase + cmd.markdown).length,
        };
      }

      // 重新组装
      const newTextBefore = textBefore.substring(0, currentLineStartIndex) + replaceResult.replaceText;
      const newValue = newTextBefore + textAfter;

      onChange(newValue);
      setMenuOpen(false);

      // 精确聚焦和定位光标
      setTimeout(() => {
        textarea.focus();
        const finalCursorPos = currentLineStartIndex + replaceResult.cursorOffset;
        textarea.setSelectionRange(finalCursorPos, finalCursorPos);
      }, 50);
    }
  }, [onChange]);

  // 监听底层 Textarea 键盘按下事件，劫持并重构快捷交互
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!menuOpen) return;

    const textarea = e.currentTarget;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // 阻止滚动和跳转行
      setSelectedIndex((prev) => (prev + 1) % filteredCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // 阻止滚动和跳转行
      setSelectedIndex((prev) => (prev - 1 + filteredCount) % filteredCount);
    } else if (e.key === "Enter") {
      e.preventDefault(); // 阻止正常换行
      const cmds = getFilteredCommands();
      if (cmds.length > 0) {
        const activeCommand = cmds[selectedIndex];
        if (activeCommand) {
          executeCommand(textarea, activeCommand);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMenuOpen(false);
    }
  };

  // 输入流监听检测
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const val = textarea.value;
    const start = textarea.selectionStart;

    const textBeforeCursor = val.substring(0, start);
    const lines = textBeforeCursor.split("\n");
    const currentLineText = lines[lines.length - 1];

    // 检测斜杠时机：只允许在行首或者空格之后输入斜杠，匹配如 `/` 或 `/h1`
    const match = currentLineText.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

    if (match) {
      const query = match[1];
      setSearchQuery(query);
      setMenuOpen(true);

      // 计算斜杠字符在 textarea 的索引
      const currentLineStartIndex = textBeforeCursor.length - currentLineText.length;
      const slashIndexInText = currentLineStartIndex + (match.index ?? 0) + (match[0].startsWith(" ") ? 1 : 0);

      const coords = getCaretCoords(textarea, slashIndexInText);
      setMenuPosition(coords);
    } else {
      setMenuOpen(false);
    }
  };

  // 滚动同步
  const handleScroll = () => {
    if (menuOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const val = textarea.value;
      const textBeforeCursor = val.substring(0, start);
      const lines = textBeforeCursor.split("\n");
      const currentLineText = lines[lines.length - 1];
      const match = currentLineText.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
      if (match) {
        const currentLineStartIndex = textBeforeCursor.length - currentLineText.length;
        const slashIndexInText = currentLineStartIndex + (match.index ?? 0) + (match[0].startsWith(" ") ? 1 : 0);
        const coords = getCaretCoords(textarea, slashIndexInText);
        setMenuPosition(coords);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      data-color-mode={colorMode} 
      className="relative w-full h-full"
    >
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={height}
        visibleDragbar={false}
        preview={preview}
        textareaProps={{
          placeholder,
          onKeyDown: handleKeyDown,
          onInput: handleInput,
          onScroll: handleScroll,
        }}
      />
      <div
        ref={mirrorRef}
        className="absolute pointer-events-none opacity-0 select-none overflow-hidden"
        style={{
          boxSizing: "border-box",
        }}
      />

      {/* 斜杠唤起指令浮动菜单 */}
      {menuOpen && (
        <SlashMenu
          searchQuery={searchQuery}
          selectedIndex={selectedIndex}
          position={menuPosition}
          onFilteredCommandsChange={setFilteredCount}
          onSelectCommand={(cmd) => {
            if (textareaRef.current) {
              executeCommand(textareaRef.current, cmd);
            }
          }}
        />
      )}
    </div>
  );
}
