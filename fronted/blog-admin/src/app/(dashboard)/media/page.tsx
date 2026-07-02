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
  Loader2, 
  Image as ImageIcon,
  Check,
  ExternalLink,
  Filter
} from "lucide-react";
import { cn, Input, Button } from "@heroui/react";
import { fetchMediaList, deleteMediaItem, uploadMediaFile, type MediaItem } from "@/lib/media-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";

/**
 * 大厂精致数据表格媒体资源管理器工作台
 * - 紧密排版，以高实用性的表格形态呈现全站媒体文件
 * - 支持 "应用归属"（文章、场景、头像、独立上传）和 "存储器"（本地/云）双列区分展示，清晰明确
 * - 顶部增加 "引用来源" 选项过滤，对接后端动态 Specification 检索
 * - 支持批量选择并物理级联删除文件
 */
export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 检索过滤条件
  const [fileType, setFileType] = useState<string>("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");

  // 上传与交互状态
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // 预览模态框状态
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // 多选与批量操作
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // 物理删除确认状态
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10; // 表格每页展示 10 条

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

  /** 加载媒体列表 */
  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await fetchMediaList({
        page,
        size: pageSize,
        fileType: fileType || undefined,
        keyword: keyword || undefined,
        sourceType: sourceTypeFilter || undefined
      });
      setMediaList(data.records || []);
      setTotal(data.total || 0);
      setCheckedIds([]); // 重新加载后清空勾选状态
    } catch (err: any) {
      console.error("加载媒体资源失败:", err);
      toast.error("加载媒体库失败，请确认后端服务已启动");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [page, fileType, keyword, sourceTypeFilter]);

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
      await uploadMediaFile(file, "MANUAL", undefined, "手动在媒体中心直接上传");
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
      toast.success("外链已复制到剪贴板");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      toast.error("复制失败，您的浏览器不支持剪贴板写入");
    }
  };

  // 全选/单选逻辑
  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(mediaList.map((m) => m.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleCheckOne = (id: number, checked: boolean) => {
    if (checked) {
      setCheckedIds((prev) => [...prev, id]);
    } else {
      setCheckedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  /** 触发单条删除确认 */
  const handleDeleteRequest = (id: number) => {
    setIsBulkDelete(false);
    setConfirmDeleteId(id);
  };

  /** 触发批量删除确认 */
  const handleBulkDeleteRequest = () => {
    if (checkedIds.length === 0) return;
    setIsBulkDelete(true);
    setConfirmDeleteId(checkedIds[0]); // 借用状态触发弹窗
  };

  /** 执行物理级联删除 */
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId && !isBulkDelete) return;
    setDeleteLoading(true);
    try {
      if (isBulkDelete) {
        // 循环批量物理删除
        await Promise.all(checkedIds.map((id) => deleteMediaItem(id)));
        toast.success(`成功从硬盘物理清理选中的 ${checkedIds.length} 个文件`);
        setCheckedIds([]);
      } else {
        await deleteMediaItem(confirmDeleteId!);
        toast.success("该文件已从硬盘物理清理，且数据库记录已删除");
      }
      setConfirmDeleteId(null);
      
      // 如果当前页数据全被删光，且页码大于 1，则往前翻页
      const deletedCount = isBulkDelete ? checkedIds.length : 1;
      if (mediaList.length <= deletedCount && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadMedia();
      }
    } catch (err: any) {
      console.error("删除媒体资源失败:", err);
      toast.error(err.response?.data?.msg || "部分文件删除接口异常");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 引用来源 Badge 样式映射
  const renderSourceBadge = (item: MediaItem) => {
    const sourceType = item.sourceType || "MANUAL";
    const configs: Record<string, { label: string; styles: string }> = {
      ARTICLE: {
        label: "文章插图",
        styles: "text-purple-655 dark:text-purple-400 border-purple-100/60 dark:border-purple-950/20 bg-purple-50/30 dark:bg-purple-950/10",
      },
      SCENE: {
        label: "场景空间",
        styles: "text-sky-655 dark:text-sky-400 border-sky-100/60 dark:border-sky-950/20 bg-sky-50/30 dark:bg-sky-950/10",
      },
      USER_AVATAR: {
        label: "用户头像",
        styles: "text-teal-655 dark:text-teal-400 border-teal-100/60 dark:border-teal-950/20 bg-teal-50/30 dark:bg-teal-950/10",
      },
      SYSTEM_CONFIG: {
        label: "系统配置",
        styles: "text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/10",
      },
      MANUAL: {
        label: "独立上传",
        styles: "text-zinc-500 border-zinc-200 bg-zinc-50/30 dark:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/10",
      },
    };

    const config = configs[sourceType] || configs.MANUAL;

    return (
      <span 
        className={cn("inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg border font-bold select-none cursor-help whitespace-nowrap", config.styles)}
        title={item.sourceDetail || `${config.label} (关联ID: ${item.sourceId || "N/A"})`}
      >
        {config.label}
      </span>
    );
  };

  // 存储器/驱动位置 Badge
  const renderBucketBadge = (bucketName: string) => {
    const configs: Record<string, { label: string; styles: string }> = {
      local: {
        label: "本地存储",
        styles: "text-indigo-600 dark:text-indigo-400 border-indigo-100/40 dark:border-indigo-950/10 bg-indigo-50/10 dark:bg-indigo-950/5",
      },
      "aliyun-oss": {
        label: "阿里云 OSS",
        styles: "text-amber-600 dark:text-amber-400 border-amber-100/40 dark:border-amber-950/10 bg-amber-50/10 dark:bg-amber-950/5",
      },
    };

    const item = configs[bucketName] || {
      label: bucketName || "未指定",
      styles: "text-zinc-550 border-zinc-200 bg-zinc-50/10 dark:text-zinc-400 dark:border-zinc-850",
    };

    return (
      <span className={cn("inline-flex items-center text-[9.5px] px-1.5 py-0.5 rounded border font-medium select-none whitespace-nowrap font-mono", item.styles)}>
        {item.label}
      </span>
    );
  };

  const isAllChecked = mediaList.length > 0 && checkedIds.length === mediaList.length;
  const isSomeChecked = checkedIds.length > 0 && checkedIds.length < mediaList.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // 渲染分页按钮
  const renderPagination = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        buttons.push(
          <Button
            key={i}
            isIconOnly
            size="sm"
            onPress={() => setPage(i)}
            className={cn(
              "h-8 w-8 rounded-xl text-xs font-bold flex items-center justify-center border",
              page === i
                ? "bg-primary border-primary text-white shadow-xs"
                : "border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950"
            )}
          >
            {i}
          </Button>
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
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-55">媒体内容管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            RESOURCES / MEDIA (共 {total} 个已归档媒体资源)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* 批量操作控制 */}
          {checkedIds.length > 0 && (
            <Button
              onPress={handleBulkDeleteRequest}
              variant="danger"
              size="sm"
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold animate-fade-in"
            >
              <Trash2 size={13} />
              <span>批量删除 ({checkedIds.length})</span>
            </Button>
          )}

          <Button
            onPress={handleUploadClick}
            isDisabled={uploading}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4 text-xs font-bold text-white"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            <span>{uploading ? "正在上传中..." : "上传新媒体"}</span>
          </Button>
        </div>
      </div>

      {/* 检索及筛选 Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50 select-none">
        
        {/* 左侧：文件大类 Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Button
            size="sm"
            onPress={() => { setFileType(""); setPage(1); }}
            className={cn(
              "h-8 px-4 rounded-lg text-xs font-bold whitespace-nowrap outline-none border-0",
              fileType === ""
                ? "bg-primary text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent"
            )}
          >
            全部资源
          </Button>
          <Button
            size="sm"
            onPress={() => { setFileType("IMAGE"); setPage(1); }}
            className={cn(
              "h-8 px-4 rounded-lg text-xs font-bold whitespace-nowrap outline-none border-0",
              fileType === "IMAGE"
                ? "bg-primary text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent"
            )}
          >
            图片资源
          </Button>
          <Button
            size="sm"
            onPress={() => { setFileType("OTHER"); setPage(1); }}
            className={cn(
              "h-8 px-4 rounded-lg text-xs font-bold whitespace-nowrap outline-none border-0",
              fileType === "OTHER"
                ? "bg-primary text-white shadow-xs"
                : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent"
            )}
          >
            其他文件
          </Button>
        </div>

        {/* 右侧：多重条件检索 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 引用来源下拉过滤 */}
          <div className="flex h-8 items-center gap-1 px-2.5 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-600 dark:text-zinc-400">
            <Filter size={11} className="text-zinc-400 dark:text-zinc-550 shrink-0" />
            <select
              value={sourceTypeFilter}
              onChange={(e) => { setSourceTypeFilter(e.target.value); setPage(1); }}
              className="border-none bg-transparent p-0 pr-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-350 outline-none cursor-pointer focus:ring-0 leading-normal"
            >
              <option value="">全部引用来源</option>
              <option value="ARTICLE">博客文章插图</option>
              <option value="SCENE">场景空间资源</option>
              <option value="USER_AVATAR">用户个人头像</option>
              <option value="SYSTEM_CONFIG">系统配置资料</option>
              <option value="MANUAL">手动独立上传</option>
            </select>
          </div>

          {/* 模糊名称搜索 */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 w-48 md:w-56 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search size={13} className="text-zinc-400 shrink-0" />
              <Input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="按文件名模糊匹配..."
                className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-150 outline-none placeholder-zinc-400 dark:placeholder-zinc-650 focus:ring-0 leading-normal"
              />
              {searchVal && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={handleClearSearch}
                  className="text-zinc-400 hover:text-zinc-655 min-w-0 h-auto w-auto p-0"
                >
                  <X size={12} />
                </Button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold"
            >
              搜索
            </Button>
          </form>
        </div>
      </div>

      {/* 媒体列表表格 - 极简精致大厂排版 */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[900px] table-fixed">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <th className="px-4 py-3.5 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                />
              </th>
              <th className="px-5 py-3.5">预览 / 文件名称</th>
              <th className="px-5 py-3.5 w-32">应用归属</th>
              <th className="px-5 py-3.5 w-28">存储器</th>
              <th className="px-5 py-3.5 w-36">文件属性/分辨率</th>
              <th className="px-5 py-3.5 w-48">物理存储路径</th>
              <th className="px-5 py-3.5 w-28">上传日期</th>
              <th className="px-5 py-3.5 w-28 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 size={20} className="animate-spin text-zinc-350 dark:text-zinc-650" />
                    <span className="text-[11px] font-medium tracking-wide">加载媒体资源中...</span>
                  </div>
                </td>
              </tr>
            ) : mediaList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-zinc-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={24} className="text-zinc-300 dark:text-zinc-700" />
                    <span className="text-[11px]">暂无媒体资源，开始上传您的第一个文件吧！</span>
                  </div>
                </td>
              </tr>
            ) : (
              mediaList.map((item) => {
                const isImage = item.fileType === "IMAGE";
                const fileLink = resolveUrl(item.fileUrl);
                const isChecked = checkedIds.includes(item.id);
                const ext = item.fileName.split(".").pop()?.toUpperCase() || "FILE";

                return (
                  <tr
                    key={item.id}
                    className="group border-b border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-150"
                  >
                    {/* 多选框 */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckOne(item.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-350 dark:border-zinc-800 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                      />
                    </td>

                    {/* 预览与文件名 */}
                    <td className="px-5 py-3 select-none">
                      <div className="flex items-center gap-3">
                        {/* 图像缩略图或类型图标 */}
                        <div className="relative w-9 h-9 shrink-0 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={fileLink}
                              alt={item.fileName}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                          ) : (
                            <FileText size={15} className="text-zinc-400" />
                          )}
                        </div>

                        {/* 文件名称 */}
                        <div className="min-w-0 max-w-full">
                          <span
                            className="font-semibold text-neutral-dark dark:text-zinc-150 block truncate group-hover:text-primary transition-colors cursor-pointer"
                            title={item.fileName}
                            onClick={() => setSelectedMedia(item)}
                          >
                            {item.fileName}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight mt-0.5 block">
                            MIME: {item.mimeType || "unknown"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 应用归属 */}
                    <td className="px-5 py-3.5">
                      {renderSourceBadge(item)}
                    </td>

                    {/* 存储器 (存储桶) */}
                    <td className="px-5 py-3.5">
                      {renderBucketBadge(item.bucketName)}
                    </td>

                    {/* 属性与分辨率 */}
                    <td className="px-5 py-3.5 font-mono text-[10.5px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-350">{formatBytes(item.fileSize)}</span>
                        {isImage && item.width && item.height ? (
                          <span className="text-[9.5px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                            {item.width} × {item.height} px
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-zinc-450 dark:text-zinc-550 mt-0.5">
                            {ext} 文件
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 物理存储绝对路径 */}
                    <td className="px-5 py-3.5 min-w-0 max-w-0">
                      <code
                        className="font-mono text-[10px] text-zinc-500 dark:text-zinc-500 truncate block bg-zinc-50 dark:bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-850/30 select-all font-light"
                        title={item.filePath}
                      >
                        {item.filePath}
                      </code>
                    </td>

                    {/* 上传时间 */}
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* 管理操作 */}
                    <td className="px-5 py-3 text-right select-none">
                      <div className="flex items-center justify-end gap-2">
                        {/* 复制直链 */}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => handleCopyLink(item)}
                          className={cn(
                            "w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800 min-w-0 p-0",
                            copiedId === item.id ? "text-emerald-500 hover:text-emerald-600" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-300"
                          )}
                          aria-label="复制访问直链 URL"
                        >
                          {copiedId === item.id ? <Check size={13.5} /> : <Copy size={12} />}
                        </Button>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => setSelectedMedia(item)}
                          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800 min-w-0 p-0"
                          aria-label="查看元数据详情"
                        >
                          <Eye size={12} />
                        </Button>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => handleDeleteRequest(item.id)}
                          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800 min-w-0 p-0"
                          aria-label="删除并从硬盘擦除"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控制栏 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2 select-none">
          <span className="text-zinc-500 dark:text-zinc-450 font-medium font-mono">
            SHOWING PAGE {page} OF {totalPages} ({total} ITEMS)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page <= 1 || loading}
              variant="outline"
              size="sm"
              className="rounded-xl px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed"
            >
              上一页
            </Button>
            <div className="flex items-center gap-1">
              {renderPagination()}
            </div>
            <Button
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              isDisabled={page >= totalPages || loading}
              variant="outline"
              size="sm"
              className="rounded-xl px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed"
            >
              下一页
            </Button>
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
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    onPress={() => setSelectedMedia(null)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-250 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-0 h-auto w-auto"
                  >
                    <X size={15} />
                  </Button>
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
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">存储提供商 (Bucket)</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">{selectedMedia.bucketName || "local"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">应用归属 / 引用来源</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">
                        {selectedMedia.sourceType === "ARTICLE" && "博客文章插图"}
                        {selectedMedia.sourceType === "SCENE" && "场景空间资源"}
                        {selectedMedia.sourceType === "USER_AVATAR" && "用户个人头像"}
                        {selectedMedia.sourceType === "SYSTEM_CONFIG" && "系统配置资料"}
                        {selectedMedia.sourceType === "MANUAL" && "手动独立上传"}
                        {!selectedMedia.sourceType && "手动独立上传"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">上传时间</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-250 font-mono">
                        {new Date(selectedMedia.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>

                  {selectedMedia.sourceDetail && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">引用来源详细描述</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-250 leading-relaxed font-sans">{selectedMedia.sourceDetail}</span>
                    </div>
                  )}

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
                  <Button
                    onPress={() => setSelectedMedia(null)}
                    className="h-9 px-6 rounded-xl bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold"
                  >
                    关闭
                  </Button>
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
        title={isBulkDelete ? "确认批量彻底删除媒体" : "确认彻底删除媒体资源"}
        description={
          isBulkDelete
            ? `确定要批量彻底删除选中的 ${checkedIds.length} 个媒体资源吗？此操作将同时从本地物理磁盘目录中永久抹除对应文件，且不可撤销！`
            : "确定要彻底删除该媒体资源吗？此操作将同时从本地物理磁盘目录中永久抹除对应文件，删除后关联该图片的文章排版可能失效且操作不可撤销。"
        }
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
