"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  GitBranch,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { cn } from "@heroui/react";
import apiClient from "@/lib/api";
import { setUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import {
  changeCurrentUserPassword,
  fetchCurrentUser,
  updateCurrentUserProfile,
  type CurrentUser,
} from "@/lib/account-api";

type ProfileTab = "profile" | "security" | "bindings";

interface ProfileFormState {
  nickname: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_PROFILE_FORM: ProfileFormState = {
  nickname: "",
  email: "",
  avatarUrl: "",
  bio: "",
};

const DEFAULT_PASSWORD_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * 解析头像地址，兼容后端本地上传相对路径
 */
function resolveAvatarUrl(avatarUrl?: string): string {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return avatarUrl.startsWith("/") ? `http://localhost:8080${avatarUrl}` : avatarUrl;
}

/**
 * 格式化后端时间字符串为中文日期
 */
function formatDate(value?: string): string {
  if (!value) return "暂无记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无记录";
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 计算注册天数，至少展示 1 天
 */
function getRegistrationDays(value?: string): number {
  if (!value) return 1;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 1;
  const diff = Date.now() - date.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

/**
 * 由当前账号资料生成表单初始状态
 */
function toProfileForm(user: CurrentUser): ProfileFormState {
  return {
    nickname: user.nickname || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
  };
}

/**
 * 个人中心设置页面
 */
export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [initialForm, setInitialForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(DEFAULT_PASSWORD_FORM);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    /**
     * 初始化个人中心数据
     */
    const loadCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser();
        const nextForm = toProfileForm(user);
        setCurrentUser(user);
        setInitialForm(nextForm);
        setProfileForm(nextForm);
        setUser(user);
      } catch (error) {
        console.error("获取当前账号资料失败", error);
        toast.error("获取个人中心资料失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const isProfileDirty = useMemo(() => {
    return (
      profileForm.nickname !== initialForm.nickname ||
      profileForm.email !== initialForm.email ||
      profileForm.avatarUrl !== initialForm.avatarUrl ||
      profileForm.bio !== initialForm.bio
    );
  }, [initialForm, profileForm]);

  const avatarUrl = resolveAvatarUrl(profileForm.avatarUrl);
  const registrationDays = getRegistrationDays(currentUser?.createdAt);

  /**
   * 更新个人资料表单字段
   */
  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 选择本地头像图片
   */
  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  /**
   * 上传头像并回填头像地址
   */
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式的头像文件");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) {
        toast.error(res.data?.msg || "头像上传失败");
        return;
      }
      updateProfileField("avatarUrl", fileUrl);
      toast.success("头像已上传，请保存资料后生效");
    } catch (error) {
      console.error("头像上传失败", error);
      toast.error("头像上传失败，请确认媒体服务是否可用");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  /**
   * 保存个人资料
   */
  const handleSaveProfile = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!profileForm.nickname.trim()) {
      toast.warning("昵称不能为空");
      return;
    }

    setSavingProfile(true);
    try {
      const updatedUser = await updateCurrentUserProfile({
        nickname: profileForm.nickname.trim(),
        email: profileForm.email.trim() || undefined,
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
        bio: profileForm.bio.trim() || undefined,
      });
      const nextForm = toProfileForm(updatedUser);
      setCurrentUser(updatedUser);
      setInitialForm(nextForm);
      setProfileForm(nextForm);
      setUser(updatedUser);
      toast.success("个人中心资料已保存");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { msg?: string } } };
      toast.error(apiError.response?.data?.msg || "保存资料失败，请稍后重试");
    } finally {
      setSavingProfile(false);
    }
  };

  /**
   * 修改当前账号登录密码
   */
  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning("两次输入的新密码不一致");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning("新密码至少需要 6 个字符");
      return;
    }

    setChangingPassword(true);
    try {
      await changeCurrentUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(DEFAULT_PASSWORD_FORM);
      toast.success("密码已更新，请妥善保管新密码");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { msg?: string } } };
      toast.error(apiError.response?.data?.msg || "密码修改失败，请检查当前密码");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 p-1 text-left text-zinc-800 dark:text-zinc-200">
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <User size={17} className="text-primary" />
          <h1 className="font-heading text-base font-bold text-zinc-950 dark:text-zinc-50">个人中心</h1>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
            {currentUser?.status === "ACTIVE" ? "账号正常" : "已停用"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <CalendarDays size={14} />
          <span>已加入 {registrationDays} 天</span>
          <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span>最近登录：{formatDate(currentUser?.lastLoginAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-2 border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="账号头像" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {profileForm.nickname?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase() || "A"}
                </div>
              )}
              <button
                onClick={handleChooseAvatar}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                title="上传头像"
              >
                {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="min-w-0 text-center">
              <p className="truncate text-base font-bold text-zinc-950 dark:text-zinc-50">{profileForm.nickname || "管理员"}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">@{currentUser?.username}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{currentUser?.role}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                UID {currentUser?.id}
              </span>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <MetaRow label="注册日期" value={formatDate(currentUser?.createdAt)} />
            <MetaRow label="资料更新" value={formatDate(currentUser?.updatedAt)} />
            <MetaRow label="绑定邮箱" value={profileForm.email || "未绑定"} />
          </div>
        </aside>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex border-b border-zinc-200 px-4 dark:border-zinc-800">
            <TabButton active={activeTab === "profile"} icon={<User size={14} />} label="个人资料" onClick={() => setActiveTab("profile")} />
            <TabButton active={activeTab === "security"} icon={<ShieldCheck size={14} />} label="安全设置" onClick={() => setActiveTab("security")} />
            <TabButton active={activeTab === "bindings"} icon={<BadgeCheck size={14} />} label="账号绑定" onClick={() => setActiveTab("bindings")} />
          </div>

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="昵称" required>
                  <input
                    value={profileForm.nickname}
                    onChange={(event) => updateProfileField("nickname", event.target.value)}
                    className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="请输入昵称"
                  />
                </Field>
                <Field label="头像地址">
                  <input
                    value={profileForm.avatarUrl}
                    onChange={(event) => updateProfileField("avatarUrl", event.target.value)}
                    className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="https:// 或 /uploads/..."
                  />
                </Field>
              </div>
              <Field label="个人简介">
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => updateProfileField("bio", event.target.value)}
                  className="min-h-28 resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="写一段会展示在账号资料中的简介"
                  maxLength={500}
                />
              </Field>
              <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <span className={cn("text-xs", isProfileDirty ? "text-amber-600 dark:text-amber-300" : "text-zinc-400")}>
                  {isProfileDirty ? "资料有未保存修改" : "当前资料已同步"}
                </span>
                <button
                  type="submit"
                  disabled={!isProfileDirty || savingProfile}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  保存资料
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="flex max-w-[560px] flex-col gap-4 p-5">
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>修改密码后当前 Token 仍可继续使用；重新登录时请使用新密码。</span>
              </div>
              <Field label="当前密码" required>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="请输入当前密码"
                />
              </Field>
              <Field label="新密码" required>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="至少 6 个字符"
                />
              </Field>
              <Field label="确认新密码" required>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="再次输入新密码"
                />
              </Field>
              <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                >
                  {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  更新密码
                </button>
              </div>
            </form>
          )}

          {activeTab === "bindings" && (
            <div className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <BindingItem icon={<Mail size={15} />} title="电子邮箱" value={profileForm.email || "未绑定"} active={!!profileForm.email} />
                <BindingItem icon={<Smartphone size={15} />} title="手机号码" value="暂未绑定" active={false} />
                <BindingItem icon={<GitBranch size={15} />} title="GitHub" value="暂未绑定" active={false} />
                <BindingItem icon={<ShieldCheck size={15} />} title="双重验证" value="未开启" active={false} />
              </div>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 md:grid-cols-[1fr_auto]">
                <Field label="绑定邮箱">
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => updateProfileField("email", event.target.value)}
                    className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="name@example.com"
                  />
                </Field>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!isProfileDirty || savingProfile}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    保存绑定
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * 个人中心顶部页签按钮
 */
function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-11 items-center gap-1.5 px-3 text-xs font-bold transition-colors",
        active ? "text-primary" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
      )}
    >
      {icon}
      {label}
      {active && <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />}
    </button>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * 表单字段容器组件
 */
function Field({ label, required = false, children }: FieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
}

/**
 * 左侧账号元信息行
 */
function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
      <span className="text-zinc-500 dark:text-zinc-500">{label}</span>
      <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}

interface BindingItemProps {
  icon: ReactNode;
  title: string;
  value: string;
  active: boolean;
}

/**
 * 账号绑定状态项
 */
function BindingItem({ icon, title, value, active }: BindingItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-800">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-500">{value}</span>
      </span>
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-300" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900")}>
        {active ? "已绑定" : "未绑定"}
      </span>
    </div>
  );
}

/**
 * 个人中心页面骨架屏
 */
function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 p-1">
      <div className="h-12 animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800/50" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-96 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
      </div>
    </div>
  );
}
