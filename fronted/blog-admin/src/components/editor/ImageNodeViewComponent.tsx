"use client";

import React, { useState, useEffect } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  ImageOff,
  Settings,
  Link as LinkIcon,
  Upload,
  Trash2,
  Check,
  Copy,
  X,
  ImageIcon,
} from "lucide-react";
import Portal from "../common/Portal";
import apiClient from "@/lib/api";
import { resolveAssetUrl } from "@/lib/image-url";

/**
 * Tiptap 自定义 Image React NodeView 组件
 * - 鼠标移入图片右上角显示“编辑”图标
 * - 点击图标弹窗（Modal）配置图片 URL、图片描述，并支持删除图片
 * - 自动检测图片加载失败，并展示友好的警告信息
 */
export default function ImageNodeViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const src = node.attrs.src || "";
  const alt = node.attrs.alt || "";

  const [hasError, setHasError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(src);
  const [inputAlt, setInputAlt] = useState(alt);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 当属性变化时重置内部状态
  useEffect(() => {
    setInputUrl(src);
    setInputAlt(alt);
    setHasError(false);
  }, [src, alt]);

  // 打开弹窗
  const handleOpenModal = () => {
    setInputUrl(src);
    setInputAlt(alt);
    setModalOpen(true);
  };

  // 复制当前图片 URL
  const handleCopyUrl = () => {
    if (!inputUrl) return;
    navigator.clipboard.writeText(inputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 保存图片配置修改
  const handleSaveModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedUrl = inputUrl.trim();
    updateAttributes({
      src: trimmedUrl,
      alt: inputAlt.trim(),
    });
    setHasError(false);
    setModalOpen(false);
  };

  // 删除图片节点
  const handleDeleteImage = () => {
    deleteNode();
    setModalOpen(false);
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
        setInputUrl(newUrl);
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
      {/* 1. 编辑器画布内的图片呈现 */}
      {hasError ? (
        /* ================= 破损 / 加载失败图片卡片 ================= */
        <div className="w-full max-w-lg p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 shrink-0 mt-0.5">
              <ImageOff size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-300">图片加载失败</h4>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Settings size={12} />
                  配置图片
                </button>
              </div>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 truncate font-mono">
                {src || "未设置链接"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 正常渲染图片（Hover 提示编辑图标） ================= */
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

          {/* 鼠标移入右上角显示的“编辑”图标 */}
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10">
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-lg backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="配置 / 编辑此图片"
            >
              <Settings size={13} />
              <span>编辑图片</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Portal 样式的 Modal 图片配置弹窗 */}
      {modalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 遮罩层 */}
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
              onClick={() => setModalOpen(false)}
            />

            {/* 弹窗对话框主体 */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all animate-slide-up text-left">
              
              {/* 弹窗 Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <ImageIcon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    图片属性与链接配置
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 弹窗 Body */}
              <form onSubmit={handleSaveModal} className="p-5 space-y-4">
                {/* 实时缩略图预览 */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    {inputUrl ? (
                      <img
                        src={inputUrl}
                        alt="预览"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff size={20} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      图片实时预览
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                      {inputUrl || "暂未设置图片链接地址"}
                    </p>
                  </div>
                </div>

                {/* 配置图片 URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>图片 URL 链接地址</span>
                    {inputUrl && (
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? "已复制" : "复制链接"}
                      </button>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="请输入或粘贴可访问的图片 URL..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary transition-all font-mono"
                      />
                      <LinkIcon size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
                    </div>

                    {/* 上传新图片 */}
                    <label className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors shrink-0" title="上传替换本地图片">
                      <Upload size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* 配置图片 Alt 替代文本 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    图片说明 / Alt 描述文本
                  </label>
                  <input
                    type="text"
                    value={inputAlt}
                    onChange={(e) => setInputAlt(e.target.value)}
                    placeholder="可选，添加图片说明文本..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* 弹窗 Footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  {/* 删除该图片按钮 */}
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    删除该图片
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3.5 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      保存配置
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </Portal>
      )}
    </NodeViewWrapper>
  );
}
