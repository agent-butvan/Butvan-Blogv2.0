"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, ShieldAlert, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 管理后台登录/注册复合页面
 * - 创新效果：流体发光背景 (Liquid Glow Background) + 极简毛玻璃卡片 (Glassmorphism)
 * - 登录与注册无缝平滑切换，支持自动注册并登录，提供完美的微反馈
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // 页面模式：'login' 登录 | 'register' 注册
  const [mode, setMode] = useState<"login" | "register">("login");

  // 表单状态
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /**
   * 提交登录表单
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("请填写完整的账号和密码");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ username: username.trim(), password });
      if (result.success) {
        setSuccessMsg("登录成功，正在进入个人空间...");
        setTimeout(() => router.push("/"), 800);
      } else {
        setErrorMsg(result.error || "登录失败，用户名或密码错误");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 提交注册表单
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 基础校验
    if (!username.trim() || !password.trim() || !nickname.trim()) {
      setErrorMsg("请填写完整的用户名、密码与展示昵称");
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg("用户名长度不能少于 3 位");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("安全密码长度不能少于 6 位");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        username: username.trim(),
        password,
        nickname: nickname.trim(),
        email: email.trim() || undefined,
      });

      if (result.success) {
        setSuccessMsg("账号建立成功！正在为您自动登录并初始化空间...");
        
        // 自动执行一次登录，免去用户手动登录的繁琐操作
        const loginRes = await login({ username: username.trim(), password });
        if (loginRes.success) {
          setTimeout(() => router.push("/"), 1200);
        } else {
          setSuccessMsg("注册成功，请切换至登录模式进行登录");
          setMode("login");
        }
      } else {
        setErrorMsg(result.error || "注册失败，请检查填写规则");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 切换登录/注册模式
   */
  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrorMsg(null);
    setSuccessMsg(null);
    setUsername("");
    setPassword("");
    setNickname("");
    setEmail("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4 overflow-hidden font-body select-none">
      
      {/* 1. 流体发光背景 (Liquid Glow Blobs) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blob-glow-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/25 blob-glow-2" />
        {/* 微弱网络网格点阵装饰 */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
      </div>

      {/* 内联 CSS 浮动动效 */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.15);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }
        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1.1);
          }
          33% {
            transform: translate(-50px, 40px) scale(0.85);
          }
          66% {
            transform: translate(40px, -30px) scale(1.05);
          }
        }
        .blob-glow-1 {
          filter: blur(100px);
          animation: float-slow 15s infinite ease-in-out;
        }
        .blob-glow-2 {
          filter: blur(100px);
          animation: float-reverse 20s infinite ease-in-out;
        }
      `}</style>

      {/* 2. 磨砂玻璃卡片容器 (Glassmorphism Card) */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl bg-neutral-light/5 dark:bg-[#121214]/65 backdrop-blur-2xl p-8 border border-white/10 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(114,123,186,0.15)] transition-all duration-300">
        
        {/* Logo 与顶栏 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20">
            {mode === "login" ? (
              <LogIn className="h-5.5 w-5.5 text-white" />
            ) : (
              <UserPlus className="h-5.5 w-5.5 text-white" />
            )}
          </div>
          <h1 className="font-heading text-xl font-bold text-white tracking-wide">
            {mode === "login" ? "可梵博客 · 空间门廊" : "建立新创作者账户"}
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            {mode === "login" ? "在寂静与创意中书写您的故事" : "初始化您的个人博客后台管理账号"}
          </p>
        </div>

        {/* 动态警示/错误消息 */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-950/40 p-3.5 text-xs text-red-300 border border-red-900/50 animate-[fadeIn_0.3s_ease-out]">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 成功响应消息 */}
        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-950/40 p-3.5 text-xs text-emerald-300 border border-emerald-900/50 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 统一表单区域 */}
        <form onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
          
          {/* 账号 */}
          <div className="text-left">
            <label className="mb-1 block text-xs font-semibold text-zinc-300 tracking-wider">用户名</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <User size={15} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="英文字母、数字或下划线"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>

          {/* 注册专属字段：展示昵称 */}
          {mode === "register" && (
            <div className="text-left animate-[fadeIn_0.25s_ease-out]">
              <label className="mb-1 block text-xs font-semibold text-zinc-300 tracking-wider">展示昵称</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <ShieldAlert size={15} />
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例如：可梵 Butvan"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/15"
                />
              </div>
            </div>
          )}

          {/* 注册专属字段：电子邮箱 */}
          {mode === "register" && (
            <div className="text-left animate-[fadeIn_0.3s_ease-out]">
              <label className="mb-1 block text-xs font-semibold text-zinc-300 tracking-wider">电子邮箱 (选填)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/15"
                />
              </div>
            </div>
          )}

          {/* 密码 */}
          <div className="text-left">
            <label className="mb-1 block text-xs font-semibold text-zinc-300 tracking-wider">安全密码</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Key size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "您的登录密码" : "至少 6 位安全字符"}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-11 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/95 hover:to-primary/75 px-4 py-3 text-center text-xs font-semibold text-white tracking-wider cursor-pointer shadow-lg shadow-primary/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {mode === "login" ? (
              submitting ? "正在开启大门..." : "开启创作之旅"
            ) : (
              submitting ? "正在建立账户..." : "注册并立即登录"
            )}
          </button>
        </form>

        {/* 登录与注册切换链 */}
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors focus:outline-none"
          >
            {mode === "login" ? (
              <span>
                还没有管理账户？ <span className="text-primary hover:underline font-semibold ml-1">立即注册</span>
              </span>
            ) : (
              <span>
                已有创作者账号？ <span className="text-primary hover:underline font-semibold ml-1">返回登录</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
