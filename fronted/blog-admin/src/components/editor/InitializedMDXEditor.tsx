"use client";

import { ForwardedRef } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  // 工具栏组件
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertCodeBlock,
  ListsToggle,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import apiClient from "@/lib/api";

// 导入 MDXEditor 官方样式
import "@mdxeditor/editor/style.css";

interface InitializedMDXEditorProps extends MDXEditorProps {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
}

/**
 * 客户端初始化的 MDXEditor 所见即所得编辑器组件
 * - 配置完整的 Markdown 插件链
 * - 对接后端图片上传接口，支持直接复制粘贴、拖拽或对话框选择图片上传
 * - 支持 CodeMirror 高亮代码块编辑
 */
export default function InitializedMDXEditor({
  editorRef,
  markdown,
  onChange,
  className,
  contentEditableClassName,
  ...props
}: InitializedMDXEditorProps) {
  // 图片上传处理器，对接 `/admin/media/upload` 接口
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.code === 200 || res.data.code === 0) {
        let url = res.data.data.fileUrl;
        if (url.startsWith("/")) {
          url = `http://localhost:8080${url}`;
        }
        return url;
      }
      throw new Error(res.data.msg || "图片上传失败");
    } catch (err: any) {
      console.error("编辑器上传图片错误:", err);
      throw new Error(err.message || "媒体服务接口异常，请重试");
    }
  };

  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      onChange={onChange}
      className={className}
      contentEditableClassName={contentEditableClassName}
      {...props}
      plugins={[
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        imagePlugin({
          imageUploadHandler: handleImageUpload,
        }),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            javascript: "JavaScript",
            typescript: "TypeScript",
            css: "CSS",
            html: "HTML",
            python: "Python",
            java: "Java",
            go: "Go",
            rust: "Rust",
            bash: "Bash",
            sql: "SQL",
          },
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex flex-wrap items-center gap-1.5 p-1 w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl">
              <UndoRedo />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <BoldItalicUnderlineToggles />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <BlockTypeSelect />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <ListsToggle />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertCodeBlock />
            </div>
          ),
        }),
      ]}
    />
  );
}
