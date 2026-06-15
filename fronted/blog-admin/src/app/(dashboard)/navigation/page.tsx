"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import NavigationFormModal from "@/components/forms/NavigationFormModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import type {
  NavigationItem,
  NavigationSaveDTO,
  NavLinkType,
  NavPosition,
} from "@/types/navigation";
import {
  NAV_LINK_TYPE_LABELS,
  NAV_POSITION_LABELS,
} from "@/types/navigation";
import {
  fetchAdminNavigations,
  createNavigation,
  updateNavigation,
  deleteNavigation,
} from "@/lib/navigation-api";

/** 所有可选的菜单位置 */
const POSITIONS: NavPosition[] = [
  "HEADER",
  "FOOTER",
  "SIDEBAR",
  "ADMIN_SIDEBAR",
];

// ==================== 树操作工具函数 ====================

/** 深度克隆树（避免直接修改 state） */
function cloneTree(tree: NavigationItem[]): NavigationItem[] {
  return tree.map((item) => ({
    ...item,
    children: cloneTree(item.children),
  }));
}

/** 在树中递归查找并更新指定 ID 的节点 */
function updateItemInTree(
  tree: NavigationItem[],
  id: number,
  updater: (item: NavigationItem) => NavigationItem
): NavigationItem[] {
  return tree.map((item) => {
    if (item.id === id) {
      return updater(item);
    }
    if (item.children.length > 0) {
      return {
        ...item,
        children: updateItemInTree(item.children, id, updater),
      };
    }
    return item;
  });
}

/** 在树中递归查找并移除指定 ID 的节点 */
function removeItemFromTree(
  tree: NavigationItem[],
  id: number
): NavigationItem[] {
  return tree
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: removeItemFromTree(item.children, id),
    }));
}

/** 在树中查找节点（返回引用） */
function findItemInTree(
  tree: NavigationItem[],
  id: number
): NavigationItem | null {
  for (const item of tree) {
    if (item.id === id) return item;
    const found = findItemInTree(item.children, id);
    if (found) return found;
  }
  return null;
}

/** 统计子节点数量 */
function countChildren(item: NavigationItem): number {
  let count = item.children.length;
  for (const child of item.children) {
    count += countChildren(child);
  }
  return count;
}

/**
 * 导航菜单管理配置页面
 * - 按位置切换查看
 * - 树形层级展示（收折/展开）
 * - 新建/编辑/删除/排序/可见性切换（均含二次确认）
 * - 隐藏项保留在列表中，灰显标识
 */
export default function NavigationPage() {
  const [selectedPosition, setSelectedPosition] =
    useState<NavPosition>("HEADER");
  const [menuTree, setMenuTree] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 表单弹窗
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<NavigationItem | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<number | null>(null);

  // 折叠状态
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  // 确认弹窗状态
  const [confirmDelete, setConfirmDelete] = useState<NavigationItem | null>(
    null
  );
  const [confirmToggle, setConfirmToggle] = useState<NavigationItem | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  // ==================== 数据加载 ====================

  /** 从 API 加载数据（仅页面初始化和位置切换时调用） */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminNavigations(selectedPosition);
      setMenuTree(data);
    } catch {
      setError("加载导航菜单失败，请确认后端服务已启动");
      setMenuTree([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPosition]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** 显示成功消息 */
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ==================== 树操作 ====================

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** 切换位置 → API 重新加载 */
  const handlePositionChange = (pos: NavPosition) => {
    setSelectedPosition(pos);
    setCollapsedIds(new Set());
  };

  // ==================== 表单 ====================

  const handleOpenCreate = (parentId: number | null = null) => {
    setEditItem(null);
    setCreatingParentId(parentId);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditItem(item);
    setCreatingParentId(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditItem(null);
    setCreatingParentId(null);
  };

  /** 保存（创建 / 更新）→ 本地状态即时更新，不重新加载 API */
  const handleSave = async (dto: NavigationSaveDTO) => {
    setSaving(true);
    try {
      if (editItem) {
        // 更新
        const updated = await updateNavigation(editItem.id, dto);
        setMenuTree((prev) =>
          updateItemInTree(cloneTree(prev), editItem.id, (old) => ({
            ...old,
            ...updated,
            children: old.children, // 保持原有子节点结构
          }))
        );
        showSuccess(`菜单"${dto.title}"已更新`);
      } else {
        // 创建
        const created = await createNavigation(dto);
        setMenuTree((prev) => {
          const cloned = cloneTree(prev);
          if (dto.parentId) {
            // 添加到父节点的 children 中
            return updateItemInTree(cloned, dto.parentId, (parent) => ({
              ...parent,
              children: [
                ...parent.children,
                { ...created, children: [] },
              ],
            }));
          } else {
            // 添加到根级别
            return [...cloned, { ...created, children: [] }];
          }
        });
        showSuccess(`菜单"${dto.title}"已创建`);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr?.response?.data?.msg || "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // ==================== 删除（含确认弹窗） ====================

  const handleDeleteRequest = (item: NavigationItem) => {
    setConfirmDelete(item);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await deleteNavigation(confirmDelete.id);
      setMenuTree((prev) => removeItemFromTree(cloneTree(prev), confirmDelete.id));
      showSuccess(`菜单"${confirmDelete.title}"已删除`);
    } catch {
      setError("删除失败，请重试");
    } finally {
      setActionLoading(false);
      setConfirmDelete(null);
    }
  };

  // ==================== 可见性切换（含确认弹窗） ====================

  const handleToggleRequest = (item: NavigationItem) => {
    setConfirmToggle(item);
  };

  const handleToggleConfirm = async () => {
    if (!confirmToggle) return;
    setActionLoading(true);
    const newVisible = !confirmToggle.isVisible;
    try {
      await updateNavigation(confirmToggle.id, {
        title: confirmToggle.title,
        linkType: confirmToggle.linkType as NavLinkType,
        position: confirmToggle.position as NavPosition,
        sortOrder: confirmToggle.sortOrder,
        isVisible: newVisible,
        isOpenNewTab: confirmToggle.isOpenNewTab,
      });
      // 本地状态更新，不重新加载 API（隐藏项保留在列表中）
      setMenuTree((prev) =>
        updateItemInTree(cloneTree(prev), confirmToggle.id, (item) => ({
          ...item,
          isVisible: newVisible,
        }))
      );
      showSuccess(
        `菜单"${confirmToggle.title}"已${newVisible ? "显示" : "隐藏"}`
      );
    } catch {
      setError("操作失败，请重试");
    } finally {
      setActionLoading(false);
      setConfirmToggle(null);
    }
  };

  // ==================== 排序（交换后重新加载） ====================

  const handleMoveInSiblings = async (
    item: NavigationItem,
    direction: "up" | "down",
    siblings: NavigationItem[]
  ) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;

    const target = siblings[targetIdx];
    try {
      await updateNavigation(item.id, {
        title: item.title,
        linkType: item.linkType as NavLinkType,
        position: item.position as NavPosition,
        sortOrder: target.sortOrder,
        isVisible: item.isVisible,
        isOpenNewTab: item.isOpenNewTab,
      });
      await updateNavigation(target.id, {
        title: target.title,
        linkType: target.linkType as NavLinkType,
        position: target.position as NavPosition,
        sortOrder: item.sortOrder,
        isVisible: target.isVisible,
        isOpenNewTab: target.isOpenNewTab,
      });
      // 排序涉及两个节点交换，直接重新加载
      await loadData();
    } catch {
      setError("排序调整失败，请重试");
    }
  };

  // ==================== 渲染 ====================

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            导航菜单
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            配置前台与管理后台的导航菜单层级结构
          </p>
        </div>
        <button
          onClick={() => handleOpenCreate(null)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> 添加根菜单
        </button>
      </div>

      {/* 提示信息 */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 animate-fade-in">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 p-4 text-sm text-green-700 dark:text-green-400 animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* 位置 Tab */}
      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 w-fit">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => handlePositionChange(pos)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedPosition === pos
                ? "bg-primary text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {NAV_POSITION_LABELS[pos]}
          </button>
        ))}
      </div>

      {/* 菜单树表格 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        {/* 表头 */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <span className="w-6" />
          <span className="flex-1">菜单名称</span>
          <span className="w-20 text-center">类型</span>
          <span className="w-20 text-center">排序</span>
          <span className="w-16 text-center">可见</span>
          <span className="w-[120px] text-right">操作</span>
        </div>

        {/* 内容 */}
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-400 dark:text-zinc-550">
            加载中...
          </div>
        ) : menuTree.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FolderOpen size={32} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-400 dark:text-zinc-550 mb-4">
              暂无菜单配置，点击上方按钮开始添加
            </p>
            <button
              onClick={() => handleOpenCreate(null)}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Plus size={14} /> 添加第一个菜单
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {menuTree.map((item) => (
              <TreeNodeRow
                key={item.id}
                item={item}
                depth={0}
                collapsedIds={collapsedIds}
                onToggleCollapse={toggleCollapse}
                onEdit={handleOpenEdit}
                onAddChild={handleOpenCreate}
                onDelete={handleDeleteRequest}
                onMoveUp={(it) =>
                  handleMoveInSiblings(it, "up", menuTree)
                }
                onMoveDown={(it) =>
                  handleMoveInSiblings(it, "down", menuTree)
                }
                onToggleVisible={handleToggleRequest}
                siblings={menuTree}
                onMoveInSiblings={handleMoveInSiblings}
              />
            ))}
          </div>
        )}
      </div>

      {/* 表单弹窗 */}
      <NavigationFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        saving={saving}
        initialData={editItem}
        parentId={creatingParentId ?? editItem?.parentId ?? null}
        position={selectedPosition}
      />

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={!!confirmDelete}
        variant="danger"
        title="确认删除"
        description={
          confirmDelete
            ? countChildren(confirmDelete) > 0
              ? `确定要删除"${confirmDelete.title}"吗？其下 ${countChildren(confirmDelete)} 个子菜单也将一并删除。`
              : `确定要删除"${confirmDelete.title}"吗？`
            : ""
        }
        confirmLabel="删除"
        cancelLabel="取消"
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* 可见性切换确认弹窗 */}
      <ConfirmModal
        open={!!confirmToggle}
        variant="primary"
        title={confirmToggle?.isVisible ? "确认隐藏" : "确认显示"}
        description={
          confirmToggle
            ? confirmToggle.isVisible
              ? `隐藏后"${confirmToggle.title}"将不在前台展示，但此处列表中仍可对其操作恢复。`
              : `显示后"${confirmToggle.title}"将重新出现在前台导航中。`
            : ""
        }
        confirmLabel={confirmToggle?.isVisible ? "隐藏" : "显示"}
        cancelLabel="取消"
        loading={actionLoading}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}

// ==================== 树节点行组件 ====================

/** 单个树节点行（递归渲染） */
function TreeNodeRow({
  item,
  depth,
  collapsedIds,
  onToggleCollapse,
  onEdit,
  onAddChild,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  siblings,
  onMoveInSiblings,
}: {
  item: NavigationItem;
  depth: number;
  collapsedIds: Set<number>;
  onToggleCollapse: (id: number) => void;
  onEdit: (item: NavigationItem) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (item: NavigationItem) => void;
  onMoveUp: (item: NavigationItem) => void;
  onMoveDown: (item: NavigationItem) => void;
  onToggleVisible: (item: NavigationItem) => void;
  siblings: NavigationItem[];
  onMoveInSiblings: (
    item: NavigationItem,
    direction: "up" | "down",
    siblings: NavigationItem[]
  ) => Promise<void>;
}) {
  const hasChildren = item.children.length > 0;
  const isCollapsed = collapsedIds.has(item.id);
  const idx = siblings.findIndex((s) => s.id === item.id);
  const isFirst = idx === 0;
  const isLast = idx === siblings.length - 1;
  const hidden = item.isVisible === false;

  const linkTypeLabel =
    NAV_LINK_TYPE_LABELS[item.linkType as NavLinkType] || item.linkType;

  return (
    <>
      <div
        className={`flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors group ${
          hidden ? "opacity-50" : ""
        }`}
        style={{ paddingLeft: `${20 + depth * 24}px` }}
      >
        {/* 展开/折叠 */}
        <span className="w-6 flex justify-center">
          {hasChildren ? (
            <button
              onClick={() => onToggleCollapse(item.id)}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
        </span>

        {/* 标题 */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {item.linkType === "EXTERNAL" && (
            <ExternalLink size={12} className="text-zinc-400 shrink-0" />
          )}
          <span
            className={`text-sm truncate font-medium ${
              hidden ? "text-zinc-400 dark:text-zinc-500" : "text-neutral-dark dark:text-zinc-100"
            }`}
          >
            {item.title}
          </span>
          {hidden && (
            <span className="text-[10px] text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded font-medium shrink-0">
              已隐藏
            </span>
          )}
          {item.icon && (
            <code className="text-[10px] text-zinc-400 dark:text-zinc-550 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
              {item.icon}
            </code>
          )}
        </div>

        {/* 链接类型 */}
        <span className="w-20 text-center">
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            {linkTypeLabel}
          </span>
        </span>

        {/* 排序 */}
        <span className="w-20 text-center text-xs text-zinc-400 dark:text-zinc-550 font-mono">
          {item.sortOrder}
        </span>

        {/* 可见性切换 */}
        <span className="w-16 flex justify-center">
          <button
            onClick={() => onToggleVisible(item)}
            className={`p-1 rounded transition-colors ${
              item.isVisible !== false
                ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
                : "text-zinc-300 dark:text-zinc-650 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            title={item.isVisible !== false ? "已显示，点击隐藏" : "已隐藏，点击显示"}
          >
            {item.isVisible !== false ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
          </button>
        </span>

        {/* 操作按钮 */}
        <div className="w-[120px] flex items-center justify-end gap-1">
          <button
            onClick={() => onMoveUp(item)}
            disabled={isFirst}
            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors disabled:opacity-20"
            title="上移"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={() => onMoveDown(item)}
            disabled={isLast}
            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors disabled:opacity-20"
            title="下移"
          >
            <ChevronDown size={15} />
          </button>
          <button
            onClick={() => onAddChild(item.id)}
            className="p-1 rounded text-zinc-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
            title="添加子菜单"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            title="编辑"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1 rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 递归渲染子节点 */}
      {hasChildren && !isCollapsed && (
        <>
          {item.children.map((child) => (
            <TreeNodeRow
              key={child.id}
              item={child}
              depth={depth + 1}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onMoveUp={(it) =>
                onMoveInSiblings(it, "up", item.children)
              }
              onMoveDown={(it) =>
                onMoveInSiblings(it, "down", item.children)
              }
              onToggleVisible={onToggleVisible}
              siblings={item.children}
              onMoveInSiblings={onMoveInSiblings}
            />
          ))}
        </>
      )}
    </>
  );
}
