"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextSelection } from "@tiptap/pm/state";
import CodeBlockComponent from "./CodeBlockComponent";
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { cn } from "@heroui/react";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

import ImageNodeViewComponent from "./ImageNodeViewComponent";
import SlashMenu, { SLASH_COMMANDS, type SlashCommand } from "./SlashMenu";
import apiClient from "@/lib/api";
import { resolveAssetUrl } from "@/lib/image-url";

const lowlight = createLowlight(all);

// 富文本/代码颜色高亮预设
const COLOR_PRESETS = [
  { name: "玫瑰红", color: "#e11d48", bg: "rgba(225, 29, 72, 0.12)" },
  { name: "翡翠绿", color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },
  { name: "宝石蓝", color: "#2563eb", bg: "rgba(37, 99, 235, 0.12)" },
  { name: "雅致紫", color: "#7c3aed", bg: "rgba(124, 58, 237, 0.12)" },
  { name: "琥珀黄", color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" },
  { name: "石墨灰", color: "#3f3f46", bg: "rgba(63, 63, 70, 0.12)" },
];

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** 当编辑器内图片发生变化时回调，直接传递从文档节点提取的图片 URL 数组（避免 markdown 序列化差异） */
  onImageChange?: (urls: string[]) => void;
  height?: number;
  placeholder?: string;
  preview?: "edit" | "live" | "preview";
}

/**
 * Tiptap 基于 ProseMirror 的所见即所得编辑器组件
 * - 支持 Markdown 无缝双向解析
 * - 输入时直接渲染样式，支持标准 Markdown 快捷键（例如输入 "# " 变一级标题，"> " 变引用）
 * - 完美整合 Slash (/) 悬浮快捷指令菜单
 * - 拦截 paste / drop 事件实现贴图、拖图自动异步上传
 */
export default function MarkdownEditor({
  value,
  onChange,
  onImageChange,
  height = 500,
  placeholder = "输入 / 唤起快捷命令，输入 #+空格 快速创建标题...",
  preview = "edit",
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  // 保持最新 onImageChange 引用，避免 useEditor 闭包陷阱
  const onImageChangeRef = useRef(onImageChange);
  useEffect(() => {
    onImageChangeRef.current = onImageChange;
  }, [onImageChange]);

  /**
   * 从 ProseMirror 文档中直接提取所有图片节点的 src URL
   * 绕过 markdown 序列化，避免 getMarkdown() 导致 URL 编码差异
   */
  const extractImagesFromDoc = useCallback((editorInstance: any) => {
    if (!onImageChangeRef.current || !editorInstance) return;
    const doc = editorInstance.state.doc;
    const urls: string[] = [];
    doc.descendants((node: any) => {
      if (node.type.name === "image" && node.attrs?.src) {
        const src = node.attrs.src.trim();
        if (src && !urls.includes(src)) {
          urls.push(src);
        }
      }
    });
    onImageChangeRef.current(urls);
  }, []);

  // Slash 菜单浮层状态
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filteredCount, setFilteredCount] = useState(0);

  // 文本与代码调色盘状态
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#e11d48");
  const [customBg, setCustomBg] = useState("rgba(225, 29, 72, 0.12)");

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 维持最新状态引用，防止 Keydown 回调中形成 ProseMirror 闭包陷阱
  const menuOpenRef = useRef(false);
  const selectedIndexRef = useRef(0);
  const filteredCountRef = useRef(0);
  const searchQueryRef = useRef("");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    filteredCountRef.current = filteredCount;
  }, [filteredCount]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // 暗黑模式检测
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

  // 过滤后的命令集
  const getFilteredCommands = useCallback((customQuery?: string) => {
    const query = (customQuery !== undefined ? customQuery : searchQueryRef.current).trim().toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.id.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  }, []);

  // 为被 keydown 闭包调用的方法建立 Ref
  const getFilteredCommandsRef = useRef(getFilteredCommands);
  useEffect(() => {
    getFilteredCommandsRef.current = getFilteredCommands;
  }, [getFilteredCommands]);

  // 上传图片处理，对接 `/admin/media/upload` 接口
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", "ARTICLE");
    formData.append("sourceDetail", "文章正文插图");
    const res = await apiClient.post("/admin/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.code === 200 || res.data.code === 0) {
      let url = res.data.data.fileUrl;
      if (url.startsWith("/")) {
        url = resolveAssetUrl(url);
      }
      return url;
    }
    throw new Error(res.data.msg || "图片上传失败");
  };

  // 执行斜杠快捷命令
  const executeCommand = useCallback((cmd: SlashCommand) => {
    const activeEditor = editorRef.current;
    if (!activeEditor) return;

    const { selection } = activeEditor.state;
    const { $from } = selection;
    const textContent = $from.parent.textContent;
    const textBeforeCursor = textContent.slice(0, $from.parentOffset);

    // 匹配行尾的斜杠，以及其后面的字母 query
    const match = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    if (match) {
      const matchText = match[0];
      // 计算斜杠字符在整个编辑区中的绝对起止位置，以便将其擦除
      const slashIndex = match.index! + (matchText.startsWith(" ") ? 1 : 0);
      const fromPos = selection.from - (textBeforeCursor.length - slashIndex);
      const toPos = selection.from;

      let chain = activeEditor.chain().focus().deleteRange({ from: fromPos, to: toPos });

      // 根据指令映射对应的 Tiptap 排版方法
      if (cmd.id === "h1") {
        chain = chain.setHeading({ level: 1 });
      } else if (cmd.id === "h2") {
        chain = chain.setHeading({ level: 2 });
      } else if (cmd.id === "h3") {
        chain = chain.setHeading({ level: 3 });
      } else if (cmd.id === "quote") {
        chain = chain.toggleBlockquote();
      } else if (cmd.id === "code") {
        chain = chain.toggleCodeBlock();
      } else if (cmd.id === "ul") {
        chain = chain.toggleBulletList();
      } else if (cmd.id === "ol") {
        chain = chain.toggleOrderedList();
      } else if (cmd.id === "task") {
        chain = chain.toggleTaskList();
      } else if (cmd.id === "hr") {
        chain = chain.setHorizontalRule();
      } else if (cmd.id === "table") {
        chain = chain.insertContent("\n| 列 1 | 列 2 |\n| ---- | ---- |\n| 内容 | 内容 |\n");
      } else if (cmd.id === "link") {
        const url = prompt("请输入链接 URL:", "https://");
        if (url) {
          chain = chain.toggleLink({ href: url });
        }
      } else if (cmd.id === "image") {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = async () => {
          if (fileInput.files && fileInput.files[0]) {
            try {
              const url = await handleImageUpload(fileInput.files[0]);
              activeEditor.chain().focus().setImage({ src: url }).run();
            } catch (err: any) {
              alert(err.message || "上传失败");
            }
          }
        };
        fileInput.click();
      }

      chain.run();
    }
    setMenuOpen(false);
  }, []);

  const executeCommandRef = useRef(executeCommand);
  useEffect(() => {
    executeCommandRef.current = executeCommand;
  }, [executeCommand]);

  // 检测斜杠并更新位置
  const handleSlashDetection = (currEditor: any) => {
    const { selection } = currEditor.state;
    const { $from } = selection;

    // 如果光标在代码块内部，不要弹出斜杠指令菜单，避免正常编写注释或路径时受到打扰
    const isInsideCodeBlock = $from && $from.parent && $from.parent.type.name === "codeBlock";
    if (isInsideCodeBlock) {
      setMenuOpen(false);
      return;
    }

    const textContent = $from.parent.textContent;
    const textBeforeCursor = textContent.slice(0, $from.parentOffset);
    const match = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

    if (match) {
      const query = match[1];
      setSearchQuery(query);
      setMenuOpen(true);

      try {
        const coords = currEditor.view.coordsAtPos(selection.from);
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          
          // 动态智能方向定位判定：
          // 列表每一项 44px，头部 35px，最大 max-h-60 约 240px。动态计算当前过滤后的命令列表高度
          const activeCmds = getFilteredCommands(query);
          const menuHeight = Math.min(240, activeCmds.length * 44 + 35);
          
          // 计算光标底部距离编辑最外层容器底部的可用垂直空间
          const spaceBelow = containerRect.bottom - coords.bottom;
          
          let top = 0;
          // 如果下方空间不够容纳菜单，并且上方空间较多，就自适应翻转向上弹出
          if (spaceBelow < menuHeight && (coords.top - containerRect.top) > spaceBelow) {
            top = coords.top - containerRect.top - menuHeight - 6;
          } else {
            top = coords.bottom - containerRect.top + 6;
          }
          
          const left = coords.left - containerRect.left;
          
          setMenuPosition({
            top,
            left,
          });
        }
      } catch (err) {
        console.warn("获取光标像素坐标失败:", err);
      }
    } else {
      setMenuOpen(false);
    }
  };

  // 初始化 Tiptap 编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
      Markdown,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary hover:underline cursor-pointer",
        },
      }),
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageNodeViewComponent);
        },
      }).configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg border border-zinc-200 dark:border-zinc-800 my-2 inline-block shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose list-none p-0 my-3",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2.5 my-1.5",
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value || "",
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "focus:outline-none custom-editor-content p-6 min-h-[500px]",
      },
      // 劫持键盘事件进行 Slash 菜单上下按键和回车劫持
      handleDOMEvents: {
        keydown: (view, event) => {
          if (menuOpenRef.current) {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelectedIndex((prev) => (prev + 1) % filteredCountRef.current);
              return true;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setSelectedIndex((prev) => (prev - 1 + filteredCountRef.current) % filteredCountRef.current);
              return true;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              const cmds = getFilteredCommandsRef.current();
              const activeCommand = cmds[selectedIndexRef.current];
              if (activeCommand) {
                executeCommandRef.current(activeCommand);
              }
              return true;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setMenuOpen(false);
              return true;
            }
          }

          // 如果光标在代码块中，支持高阶 Tab 缩进及括号自动闭合/越界逻辑 (提供智能 CodeMirror/IDE 编辑体验)
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          const isInsideCodeBlock = $from && $from.parent && $from.parent.type.name === "codeBlock";

          if (isInsideCodeBlock) {
            // 1. 按下 Tab 键时，插入 2 个空格而不是失去焦点
            if (event.key === "Tab") {
              event.preventDefault();
              view.dispatch(state.tr.insertText("  "));
              return true;
            }

            // 2. 按下 Enter 键换行时自动缩进
            if (event.key === "Enter") {
              event.preventDefault();
              const textContent = $from.parent.textContent;
              const offset = $from.parentOffset;
              
              // 找到当前行的起点
              const lastNewline = textContent.lastIndexOf("\n", offset - 1);
              const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
              
              // 光标之前的当前行内容
              const currentLineBeforeCursor = textContent.slice(lineStart, offset);
              
              // 提取缩进空白字符
              const matchIndent = currentLineBeforeCursor.match(/^\s*/);
              const indent = matchIndent ? matchIndent[0] : "";
              
              // 判定是否需要增加额外缩进 (针对冒号或大括号结尾)
              const trimmedLine = currentLineBeforeCursor.trimEnd();
              let extraIndent = "";
              if (trimmedLine.endsWith(":") || trimmedLine.endsWith("{")) {
                extraIndent = "  ";
              }
              
              const insertText = "\n" + indent + extraIndent;
              const tr = state.tr;
              tr.insertText(insertText);
              const targetPos = Math.min(selection.from + insertText.length, tr.doc.content.size);
              tr.setSelection(TextSelection.create(tr.doc, targetPos));
              view.dispatch(tr);
              return true;
            }

            // 3. 括号与引号自动闭合
            const brackets: Record<string, string> = {
              "(": ")",
              "{": "}",
              "[": "]",
              '"': '"',
              "'": "'",
              "`": "`",
            };

            if (brackets[event.key] !== undefined) {
              event.preventDefault();
              const closing = brackets[event.key];
              const tr = state.tr;
              tr.insertText(event.key + closing);
              const targetPos = Math.min(selection.from + 1, tr.doc.content.size);
              tr.setSelection(TextSelection.create(tr.doc, targetPos));
              view.dispatch(tr);
              return true;
            }

            // 3. 越过自动闭合的右侧括号/引号
            const textContent = $from.parent.textContent;
            const textAfterCursor = textContent.slice($from.parentOffset, $from.parentOffset + 1);
            if (event.key === textAfterCursor && [")", "}", "]", '"', "'", "`"].includes(event.key)) {
              event.preventDefault();
              const tr = state.tr;
              const targetPos = Math.min(selection.from + 1, tr.doc.content.size);
              tr.setSelection(TextSelection.create(tr.doc, targetPos));
              view.dispatch(tr);
              return true;
            }
          }

          return false;
        },
        // 拖入文件自动上传
        drop: (view, event) => {
          const files = event.dataTransfer?.files;
          if (files && files.length > 0 && files[0].type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(files[0]).then((url) => {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (coordinates) {
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            }).catch((err) => alert(err.message || "图片拖拽上传失败"));
            return true;
          }
          return false;
        },
        // 粘贴文件自动上传或粘贴可访问图片 URL 链接自动渲染为图片
        paste: (view, event) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return false;

          // 1. 本地图片文件粘贴
          const files = clipboardData.files;
          if (files && files.length > 0 && files[0].type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(files[0])
              .then((url) => {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              })
              .catch((err) => alert(err.message || "粘贴图片上传失败"));
            return true;
          }

          // 2. 粘贴可访问图片 URL 文本链接识别
          const pastedText = clipboardData.getData("text/plain")?.trim();
          if (pastedText && /^https?:\/\/[^\s]+$/i.test(pastedText) && !pastedText.includes("\n")) {
            const isImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|avif|bmp)(\?.*)?$/i.test(pastedText);
            const isImageKeywords = /(image|img|photo|pic|avatar|media|oss|cos|qncdn)/i.test(pastedText);

            if (isImageExtension || isImageKeywords) {
              event.preventDefault();
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: pastedText });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
              return true;
            }
          }

          return false;
        },
      },
    },
    onUpdate: ({ editor: currEditor }) => {
      // 实时反向生成 Markdown 文本回传给 Form 表单
      const markdown = currEditor.getMarkdown();
      onChange(markdown || "");
      // 从 ProseMirror 文档直接提取图片 URL 回调
      extractImagesFromDoc(currEditor);
      handleSlashDetection(currEditor);
    },
    onSelectionUpdate: ({ editor: currEditor }) => {
      handleSlashDetection(currEditor);
    },
  });

  // 同步最新的 editor 实例到 Ref 中，彻底打破 handleDOMEvents 的闭包陷阱
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // 监听来自外部 value 状态（在数据加载出来时设置到编辑器中）
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentMarkdown = editor.getMarkdown();
      if (currentMarkdown !== value) {
        editor.commands.setContent(value || "", {
          contentType: "markdown",
        });
      }
      // 初始加载或外部数据变化时，也提取图片 URL
      extractImagesFromDoc(editor);
    }
  }, [value, editor, extractImagesFromDoc]);

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full flex flex-col rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 transition-all duration-200",
        colorMode === "dark" ? "dark" : ""
      )}
      style={{ minHeight: `${height}px` }}
    >
      {/* 顶部富文本排版工具栏 */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40"
          title="撤销 (Ctrl+Z)"
        >
          <Undo size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40"
          title="重做 (Ctrl+Y)"
        >
          <Redo size={14} />
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("bold") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="加粗"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("italic") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="斜体"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("underline") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="下划线"
        >
          <UnderlineIcon size={14} />
        </button>

        {/* 文本与行内代码高亮调色盘 */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={cn(
              "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1",
              (editor.isActive("textStyle") || editor.isActive("highlight") || showColorPicker) && "bg-primary/10 text-primary border-primary/20"
            )}
            title="字色与背景高亮调色盘"
          >
            <Palette size={14} />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-60 animate-fade-in">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2 flex items-center justify-between">
                <span>文本与代码着色方案</span>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().unsetHighlight().run();
                    setShowColorPicker(false);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-primary underline cursor-pointer"
                >
                  重置/清除着色
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 mb-1.5">快捷调色组合：</div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(preset.color).toggleHighlight({ color: preset.bg }).run();
                      setShowColorPicker(false);
                    }}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:border-primary/50 text-[11px] cursor-pointer transition-all"
                    style={{ backgroundColor: preset.bg, color: preset.color }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: preset.color }} />
                    <span className="truncate font-mono font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">仅文字颜色:</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      editor.chain().focus().setColor(e.target.value).run();
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">仅背景高亮色:</span>
                  <input
                    type="color"
                    value={customBg}
                    onChange={(e) => {
                      setCustomBg(e.target.value);
                      editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("heading", { level: 1 }) && "bg-primary/10 text-primary border-primary/20"
          )}
          title="标题 1"
        >
          <Heading1 size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("heading", { level: 2 }) && "bg-primary/10 text-primary border-primary/20"
          )}
          title="标题 2"
        >
          <Heading2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("heading", { level: 3 }) && "bg-primary/10 text-primary border-primary/20"
          )}
          title="标题 3"
        >
          <Heading3 size={14} />
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("bulletList") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="无序列表"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("orderedList") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="有序列表"
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("taskList") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="任务清单"
        >
          <CheckSquare size={14} />
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("blockquote") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="引用块"
        >
          <Quote size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("codeBlock") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="代码编辑区"
        >
          <Code size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          title="插入分割线"
        >
          <Minus size={14} />
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => {
            const url = prompt("请输入超链接 URL:", "https://");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={cn(
            "p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer",
            editor.isActive("link") && "bg-primary/10 text-primary border-primary/20"
          )}
          title="插入超链接"
        >
          <LinkIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = async () => {
              if (fileInput.files && fileInput.files[0]) {
                try {
                  const url = await handleImageUpload(fileInput.files[0]);
                  editor.chain().focus().setImage({ src: url }).run();
                } catch (err: any) {
                  alert(err.message || "上传失败");
                }
              }
            };
            fileInput.click();
          }}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          title="添加图片"
        >
          <ImageIcon size={14} />
        </button>
      </div>

      {/* 编辑器核心内容区域 */}
      <div 
        className="flex-1 w-full bg-white dark:bg-zinc-950 overflow-y-auto"
        onScroll={() => setMenuOpen(false)}
      >
        <EditorContent editor={editor} />
      </div>

      {/* 斜杠指令浮动菜单 */}
      {menuOpen && (
        <SlashMenu
          searchQuery={searchQuery}
          selectedIndex={selectedIndex}
          position={menuPosition}
          onFilteredCommandsChange={setFilteredCount}
          onSelectCommand={executeCommand}
        />
      )}
    </div>
  );
}
