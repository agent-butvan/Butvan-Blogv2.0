"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Portal from "@/components/common/Portal";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/lib/user-api";

/**
 * 用户创建/编辑表单弹窗
 * - 复用同一组件，通过 editUser 是否为 null 区分创建/编辑模式
 * - 创建模式：用户名、密码、昵称、邮箱、角色
 * - 编辑模式：昵称、邮箱、头像URL、简介、角色
 */
export default function UserFormModal({
  open,
  editUser,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editUser: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
}) {
  const isEdit = !!editUser;

  // 表单状态
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");

  // 校验错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编辑模式填充数据
  useEffect(() => {
    if (editUser) {
      setUsername(editUser.username);
      setNickname(editUser.nickname);
      setEmail(editUser.email || "");
      setAvatarUrl(editUser.avatarUrl || "");
      setBio(editUser.bio || "");
      setRole(editUser.role);
    } else {
      setUsername("");
      setPassword("");
      setNickname("");
      setEmail("");
      setAvatarUrl("");
      setBio("");
      setRole("USER");
    }
    setErrors({});
  }, [editUser, open]);

  /** 前端表单校验 */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!isEdit && !username.trim()) errs.username = "用户名不能为空";
    if (!isEdit && username.trim().length < 3) errs.username = "用户名至少 3 个字符";
    if (!isEdit && !password.trim()) errs.password = "密码不能为空";
    if (!isEdit && password.length < 6) errs.password = "密码至少 6 个字符";
    if (!nickname.trim()) errs.nickname = "昵称不能为空";
    if (nickname.trim().length < 2) errs.nickname = "昵称至少 2 个字符";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "邮箱格式不正确";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** 提交表单 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      onSubmit({
        nickname: nickname.trim(),
        email: email.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        role,
      } as UpdateUserPayload);
    } else {
      onSubmit({
        username: username.trim(),
        password,
        nickname: nickname.trim(),
        email: email.trim() || undefined,
        role,
      } as CreateUserPayload);
    }
  };

  if (!open) return null;

  /** 输入框样式 */
  const inputCls =
    "w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
  const labelCls = "block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5";
  const errorCls = "text-[10px] text-red-500 mt-1";

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 遮罩 */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        {/* 弹窗 */}
        <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-heading text-base font-bold text-zinc-800 dark:text-zinc-100">
              {isEdit ? "编辑用户" : "创建新用户"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* 用户名（仅创建模式） */}
            {!isEdit && (
              <div>
                <label className={labelCls}>用户名 *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="字母、数字、下划线，3-50 字符"
                  className={inputCls}
                />
                {errors.username && <p className={errorCls}>{errors.username}</p>}
              </div>
            )}

            {/* 密码（仅创建模式） */}
            {!isEdit && (
              <div>
                <label className={labelCls}>密码 *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6-50 字符"
                  className={inputCls}
                />
                {errors.password && <p className={errorCls}>{errors.password}</p>}
              </div>
            )}

            {/* 昵称 */}
            <div>
              <label className={labelCls}>昵称 *</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2-50 字符"
                className={inputCls}
              />
              {errors.nickname && <p className={errorCls}>{errors.nickname}</p>}
            </div>

            {/* 邮箱 */}
            <div>
              <label className={labelCls}>邮箱</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="可选"
                className={inputCls}
              />
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>

            {/* 头像 URL（仅编辑模式） */}
            {isEdit && (
              <div>
                <label className={labelCls}>头像 URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="可选"
                  className={inputCls}
                />
              </div>
            )}

            {/* 个人简介（仅编辑模式） */}
            {isEdit && (
              <div>
                <label className={labelCls}>个人简介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="可选，最多 500 字符"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>
            )}

            {/* 角色 */}
            <div>
              <label className={labelCls}>角色 *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
                className={inputCls}
              >
                <option value="USER">普通用户</option>
                <option value="ADMIN">站长</option>
              </select>
            </div>

            {/* 按钮 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? "保存修改" : "创建用户"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
