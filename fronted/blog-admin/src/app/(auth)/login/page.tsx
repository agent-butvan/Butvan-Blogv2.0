"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 极简干净的管理后台登录页
 * - topography.svg 作为背景，配合鼠标/触摸移动实现光圈跟随效果（Flashlight Effect）
 * - 左右对称/不对称贴边直角扁平布局，消除 AI 常规的玻璃拟物化悬空卡片感
 * - 使用简约的细线与纯色块，完美贴合简约干净的项目调性
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<"password" | "2fa">("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [require2fa, setRequire2fa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const twoFactorInputRef = useRef<HTMLInputElement>(null);

  // 监听用户名变化，自动根据本地缓存判断是否展示 2FA 输入框，实现“一次性直接登录”的极佳体验
  useEffect(() => {
    if (typeof window !== "undefined" && username.trim()) {
      const isEnabled = localStorage.getItem(`blog_2fa_enabled_${username.trim()}`) === "true";
      setRequire2fa(isEnabled);
    } else {
      setRequire2fa(false);
    }
  }, [username]);

  // 监听鼠标与触摸位置，更新 CSS 变量以驱动背景遮罩定位
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 鼠标移动事件回调
    const handleMouseMove = (e: MouseEvent) => {
      container.style.setProperty("--mouse-x", `${e.clientX}px`);
      container.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    // 触摸移动事件回调
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        container.style.setProperty("--mouse-x", `${e.touches[0].clientX}px`);
        container.style.setProperty("--mouse-y", `${e.touches[0].clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // 处理登录表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg("请填写账号");
      return;
    }

    if (loginMethod === "password" && !password.trim()) {
      setErrorMsg("请填写密码");
      return;
    }

    const is2faActive = loginMethod === "2fa" || require2fa;
    if (is2faActive && !twoFactorCode.trim()) {
      setErrorMsg("请输入 6 位 2FA 验证码");
      twoFactorInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({
        username: username.trim(),
        password: loginMethod === "password" ? password : "",
        twoFactorCode: is2faActive ? twoFactorCode.trim() : undefined,
      });
      if (result.success) {
        // 登录成功，将该用户的最新的 2FA 状态缓存在本地，以便下次快速登录
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            if (u.twoFactorEnabled) {
              localStorage.setItem(`blog_2fa_enabled_${username.trim()}`, "true");
            } else {
              localStorage.removeItem(`blog_2fa_enabled_${username.trim()}`);
            }
          } catch (err) {
            console.error("解析用户信息失败", err);
          }
        }
        // 如果是2fa模式登录，确保开启状态保存在本地
        if (loginMethod === "2fa") {
          localStorage.setItem(`blog_2fa_enabled_${username.trim()}`, "true");
        }
        router.push("/");
      } else {
        if (result.error === "NEED_2FA") {
          setRequire2fa(true);
          localStorage.setItem(`blog_2fa_enabled_${username.trim()}`, "true");
          setErrorMsg("该账号已开启双重验证，请输入2FA验证码");
          // 延迟聚焦，等待动画展开完毕
          setTimeout(() => {
            twoFactorInputRef.current?.focus();
          }, 150);
        } else {
          setErrorMsg(result.error || "账号或密码错误");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors duration-200 select-none"
    >
      {/* 1. 地形图背景底色层：全屏幕微弱可见 */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] transition-opacity"
        style={{
          backgroundImage: "url(/topography.svg)",
          backgroundSize: "666px 666px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* 2. 地形图鼠标光照层：仅在鼠标周围 240px 范围内被 radial-gradient 照亮呈现 */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-[0.12] transition-opacity"
        style={{
          backgroundImage: "url(/topography.svg)",
          backgroundSize: "666px 666px",
          backgroundRepeat: "repeat",
          maskImage:
            "radial-gradient(circle 240px at var(--mouse-x, -999px) var(--mouse-y, -999px), #000 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle 240px at var(--mouse-x, -999px) var(--mouse-y, -999px), #000 0%, transparent 100%)",
        }}
      />

      {/* 登录主卡片：直角、扁平、细线边框，无浮空玻璃感 */}
      <div className="relative z-10 flex h-[480px] w-full max-w-[800px] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
        {/* 左半侧：品牌视觉区 (大屏显示) */}
        <div className="hidden md:flex flex-1 flex-col justify-between bg-zinc-950 dark:bg-black p-10 text-white relative overflow-hidden">
          {/* 左侧地形图微弱底纹 */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(/topography.svg)",
              backgroundSize: "400px 400px",
              backgroundRepeat: "repeat",
            }}
          />

          <div className="relative z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-extrabold text-white tracking-tighter">
              VB
            </div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="font-heading text-2xl font-bold tracking-wider leading-relaxed">
              BUTVAN BLOG 2.0
            </h2>
            <p className="mt-2 text-sm text-zinc-400 font-light">
              可梵博客后台管理系统
            </p>
            <div className="mt-8 h-px w-12 bg-primary" />
            <p className="mt-4 text-xs text-zinc-500 max-w-[260px] leading-relaxed">
              简约、干练、高效的沉浸式内容创作工作台，支持极速响应与全功能管理。
            </p>
          </div>

          <div className="relative z-10 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
            EST. 2026 / VERSION 2.0
          </div>
        </div>

        {/* 右半侧：登录表单区 */}
        <div className="flex w-full md:w-[360px] flex-col justify-center bg-white dark:bg-zinc-900 px-8 py-10 transition-colors">
          <div>
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">
              登 录
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-0.5">
              SIGN IN TO CONSOLE
            </p>
          </div>

          {/* 登录方式切换：直角极简扁平设计 */}
          <div className="mt-4 flex border-b border-zinc-100 dark:border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setErrorMsg(null);
              }}
              className={`flex-1 pb-1.5 font-medium transition-colors border-b-2 -mb-px text-center cursor-pointer ${
                loginMethod === "password"
                  ? "border-primary text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
              }`}
            >
              密码登录
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("2fa");
                setErrorMsg(null);
                // 自动将焦点定位到 2FA 框
                setTimeout(() => {
                  twoFactorInputRef.current?.focus();
                }, 100);
              }}
              className={`flex-1 pb-1.5 font-medium transition-colors border-b-2 -mb-px text-center cursor-pointer ${
                loginMethod === "2fa"
                  ? "border-primary text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
              }`}
            >
              2FA 免密直接登录
            </button>
          </div>

          {/* 错误提示 */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded border border-red-200/50 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-[11px] text-red-500 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* 账号 */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                账号
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  autoComplete="username"
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-colors focus:border-primary focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* 密码 */}
            {loginMethod === "password" && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="mb-1 block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required={loginMethod === "password"}
                    autoComplete="current-password"
                    className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-10 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-colors focus:border-primary focus:bg-white dark:focus:bg-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* 2FA 双重验证码 (带平滑手风琴展开动效) */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                (loginMethod === "2fa" || require2fa)
                  ? "max-h-[80px] opacity-100 mt-4" 
                  : "max-h-0 opacity-0 !mt-0 pointer-events-none"
              }`}
            >
              <label className="mb-1 block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                双重验证码 (2FA)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-bold text-xs select-none">
                  #
                </span>
                <input
                  ref={twoFactorInputRef}
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入 6 位验证码"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-colors focus:border-primary focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* 选项组：记住我 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-primary h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 select-none">
                  记住我
                </span>
              </label>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 rounded bg-primary hover:bg-primary/90 text-white py-2 text-xs font-bold tracking-widest cursor-pointer shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "安全验证中..." : loginMethod === "2fa" ? "双重认证登录" : "进入后台"}
            </button>
          </form>

          {/* 底部版权 */}
          <div className="mt-8 text-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Butvan Blog 2.0 · 沉浸式工作台
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
