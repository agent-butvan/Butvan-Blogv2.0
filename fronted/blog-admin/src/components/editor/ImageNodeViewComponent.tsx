"use client";

import React, { useState, useEffect } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  ImageOff,
  RefreshCw,
  Link as LinkIcon,
  Upload,
  Trash2,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import apiClient from "@/lib/api";
import { resolveAssetUrl } from "@/lib/image-url";

/**
 * Tiptap 自定义 Image React NodeView 组件
 * - 支持图片加载失败/破损检测与友好卡片提示
 * - 展示图片原 URL 并支持复制
 * - 提供替换 URL 与本地重新上传接口
 * - 正常展示时悬浮提供微控工具栏
 */
export default function ImageNodeViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const src = node.attrs.src || "";
  const alt = node.attrs.alt || "";

  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(src);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 当 src 更新时重置错误状态
  useEffect(() => {
    setHasError(false);
    setInputUrl(src);
  }, [src]);

  // 复制当前图片 URL
  const handleCopyUrl = () => {
    if (!src) return;
    navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 提交替换图片 URL
  const handleSaveUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputUrl.trim();
    if (trimmed && trimmed !== src) {
      updateAttributes({ src: trimmed });
      setHasError(false);
    }
    setIsEditing(false);
  };

  // 本地重新上传图片处理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "ARTICLE");
      formData.append("sourceDetail", "替换文章图片");

      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 200 || res.data.code === 0) {
        let newUrl = res.data.data.fileUrl;
        if (newUrl.startsWith("/")) {
          newUrl = resolveAssetUrl(newUrl);
        }
        updateAttributes({ src: newUrl });
        setHasError(false);
        setIsEditing(false);
      } else {
        alert(res.data.msg || "图片上传失败");
      }
    } catch (err: any) {
      alert(err.message || "上传出错");
    } finally {
      setUploading(false);
    }
  };

  return (
    <NodeViewWrapper className="my-3 inline-block max-w-full select-none">
      {hasError ? (
        /* ================= 图片加载失败 / 破损卡片区域 ================= */
        <div className="w-full max-w-xl p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 transition-all duration-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <ImageOff size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                图片加载失败
                <span className="text-[11px] font-normal text-rose-500/80 dark:text-rose-400/80 bg-rose-100/80 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                  链接不可用或已被移除
                </span>
              </h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                无法成功载入指定资源，您可以复制当前链接排查，或直接替换新的可访问链接。
              </p>
            </div>
          </div>

          {/* 当前失败 URL 展示框 */}
          <div className="mb-3 flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-lg border border-rose-200/60 dark:border-rose-900/40 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <LinkIcon size={13} className="shrink-0 text-zinc-400" />
            <span className="truncate flex-1 select-all">{src || "未设置链接"}</span>
            {src && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-700 transition-colors"
                  title="复制链接"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-700 transition-colors"
                  title="新标签页打开"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {/* 操作按纽 / 替换输入框 */}
          {isEditing ? (
            <form onSubmit={handleSaveUrl} className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="请输入或粘贴可访问的图片 URL 链接..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium cursor-pointer shrink-0"
                >
                  应用新链接
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-300 transition-colors cursor-pointer shrink-0"
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/40 dark:border-rose-900/30">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                替换图片链接
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors cursor-pointer">
                <Upload size={13} />
                {uploading ? "上传中..." : "重新上传图片"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <button
                type="button"
                onClick={deleteNode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 rounded-lg transition-colors cursor-pointer ml-auto"
              >
                <Trash2 size={13} />
                移除节点
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ================= 图片正常展示区域 ================= */
        <div
          className={`relative group inline-block rounded-xl overflow-hidden border transition-all duration-200 ${
            selected
              ? "ring-2 ring-primary ring-offset-2 border-primary shadow-md"
              : "border-zinc-200/80 dark:border-zinc-800 hover:shadow-md"
          }`}
        >
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            onLoad={() => setHasError(false)}
            className="max-w-[480px] max-h-[420px] w-auto h-auto object-cover rounded-lg block"
          />

          {/* 正常图片的悬浮微型控制栏 */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 backdrop-blur-md rounded-lg p-1 flex items-center gap-1 border border-white/10 shadow-lg z-10">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.2 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
              title="替换图片链接"
            >
              <RefreshCw size={13} />
            </button>
            <label
              className="p-1.2 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
              title="重新上传图片"
            >
              <Upload size={13} />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1.2 hover:bg-rose-500/80 rounded text-white transition-colors cursor-pointer"
              title="删除图片"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* 替换链接弹层（在正常图片模式下展开） */}
          {isEditing && (
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="请输入新图片 URL..."
                  className="flex-1 px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs bg-primary text-white rounded cursor-pointer"
                >
                  确定
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                >
                  取消
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}
