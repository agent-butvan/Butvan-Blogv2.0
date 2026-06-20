"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Eye, 
  X, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Check,
  ExternalLink
} from "lucide-react";
import { cn } from "@heroui/react";
import { fetchMediaList, deleteMediaItem, uploadMediaFile, type MediaItem } from "@/lib/media-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";

/**
 * 大厂视觉风格媒体资源管理器工作台
 * - 拒绝多余大留白，支持极其紧凑与信息饱满的列表形态
 * - 左上角分类 Tabs（全部、图片、其他文件）
 * - 支持拖入或点击一键多类型文件上传
 * - 卡片悬停显示 Notion 风格的快捷管理面板（复制外链、模态详情预览、物理安全删除）
 */
export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 检索条件
  const [fileType, setFileType] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");

  // 上传与交互状态
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // 预览模态框状态
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // 物理删除确认状态
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 12; // 一页展示 12 个文件

  // 资源服务器基础 URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const HOST_URL = API_BASE_URL.replace(/\/api$/, "");

  /** 解析可访问的绝对文件路径 */
  const resolveUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${HOST_URL}${url}`;
  };

  /** 格式化文件大小 */
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /** 获取列表 */
  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await fetchMediaList({
        page,
        size: pageSize,
        fileType: fileType || undefined,
        keyword: keyword || undefined
      });
      setMediaList(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("加载媒体资源失败:", err);
      toast.error("加载媒体库失败，请确认后端服务已启动");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [page, fileType, keyword]);

  /** 提交检索 */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchVal.trim());
  };

  /** 清空搜索 */
  const handleClearSearch = () => {
    setSearchVal("");
    setKeyword("");
    setPage(1);
  };

  /** 上传文件逻辑 */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      await uploadMediaFile(file);
      toast.success(`媒体文件「${file.name}」已上传成功`);
      setPage(1);
      loadMedia();
    } catch (err: any) {
      console.error("文件上传失败:", err);
      toast.error(err.response?.data?.msg || "文件上传接口异常，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /** 复制到剪贴板 */
  const handleCopyLink = async (item: MediaItem) => {
    const absoluteUrl = resolveUrl(item.fileUrl);
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedId(item.id);
      toast.success("资源外链已成功复制到剪贴板，可直接贴入 Markdown中");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      toast.error("复制失败，您的浏览器不支持剪贴板写入");
    }
  };

  /** 触发删除确认 */
  const handleDeleteRequest = (id: number) => {
    setConfirmDeleteId(id);
  };

  /** 执行物理删除 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteMediaItem(confirmDeleteId);
      toast.success("该文件已从硬盘物理清理，且数据库记录已删除");
      setConfirmDeleteId(null);
      // 如果当前页最后一条被删，且页码大于 1，则往前翻页
      if (mediaList.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadMedia();
      }
    } catch (err: any) {
      console.error("删除媒体资源失败:", err);
      toast.error(err.response?.data?.msg || "删除接口异常");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 分类 Tabs 配置
  const TABS = [
    { label: "全部资源", value: "" },
    { label: "图片大类", value: "IMAGE" },
    { label: "其他文件", value: "OTHER" }
  ];

  const totalPages = Math.ceil(total / pageSize) || 1;

  // 渲染分页按钮
  const renderPagination = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        buttons.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={cn(
              "h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border",
              page === i
                ? "bg-primary border-primary text-white shadow-xs"
                : "border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950"
            )}
          >
            {i}
          </button>
        );
      } else if (i === page - 3 || i === page + 3) {
        buttons.push(
          <span key={`ellipsis-${i}`} className="text-zinc-400 dark:text-zinc-650 px-1 text-xs select-none">
            ...
          </span>
        );
      }
    }
    return buttons;
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题区 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0 select-none">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-55">媒体库管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / MEDIA (共 {total} 个已保存资源)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            <span>{uploading ? "正在上传中..." : "上传新媒体"}</span>
          </button>
        </div>
      </div>

      {/* 检索及筛选 Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50 select-none">
        {/* 分类 Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFileType(tab.value);
                setPage(1);
              }}
              className={cn(
                "h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap outline-none border-0",
                fileType === tab.value
                  ? "bg-primary text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 flex-1 w-full md:w-60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索原始文件名称..."
              className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-150 outline-none placeholder-zinc-400 dark:placeholder-zinc-650 focus:ring-0 leading-normal"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-zinc-400 hover:text-zinc-655 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 媒体卡片网格列表 */}
      {loading ? (
        <div className="py-24 border border-zinc-200/50 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 shadow-2xs select-none">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-[11px] font-medium tracking-wide">正在加载资源列表，请稍候...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-24 border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-400 shadow-2xs select-none">
          <ImageIcon size={32} className="text-zinc-300 dark:text-zinc-850" />
          <span className="text-[11px] font-bold">媒体库空空如也，快去上传您的第一个文件吧！</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaList.map((item) => {
            const isImage = item.fileType === "IMAGE";
            const fileLink = resolveUrl(item.fileUrl);
            const ext = item.fileName.split(".").pop()?.toUpperCase() || "FILE";

            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col select-none"
              >
                {/* 预览容器 */}
                <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-150 dark:border-zinc-850">
                  {isImage ? (
                    <img
                      src={fileLink}
                      alt={item.fileName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-105 transition-transform">
                        <FileText size={20} />
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 font-mono tracking-wide">
                        {ext}
                      </span>
                    </div>
                  )}

                  {/* Notion 风格卡片悬浮遮罩面板 */}
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out z-10">
                    {/* 一键复制链接 */}
                    <button
                      onClick={() => handleCopyLink(item)}
                      className="w-8 h-8 rounded-xl bg-white text-zinc-850 hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-md border-0"
                      title="复制访问直链"
                    >
                      {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>

                    {/* 详情与预览 */}
                    <button
                      onClick={() => setSelectedMedia(item)}
                      className="w-8 h-8 rounded-xl bg-white text-zinc-850 hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-md border-0"
                      title="查看详情"
                    >
                      <Eye size={13} />
                    </button>

                    {/* 安全物理删除 */}
                    <button
                      onClick={() => handleDeleteRequest(item.id)}
                      className="w-8 h-8 rounded-xl bg-white text-zinc-850 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-md border-0"
                      title="物理删除文件"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 底部文案介绍 */}
                <div className="p-3 text-left flex flex-col justify-between flex-grow bg-white dark:bg-zinc-900/60">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold text-zinc-800 dark:text-zinc-150 truncate leading-snug"
                      title={item.fileName}
                    >
                      {item.fileName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-550 font-mono mt-1.5">
                    <span>{formatBytes(item.fileSize)}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页控制栏 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2 select-none">
          <span className="text-zinc-500 dark:text-zinc-450 font-medium font-mono">
            SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold outline-none"
            >
              上一页
            </button>
            <div className="flex items-center gap-1">
              {renderPagination()}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 px-3 py-1.5 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350 disabled:opacity-30 dark:disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed font-bold outline-none"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 媒体文件属性详情 Modal */}
      {selectedMedia && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-xs animate-fade-in"
              onClick={() => setSelectedMedia(null)}
            />

            {/* 模态浮窗 */}
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl animate-slide-up overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col gap-4 text-left">
                {/* 顶栏 */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-150 truncate max-w-[280px]">
                    媒体属性详情: {selectedMedia.fileName}
                  </h3>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-250 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* 预览图 */}
                {selectedMedia.fileType === "IMAGE" && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <img
                      src={resolveUrl(selectedMedia.fileUrl)}
                      alt={selectedMedia.fileName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* 字段列表 */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">原始文件名</span>
                    <span className="font-medium text-zinc-850 dark:text-zinc-200 font-sans break-all select-all">{selectedMedia.fileName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">文件大类</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">{selectedMedia.fileType}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">MIME 类型</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-250 font-mono">{selectedMedia.mimeType}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">文件大小</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-250 font-mono">{formatBytes(selectedMedia.fileSize)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">上传时间</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-250 font-mono">
                        {new Date(selectedMedia.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">外部访问 URL 链接</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[10px] text-zinc-650 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 px-2 py-1 rounded-lg truncate flex-1 select-all break-all">
                        {resolveUrl(selectedMedia.fileUrl)}
                      </span>
                      <a
                        href={resolveUrl(selectedMedia.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-primary transition-colors cursor-pointer shrink-0"
                        title="在新页面中打开访问"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">物理存储绝对路径</span>
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-500 break-all select-all">
                      {selectedMedia.filePath}
                    </span>
                  </div>
                </div>

                {/* 底栏按钮 */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 mt-2 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="h-9 px-6 rounded-xl bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 物理安全删除 ConfirmModal */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title="确认彻底删除媒体资源"
        description="确定要彻底删除该媒体资源吗？此操作将同时从本地物理磁盘目录中永久抹除对应文件，删除后关联该图片的文章排版可能失效且操作不可撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
