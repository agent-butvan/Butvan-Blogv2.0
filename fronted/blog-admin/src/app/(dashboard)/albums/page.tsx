"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, Image as ImageIcon,
  Loader2, Upload, Grid3X3
} from "lucide-react";
import { cn, Button, SearchField, Input, TextArea, Select, Label, ListBox, Modal } from "@heroui/react";
import {
  fetchAlbumList, fetchAlbumDetail, createAlbum, updateAlbum, deleteAlbum,
  removePhotoFromAlbum, uploadPhotoToAlbum,
  type AlbumItem, type AlbumDetail, type AlbumPhotoItem
} from "@/lib/album-api";
import { toast } from "@/lib/toast";
import { resolveAssetUrl } from "@/lib/image-url";
import ConfirmModal from "@/components/common/ConfirmModal";

/**
 * 相册管理页面
 * - 左侧：相册列表（创建/编辑/删除）
 * - 右侧：选中相册后的照片管理网格
 */
export default function AlbumsPage() {
  // 相册列表状态
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 当前选中相册
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 创建/编辑弹窗
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("DRAFT");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // 照片上传状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // 删除确认
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 照片删除确认
  const [confirmPhotoDelete, setConfirmPhotoDelete] = useState<number | null>(null);

  const pageSize = 10;

  /** 加载相册列表 */
  const loadAlbums = async () => {
    setLoading(true);
    try {
      const data = await fetchAlbumList({ page, size: pageSize });
      setAlbums(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("加载相册列表失败:", err);
      toast.error("加载相册列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlbums(); }, [page]);

  /** 选中相册并加载详情 */
  const selectAlbum = async (id: number) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const detail = await fetchAlbumDetail(id);
      setSelectedAlbum(detail);
    } catch (err) {
      console.error("加载相册详情失败:", err);
      toast.error("加载相册详情失败");
    } finally {
      setDetailLoading(false);
    }
  };

  /** 打开创建弹窗 */
  const openCreateModal = () => {
    setEditingAlbum(null);
    setFormTitle("");
    setFormDesc("");
    setFormSlug("");
    setFormStatus("DRAFT");
    setShowFormModal(true);
  };

  /** 打开编辑弹窗 */
  const openEditModal = (album: AlbumItem) => {
    setEditingAlbum(album);
    setFormTitle(album.title);
    setFormDesc(album.description || "");
    setFormSlug(album.slug);
    setFormStatus(album.status);
    setShowFormModal(true);
  };

  /** 提交表单 */
  const submitForm = async () => {
    if (!formTitle.trim()) {
      toast.error("请输入相册标题");
      return;
    }
    setFormSubmitting(true);
    try {
      const params = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        description: formDesc.trim() || undefined,
        status: formStatus,
      };
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, params);
        toast.success("相册已更新");
        if (selectedId === editingAlbum.id) selectAlbum(editingAlbum.id);
      } else {
        await createAlbum(params);
        toast.success("相册已创建");
      }
      setShowFormModal(false);
      loadAlbums();
    } catch (err: any) {
      console.error("保存相册失败:", err);
      toast.error(err.response?.data?.msg || "保存相册失败");
    } finally {
      setFormSubmitting(false);
    }
  };

  /** 删除相册 */
  const handleDeleteAlbum = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteAlbum(confirmDeleteId);
      toast.success("相册已删除");
      if (selectedId === confirmDeleteId) {
        setSelectedId(null);
        setSelectedAlbum(null);
      }
      setConfirmDeleteId(null);
      loadAlbums();
    } catch (err: any) {
      console.error("删除相册失败:", err);
      toast.error(err.response?.data?.msg || "删除相册失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  /** 打开媒体选择器 */
  const openMediaPicker = async () => {
    // 触发隐藏的文件输入
    fileInputRef.current?.click();
  };

  /** 选择文件后直接上传到当前相册 */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("仅支持上传图片文件");
      e.target.value = "";
      return;
    }

    setUploadingPhoto(true);
    try {
      await uploadPhotoToAlbum(selectedId, file);
      toast.success("照片已上传并添加到相册");
      selectAlbum(selectedId);
    } catch (err: any) {
      console.error("上传照片失败:", err);
      toast.error(err.response?.data?.msg || "上传照片失败");
    } finally {
      setUploadingPhoto(false);
      e.target.value = ""; // 重置 input 以便重复选择同一文件
    }
  };

  /** 移除照片 */
  const handleRemovePhoto = async () => {
    if (!selectedId || !confirmPhotoDelete) return;
    try {
      await removePhotoFromAlbum(selectedId, confirmPhotoDelete);
      toast.success("照片已从相册移除");
      setConfirmPhotoDelete(null);
      selectAlbum(selectedId);
    } catch (err: any) {
      console.error("移除照片失败:", err);
      toast.error(err.response?.data?.msg || "移除照片失败");
    }
  };

  /** 设置封面 */
  const setCover = async (mediaId: number) => {
    if (!selectedId) return;
    try {
      await updateAlbum(selectedId, { title: selectedAlbum!.title, coverImageId: mediaId });
      toast.success("封面已更新");
      selectAlbum(selectedId);
    } catch (err: any) {
      toast.error("设置封面失败");
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0 select-none">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-55">相册管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            ALBUMS / GALLERY (共 {total} 个相册)
          </p>
        </div>
        <Button
          onPress={openCreateModal}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 active:scale-[0.98] py-2 px-4 text-xs font-bold text-white"
        >
          <Plus size={13} />
          新建相册
        </Button>
      </div>

      {/* 主体：左栏相册列表 + 右栏照片管理 */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* 左栏 — 相册列表 */}
        <div className="w-72 shrink-0 flex flex-col border border-zinc-200/60 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/70 dark:bg-zinc-900/40">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              相册列表
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={18} className="animate-spin text-zinc-350" />
              </div>
            ) : albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                <ImageIcon size={22} />
                <span className="text-[11px]">暂无相册</span>
              </div>
            ) : (
              albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => selectAlbum(album.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-zinc-50 dark:border-zinc-900/30 transition-all duration-150 group",
                    selectedId === album.id
                      ? "bg-primary/5 border-l-[3px] border-l-primary"
                      : "border-l-[3px] border-l-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                  )}
                >
                  {/* 封面缩略图 */}
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200/60 dark:border-zinc-700">
                    {album.coverImageUrl ? (
                      <img src={resolveAssetUrl(album.coverImageUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-350">
                        <ImageIcon size={14} />
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {album.title}
                    </div>
                    <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 flex items-center gap-2">
                      <span>{album.photoCount} 张</span>
                      <span className={cn(
                        "px-1 py-px rounded text-[9px] font-bold",
                        album.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {album.status === "PUBLISHED" ? "已发布" : "草稿"}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      isIconOnly size="sm" variant="ghost"
                      onPress={() => openEditModal(album)}
                      className="w-6 h-6 rounded-lg text-zinc-400 hover:text-primary min-w-0 p-0"
                    >
                      <Pencil size={11} />
                    </Button>
                    <Button
                      isIconOnly size="sm" variant="ghost"
                      onPress={() => setConfirmDeleteId(album.id)}
                      className="w-6 h-6 rounded-lg text-zinc-400 hover:text-rose-500 min-w-0 p-0"
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between text-[10px]">
              <Button
                size="sm" variant="ghost"
                isDisabled={page <= 1}
                onPress={() => setPage(p => p - 1)}
                className="text-xs h-7 min-w-0 px-2"
              >
                上一页
              </Button>
              <span className="text-zinc-400 font-mono">{page}/{totalPages}</span>
              <Button
                size="sm" variant="ghost"
                isDisabled={page >= totalPages}
                onPress={() => setPage(p => p + 1)}
                className="text-xs h-7 min-w-0 px-2"
              >
                下一页
              </Button>
            </div>
          )}
        </div>

        {/* 右栏 — 照片管理 */}
        <div className="flex-1 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden flex flex-col shadow-xs">
          {!selectedAlbum ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-400 select-none">
              <Grid3X3 size={36} className="text-zinc-250 dark:text-zinc-700" />
              <span className="text-sm font-medium">选择一个相册开始管理照片</span>
              <span className="text-[11px]">从左侧列表点击相册</span>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-zinc-350" />
            </div>
          ) : (
            <>
              {/* 照片区顶部工具栏 */}
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/70 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedAlbum.title}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {selectedAlbum.photos.length} 张照片
                  </span>
                </div>
                <Button
                  size="sm"
                  onPress={openMediaPicker}
                  isDisabled={uploadingPhoto}
                  className="flex items-center gap-1 h-8 px-3 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  上传图片
                </Button>
              </div>

              {/* 照片网格 */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedAlbum.photos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                    <ImageIcon size={28} className="text-zinc-250 dark:text-zinc-700" />
                    <span className="text-[11px]">相册中暂无照片，点击上方按钮添加</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedAlbum.photos.map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        isCover={selectedAlbum.coverImageId === photo.mediaId}
                        onSetCover={() => setCover(photo.mediaId)}
                        onRemove={() => setConfirmPhotoDelete(photo.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==== 创建/编辑相册弹窗 ==== */}
      <Modal.Backdrop isOpen={showFormModal} onOpenChange={setShowFormModal}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-bold text-zinc-900 dark:text-zinc-150">
                {editingAlbum ? "编辑相册" : "新建相册"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              {/* 标题 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">相册标题</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="例如：2024 日本之旅"
                  className="w-full"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">URL 标识（可选）</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="留空则自动生成"
                  className="w-full font-mono"
                />
              </div>

              {/* 描述 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">描述（可选）</label>
                <TextArea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="相册简介..."
                  className="w-full"
                />
              </div>

              {/* 状态 */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">状态</Label>
                <Select
                  selectedKey={formStatus}
                  onSelectionChange={(key) => setFormStatus(key as string)}
                  className="w-full"
                  placeholder="选择状态"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="DRAFT" textValue="草稿">
                        草稿
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="PUBLISHED" textValue="已发布">
                        已发布
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button size="sm" variant="ghost" slot="close"
                className="h-9 px-4 rounded-lg text-xs font-bold">
                取消
              </Button>
              <Button size="sm" onPress={submitForm} isDisabled={formSubmitting || !formTitle.trim()}
                className="h-9 px-5 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50">
                {formSubmitting ? <Loader2 size={12} className="animate-spin" /> : (editingAlbum ? "保存" : "创建")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* ==== 隐藏的文件上传 input ==== */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ==== 删除相册确认 ==== */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        variant="danger"
        title="确认删除相册"
        description="删除相册将同时移除所有照片关联，但不会删除媒体文件。此操作不可撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleteLoading}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* ==== 移除照片确认 ==== */}
      <ConfirmModal
        open={confirmPhotoDelete !== null}
        variant="danger"
        title="确认移除照片"
        description="仅从相册中移除该照片关联，不会删除原始媒体文件。"
        confirmLabel="移除"
        cancelLabel="取消"
        onConfirm={handleRemovePhoto}
        onCancel={() => setConfirmPhotoDelete(null)}
      />
    </div>
  );
}

/** 照片卡片子组件 */
function PhotoCard({
  photo, isCover, onSetCover, onRemove
}: {
  photo: AlbumPhotoItem;
  isCover: boolean;
  onSetCover: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
      <img
        src={resolveAssetUrl(photo.fileUrl)}
        alt={photo.caption || photo.fileName}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* hover 操作层 */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
        {/* 封面标记 */}
        {isCover && (
          <span className="self-start px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-400/90 text-yellow-900">
            封面
          </span>
        )}

        <div className="flex items-center justify-end gap-1">
          {!isCover && (
            <Button
              onPress={onSetCover}
              size="sm"
              className="h-auto min-w-0 px-2 py-1 rounded-md bg-white/90 hover:bg-white text-zinc-700 text-[10px] font-bold"
            >
              封面
            </Button>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={onRemove}
            className="w-auto h-auto min-w-0 p-1 rounded-md bg-white/90 hover:bg-rose-50 text-zinc-700 hover:text-rose-500"
          >
            <Trash2 size={11} />
          </Button>
        </div>
      </div>

      {/* 说明文字 */}
      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-[10px] text-white/90 truncate block">{photo.caption}</span>
        </div>
      )}
    </div>
  );
}
