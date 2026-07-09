"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Pencil,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Trash2,
  Mail,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Shield,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Avatar,
  Chip,
  Tooltip,
  Spinner,
  AlertDialog,
  Button,
  SearchField,
} from "@heroui/react";
import { cn } from "@heroui/react";
import { toast } from "@/lib/toast";
import UserFormModal from "@/components/forms/UserFormModal";
import {
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetPassword,
  batchToggleStatus,
  type AdminUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/lib/user-api";

/** 解析头像地址 */
const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
};

/** 状态 Tab 定义 */
const STATUS_TABS = [
  { label: "全部", value: "all" },
  { label: "正常", value: "ACTIVE" },
  { label: "禁用", value: "DISABLED" },
];

/** 角色筛选选项 */
const ROLE_OPTIONS = [
  { label: "全部角色", value: "all" },
  { label: "管理员", value: "ADMIN" },
  { label: "作者", value: "AUTHOR" },
];

/**
 * 后台用户管理页面
 */
export default function UsersPage() {
  // 列表数据
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 筛选
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentRole, setCurrentRole] = useState("all");

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 表单弹窗
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 操作加载态
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<number, boolean>>({});

  // 重置密码弹窗
  const [resetPwdTarget, setResetPwdTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPwdLoading, setResetPwdLoading] = useState(false);

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  /** 加载用户列表 */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers({
        keyword: searchQuery || undefined,
        role: currentRole === "all" ? undefined : currentRole,
        status: currentTab === "all" ? undefined : currentTab,
        page,
        size: pageSize,
      });
      setUsers(result.records || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      toast.error(err.message || "加载用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, currentTab, currentRole, page]);

  /** 统计各状态数量 */
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    disabled: users.filter((u) => u.status === "DISABLED").length,
    admin: users.filter((u) => u.role === "ADMIN").length,
    author: users.filter((u) => u.role === "AUTHOR").length,
  }), [users]);

  /** 搜索 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchVal.trim());
    setPage(1);
  };

  /** 清空搜索 */
  const handleClearSearch = () => {
    setSearchVal("");
    setSearchQuery("");
    setPage(1);
  };

  /** 打开创建弹窗 */
  const openCreateModal = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  /** 打开编辑弹窗 */
  const openEditModal = (user: AdminUser) => {
    setEditUser(user);
    setFormOpen(true);
  };

  /** 表单提交 */
  const handleFormSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    setFormLoading(true);
    try {
      if (editUser) {
        await updateUser(editUser.id, data as UpdateUserPayload);
        toast.success("用户信息已更新");
      } else {
        await createUser(data as CreateUserPayload);
        toast.success("用户创建成功");
      }
      setFormOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "操作失败");
    } finally {
      setFormLoading(false);
    }
  };

  /** 切换启禁用 */
  const handleToggleStatus = async (user: AdminUser) => {
    setActionLoadingMap((prev) => ({ ...prev, [user.id]: true }));
    try {
      await toggleUserStatus(user.id);
      toast.success(`用户 ${user.nickname} 已${user.status === "ACTIVE" ? "禁用" : "启用"}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "操作失败");
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  /** 执行重置密码 */
  const handleResetPassword = async () => {
    if (!resetPwdTarget) return;
    if (newPassword.length < 6) {
      toast.error("密码至少 6 个字符");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    setResetPwdLoading(true);
    try {
      await resetPassword(resetPwdTarget.id, { newPassword });
      toast.success(`已重置 ${resetPwdTarget.nickname} 的密码`);
      setResetPwdTarget(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "重置密码失败");
    } finally {
      setResetPwdLoading(false);
    }
  };

  /** 执行删除 */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoadingMap((prev) => ({ ...prev, [deleteTarget.id]: true }));
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`用户 ${deleteTarget.nickname} 已删除`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "删除失败");
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [deleteTarget.id]: false }));
    }
  };

  /** 批量启禁用 */
  const handleBatchToggle = async (status: "ACTIVE" | "DISABLED") => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要操作的用户");
      return;
    }
    try {
      await batchToggleStatus(Array.from(selectedIds), status);
      toast.success(`已批量${status === "ACTIVE" ? "启用" : "禁用"} ${selectedIds.size} 个用户`);
      setSelectedIds(new Set());
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "批量操作失败");
    }
  };

  /** 切换选择 */
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** 全选/取消 */
  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* ── 头部 ── */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">用户管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / USER MANAGEMENT (共 {total} 个用户)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip delay={0}>
            <button
              onClick={loadUsers}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </button>
            <Tooltip.Content><p>刷新列表</p></Tooltip.Content>
          </Tooltip>
          <Button
            size="sm"
            variant="primary"
            className="h-8 px-3 text-xs font-bold gap-1.5"
            onPress={openCreateModal}
          >
            <UserPlus size={14} />
            新建用户
          </Button>
        </div>
      </div>

      {/* ── 统计条 ── */}
      <div className="flex items-center gap-4 text-[11px] font-mono select-none">
        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          总计 <span className="font-bold text-zinc-700 dark:text-zinc-200">{total}</span>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600/80 dark:text-emerald-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          正常 <span className="font-bold">{stats.active}</span>
        </span>
        <span className="flex items-center gap-1.5 text-red-600/80 dark:text-red-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          禁用 <span className="font-bold">{stats.disabled}</span>
        </span>
        <span className="flex items-center gap-1.5 text-violet-600/80 dark:text-violet-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          ADMIN <span className="font-bold">{stats.admin}</span>
        </span>
        <span className="flex items-center gap-1.5 text-blue-600/80 dark:text-blue-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          AUTHOR <span className="font-bold">{stats.author}</span>
        </span>
      </div>

      {/* ── 过滤区 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50">
        <div className="flex items-center gap-2 select-none overflow-x-auto no-scrollbar">
          {/* 状态 Tabs */}
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "all" ? total : tab.value === "ACTIVE" ? stats.active : stats.disabled;
            return (
              <button
                key={tab.value}
                onClick={() => { setCurrentTab(tab.value); setPage(1); }}
                className={cn(
                  "h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap outline-none border-0 flex items-center gap-1.5",
                  currentTab === tab.value
                    ? "bg-primary text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn("text-[10px] font-mono", currentTab === tab.value ? "text-white/70" : "text-zinc-400 dark:text-zinc-550")}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* 角色筛选 */}
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setCurrentRole(opt.value); setPage(1); }}
              className={cn(
                "h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap outline-none border-0",
                currentRole === opt.value
                  ? "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-450 dark:text-zinc-500 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/40"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <SearchField
            value={searchVal}
            onChange={setSearchVal}
            onSubmit={() => { setSearchQuery(searchVal.trim()); setPage(1); }}
            onClear={handleClearSearch}
            className="sm:w-60"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="搜索用户名、昵称或邮箱..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </form>
      </div>

      {/* ── 批量操作栏 ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-xs font-bold text-primary">
            已选 {selectedIds.size} 项
          </span>
          <button
            onClick={() => handleBatchToggle("ACTIVE")}
            className="h-7 px-3 rounded-md text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            批量启用
          </button>
          <button
            onClick={() => handleBatchToggle("DISABLED")}
            className="h-7 px-3 rounded-md text-[11px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
          >
            批量禁用
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
          >
            取消选择
          </button>
        </div>
      )}

      {/* ── 用户列表 ── */}
      {loading ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Spinner size="sm" color="current" />
            <span className="text-[11px] font-medium tracking-wide">正在加载用户列表...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center text-zinc-400 select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2">
            <Users size={20} className="text-zinc-300 dark:text-zinc-800" />
            <span className="text-[11px]">{searchQuery ? "未找到匹配的用户" : "暂无用户数据"}</span>
          </div>
        </div>
      ) : (
        <>
          {/* 全选 */}
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              {selectedIds.size === users.length ? <CheckSquare size={13} /> : <Square size={13} />}
              全选当前页
            </button>
          </div>

          <div className="space-y-3">
            {users.map((user) => {
              const isLoading = actionLoadingMap[user.id] || false;
              const isSelected = selectedIds.has(user.id);
              const isAdmin = user.role === "ADMIN";
              const isActive = user.status === "ACTIVE";

              return (
                <div
                  key={user.id}
                  className={cn(
                    "group rounded-xl border bg-white dark:bg-zinc-950 p-4 shadow-2xs transition-all duration-200",
                    isSelected
                      ? "border-primary/40 bg-primary/[0.02]"
                      : "border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    {/* 选择框 */}
                    <button
                      onClick={() => toggleSelect(user.id)}
                      className="shrink-0 text-zinc-400 hover:text-primary cursor-pointer"
                    >
                      {isSelected ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} />}
                    </button>

                    {/* 头像 */}
                    <div className="shrink-0 w-[44px] h-[44px]">
                      <Avatar size="md" className="w-full h-full ring-1 ring-zinc-200/40 dark:ring-zinc-800 transition-all group-hover:ring-primary/30">
                        {user.avatarUrl ? (
                          <Avatar.Image alt={user.nickname} src={resolveAvatarUrl(user.avatarUrl)} className="!w-full !h-full object-cover" />
                        ) : null}
                        <Avatar.Fallback className="!w-full !h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                          <span className="text-sm font-bold">{user.nickname?.charAt(0) || "U"}</span>
                        </Avatar.Fallback>
                      </Avatar>
                    </div>

                    {/* 主体信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-dark dark:text-zinc-200 truncate max-w-[160px]">
                          {user.nickname}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">@{user.username}</span>
                        <Chip size="sm" color={isAdmin ? "warning" : "default"} variant="soft">
                          {isAdmin ? "ADMIN" : "AUTHOR"}
                        </Chip>
                        <Chip
                          size="sm"
                          color={isActive ? "success" : "danger"}
                          variant="soft"
                        >
                          {isActive ? "正常" : "禁用"}
                        </Chip>
                        {user.twoFactorEnabled && (
                          <Tooltip delay={0}>
                            <Shield size={12} className="text-emerald-500 shrink-0" />
                            <Tooltip.Content><p>已开启 2FA</p></Tooltip.Content>
                          </Tooltip>
                        )}
                      </div>

                      {/* 元数据行 */}
                      <div className="flex flex-wrap items-center gap-3.5 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {user.email && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]" title={user.email}>
                            <Mail size={11} className="shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1" title="注册时间">
                          <Calendar size={11} className="shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                        </span>
                        {user.lastLoginAt && (
                          <span className="flex items-center gap-1" title="最后登录">
                            <Clock size={11} className="shrink-0" />
                            {new Date(user.lastLoginAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}
                          </span>
                        )}
                        <span className="flex items-center gap-1" title="文章数">
                          <FileText size={11} className="shrink-0" />
                          {user.articleCount}
                        </span>
                        <span className="flex items-center gap-1" title="评论数">
                          <MessageSquare size={11} className="shrink-0" />
                          {user.commentCount}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮组 */}
                    <div className="flex items-center gap-1 shrink-0 select-none">
                      {isLoading && <Spinner size="sm" color="current" className="text-primary mr-1" />}

                      <Tooltip delay={0}>
                        <button
                          onClick={() => openEditModal(user)}
                          disabled={isLoading}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Pencil size={14} />
                        </button>
                        <Tooltip.Content><p>编辑信息</p></Tooltip.Content>
                      </Tooltip>

                      <Tooltip delay={0}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isLoading}
                          className={cn(
                            "h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40",
                            isActive
                              ? "text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-500"
                              : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600"
                          )}
                        >
                          {isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <Tooltip.Content><p>{isActive ? "禁用账号" : "启用账号"}</p></Tooltip.Content>
                      </Tooltip>

                      <Tooltip delay={0}>
                        <button
                          onClick={() => {
                            setResetPwdTarget(user);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          disabled={isLoading}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-500 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <KeyRound size={14} />
                        </button>
                        <Tooltip.Content><p>重置密码</p></Tooltip.Content>
                      </Tooltip>

                      <Tooltip delay={0}>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isLoading}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                        <Tooltip.Content><p>删除用户</p></Tooltip.Content>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── 分页 ── */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 select-none">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            SHOWING {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} OF {total} RECORDS
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="h-7 px-2.5 rounded-md text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "h-7 w-7 rounded-md text-[11px] font-bold transition-colors cursor-pointer",
                    page === pageNum
                      ? "bg-primary text-white"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="h-7 px-2.5 rounded-md text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* ── 创建/编辑表单弹窗 ── */}
      <UserFormModal
        open={formOpen}
        editUser={editUser}
        loading={formLoading}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* ── 重置密码弹窗 ── */}
      <AlertDialog.Backdrop
        isOpen={resetPwdTarget !== null}
        onOpenChange={(open) => { if (!open) setResetPwdTarget(null); }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            {({ close }) => (
              <>
                <AlertDialog.CloseTrigger />
                <AlertDialog.Header>
                  <AlertDialog.Icon status="warning" />
                  <AlertDialog.Heading>重置密码</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p className="mb-3 text-sm">
                    为 <span className="font-bold">{resetPwdTarget?.nickname}</span> 设置新密码：
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">新密码</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="6-50 字符"
                        className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">确认密码</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入新密码"
                        className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button variant="tertiary" onPress={close}>取消</Button>
                  <Button
                    variant="primary"
                    isDisabled={resetPwdLoading || !newPassword || newPassword !== confirmPassword}
                    onPress={() => { handleResetPassword(); }}
                  >
                    {resetPwdLoading ? "处理中..." : "确认重置"}
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* ── 删除确认弹窗 ── */}
      <AlertDialog.Backdrop
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            {({ close }) => (
              <>
                <AlertDialog.CloseTrigger />
                <AlertDialog.Header>
                  <AlertDialog.Icon status="danger" />
                  <AlertDialog.Heading>确认删除此用户？</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p>
                    用户 <span className="font-bold">{deleteTarget?.nickname}</span>（@{deleteTarget?.username}）将被永久删除，
                    此操作不可撤销。该用户的文章和评论记录可能受到影响。
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button variant="tertiary" onPress={close}>取消</Button>
                  <Button variant="danger" onPress={() => { handleDelete(); close(); }}>
                    确认删除
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
