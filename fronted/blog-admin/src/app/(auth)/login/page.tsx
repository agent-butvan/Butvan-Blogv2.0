"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 管理后台登录页
 * - 静谧深海暗色背景 + 流动光斑 + 毛玻璃卡片
 * - 极简风格，仅账号 + 密码
 * - 淡入动画 + 微交互反馈
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("请填写账号和密码");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ username: username.trim(), password });
      if (result.success) {
        router.push("/");
      } else {
        setErrorMsg(result.error || "账号或密码错误");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4 overflow-hidden font-body select-none">
      {/* 流动光斑背景 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* 左上 — 主色光斑 */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full opacity-80 animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(114,123,186,0.25) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* 右下 — 强调色光斑 */}
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-80 animate-float-reverse"
          style={{
            background:
              "radial-gradient(circle, rgba(205,189,232,0.2) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* 细密网格纹理 */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-[400px] animate-slide-up">
        {/* 毛玻璃卡片 */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          {/* Logo 区域 */}
          <div className="mb-8 text-center">
            {/* 品牌图标 */}
            <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <span className="text-white font-heading font-bold text-base">
                B
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold text-white tracking-wide">
              可梵博客
            </h1>
            <p className="mt-1.5 text-xs text-zinc-500">管理后台 · 静谧深海</p>
          </div>

          {/* 错误提示 */}
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-red-950/50 border border-red-900/30 px-4 py-3 text-xs text-red-300 animate-fade-in">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                !
              </span>
              {errorMsg}
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                账号
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] pl-4 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 rounded-lg bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/80 py-2.5 text-sm font-semibold text-white tracking-wide cursor-pointer shadow-lg shadow-primary/15 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "验证中..." : "进入后台"}
            </button>
          </form>
        </div>

        {/* 底部提示 */}
        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Butvan Blog 2.0 · 沉浸式个人博客系统
        </p>
      </div>
    </div>
  );
}
