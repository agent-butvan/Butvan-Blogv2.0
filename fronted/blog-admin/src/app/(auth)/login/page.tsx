"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 管理后台登录页面
 * - 账号密码表单（原生 input + Tailwind 样式）
 * - 登录成功跳转 Dashboard / 失败显示错误提示
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("请填写完整的账号和密码");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ username: username.trim(), password });
      if (result.success) {
        setSuccessMsg("登录成功，正在跳转...");
        setTimeout(() => router.push("/"), 500);
      } else {
        setErrorMsg(result.error || "登录失败");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-light px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-zinc-100">
        {/* Logo / 标题区 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-dark">
            可梵博客 · 管理后台
          </h1>
          <p className="mt-1 text-sm text-zinc-500">请登录以继续</p>
        </div>

        {/* 错误提示 */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* 成功提示 */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            <CheckCircle size={16} className="shrink-0" />
            {successMsg}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 账号输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              账号
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              autoFocus
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-zinc-900 placeholder-zinc-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-3 text-center text-base font-medium text-white transition-all duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "登录中..." : "登 录"}
          </button>
        </form>
      </div>
    </div>
  );
}
