"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Upload, Save, GitFork, Mail, Rss, Laptop, FileText, Sparkles } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@heroui/react";

/**
 * 个人资料配置页面 (Vercel / Stripe 极简大厂设计风格)
 * - 模块化拆分 4 大独立的卡片配置分区
 * - 支持 Dirty-State 局部检测，仅数据修改时激活保存按钮
 * - 头像上传独立处理与自动同步
 * - 实时拟物化“博主名片”联动预览，输入状态实时高亮/灰度切换
 */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 初始加载状态，用来做 Dirty 比较 ---
  const [initialData, setInitialData] = useState<{
    nickname: string;
    avatarUrl: string;
    bio: string;
    introLine1: string;
    introLine2: string;
    github: string;
    email: string;
    rss: string;
  } | null>(null);

  // --- 表单当前编辑状态 ---
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [introLine1, setIntroLine1] = useState("");
  const [introLine2, setIntroLine2] = useState("");
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [rss, setRss] = useState("");

  // --- 状态控制 ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- 解析后端图片相对 URL 路径 ---
  const resolveUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("/") ? `http://localhost:8080${url}` : url;
  };

  // --- 获取初始博主信息 ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiClient.get("/admin/profile");
        if (res.data.code === 200 || res.data.code === 0) {
          const data = res.data.data;
          const links = data.socialLinks || {};
          const profile = {
            nickname: data.nickname || "",
            avatarUrl: data.avatarUrl || "",
            bio: data.bio || "",
            introLine1: links.introLine1 || "",
            introLine2: links.introLine2 || "",
            github: links.github || "",
            email: links.email || "",
            rss: links.rss || "",
          };
          setInitialData(profile);
          setNickname(profile.nickname);
          setAvatarUrl(profile.avatarUrl);
          setBio(profile.bio);
          setIntroLine1(profile.introLine1);
          setIntroLine2(profile.introLine2);
          setGithub(profile.github);
          setEmail(profile.email);
          setRss(profile.rss);
        }
      } catch (err) {
        console.error("获取个人资料失败", err);
        toast.error("获取个人公开资料失败，请检查网络或后端接口");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // --- 上传头像操作 ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式文件进行上传");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success("头像上传成功，请保存生效");
        setAvatarUrl(res.data.data.fileUrl);
      } else {
        toast.error(res.data.msg || "头像上传失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("上传头像接口异常，请确认后端媒体服务开启");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // --- 保存局部卡片信息的核心方法 ---
  const saveSection = async (sectionName: string, updatedFields: Record<string, any>) => {
    // 基础防空校验
    if (updatedFields.nickname !== undefined && !updatedFields.nickname.trim()) {
      toast.warning("展示昵称不能为空");
      return;
    }

    setSaving(true);
    try {
      // 提交时将编辑的增量字段与当前已缓存的各状态合并，避免覆盖
      const payload = {
        nickname: updatedFields.nickname !== undefined ? updatedFields.nickname : nickname,
        avatarUrl: updatedFields.avatarUrl !== undefined ? updatedFields.avatarUrl : avatarUrl,
        bio: updatedFields.bio !== undefined ? updatedFields.bio : bio,
        socialLinks: {
          introLine1: updatedFields.introLine1 !== undefined ? updatedFields.introLine1 : introLine1,
          introLine2: updatedFields.introLine2 !== undefined ? updatedFields.introLine2 : introLine2,
          github: updatedFields.github !== undefined ? updatedFields.github : github,
          email: updatedFields.email !== undefined ? updatedFields.email : email,
          rss: updatedFields.rss !== undefined ? updatedFields.rss : rss,
        },
      };

      const res = await apiClient.put("/admin/profile", payload);
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success(`${sectionName}已成功保存更新`);
        
        // 同步内存中的 initialData，重新校准为已同步
        setInitialData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...updatedFields,
          };
        });
      } else {
        toast.error(res.data.msg || "更新保存失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("保存公开资料接口访问故障");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-heading">正在获取公开个人资料...</span>
      </div>
    );
  }

  // --- 判断各 Section 的 Dirty 状态 ---
  const isAvatarDirty = avatarUrl !== (initialData?.avatarUrl ?? "");
  
  const isBasicInfoDirty = 
    nickname !== (initialData?.nickname ?? "") || 
    bio !== (initialData?.bio ?? "");

  const isStoryDirty = 
    introLine1 !== (initialData?.introLine1 ?? "") || 
    introLine2 !== (initialData?.introLine2 ?? "");

  const isSocialDirty = 
    github !== (initialData?.github ?? "") || 
    email !== (initialData?.email ?? "") || 
    rss !== (initialData?.rss ?? "");

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6 text-left font-body text-zinc-800 dark:text-zinc-200">
      
      {/* 头部标题区域 */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <User className="text-primary w-5 h-5" />
        <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-heading">
          个人公开资料设置
        </h1>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-bold">
          PROFILE
        </span>
      </div>

      {/* 1. 顶部博主名片实时预览 (Vercel / Stripe 质感) */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 group hover:shadow-md transition-all duration-300">
        {/* 背景微弱光斑装饰 */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        
        {/* 圆形白边头像，支持状态绿点 */}
        <div className="relative w-20 h-20 rounded-full border border-zinc-200/50 dark:border-zinc-800 overflow-hidden shrink-0 bg-zinc-50 dark:bg-zinc-900 shadow-sm flex items-center justify-center">
          {avatarUrl ? (
            <img src={resolveUrl(avatarUrl)} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <User size={28} className="text-zinc-400" />
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full" title="已发布前台" />
        </div>

        {/* 实时响应文案段 */}
        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1 truncate w-full">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {nickname || "您的展示昵称"}
            </h2>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl truncate w-full">
            {bio || "未配置技术栈简介 / 电子签名 (Bio)"}
          </p>
          
          {/* 实时社交网络链接联动图标 */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 w-full justify-center sm:justify-start">
            <span 
              className={cn(
                "flex items-center gap-1 text-[10px] font-mono transition-all",
                github ? "text-zinc-800 dark:text-zinc-200 opacity-100" : "text-zinc-400 opacity-30"
              )}
              title={github ? `GitHub: ${github}` : "未配置 GitHub"}
            >
              <GitFork size={12} className={cn(github && "text-zinc-900 dark:text-zinc-100")} />
              GitHub
            </span>

            <span 
              className={cn(
                "flex items-center gap-1 text-[10px] font-mono transition-all",
                email ? "text-zinc-800 dark:text-zinc-200 opacity-100" : "text-zinc-400 opacity-30"
              )}
              title={email ? `Email: ${email}` : "未配置 Email"}
            >
              <Mail size={12} className={cn(email && "text-sky-500")} />
              Email
            </span>

            <span 
              className={cn(
                "flex items-center gap-1 text-[10px] font-mono transition-all",
                rss ? "text-zinc-800 dark:text-zinc-200 opacity-100" : "text-zinc-400 opacity-30"
              )}
              title={rss ? `RSS: ${rss}` : "未配置 RSS"}
            >
              <Rss size={12} className={cn(rss && "text-amber-500")} />
              RSS Feed
            </span>
          </div>
        </div>
      </div>

      {/* 四大模块化配置 Section 组 */}
      <div className="flex flex-col gap-6">

        {/* Section 1: 个人形象头像 */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex flex-col gap-1 max-w-lg">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                个人展示头像
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                支持上传 JPG、PNG 或 WebP 格式的头像。系统会自动生成前台所需的分辨率裁剪图。
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div 
                onClick={handleAvatarClick}
                className="relative w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer group bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center transition-all hover:scale-102"
                title="点击更换公开头像"
              >
                {avatarUrl ? (
                  <img src={resolveUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-zinc-400" />
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] transition-opacity">
                  <Upload size={10} className="mb-0.5" />
                  更换
                </div>
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {uploading ? "正在上传..." : "选择图片"}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
          <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>图片大小不超过 2MB，建议使用 1:1 的方形。</span>
            <button
              onClick={() => saveSection("头像", { avatarUrl })}
              disabled={saving || uploading || !isAvatarDirty}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600 border border-transparent dark:disabled:border-transparent disabled:cursor-not-allowed"
            >
              {isAvatarDirty ? "保存更改" : "已同步"}
            </button>
          </div>
        </div>

        {/* Section 2: 基础展示信息 */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                基本公开资料
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                设置您的博主昵称与一句话签名。它们会展示在首屏和名片卡中。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 展示昵称 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  博主展示昵称
                </label>
                <input
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入您的昵称"
                  className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all"
                />
              </div>

              {/* 个性签名 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  一句话个性签名 (Bio)
                </label>
                <input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Java/Kotlin + JavaScript/Typescript 全栈开发者"
                  className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>昵称在后台不可为空。</span>
            <button
              onClick={() => saveSection("基础资料", { nickname, bio })}
              disabled={saving || !isBasicInfoDirty}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600 border border-transparent dark:disabled:border-transparent disabled:cursor-not-allowed"
            >
              {isBasicInfoDirty ? "保存更改" : "已同步"}
            </button>
          </div>
        </div>

        {/* Section 3: 故事与文案 */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                详细关于我故事
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                在博客的“关于我”版块展示的个人核心标签与长段欢迎词。
              </p>
            </div>
            
            <div className="flex flex-col gap-4 pt-1">
              {/* 第一行文案 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  核心自我介绍 (第一行)
                </label>
                <input
                  value={introLine1}
                  onChange={(e) => setIntroLine1(e.target.value)}
                  placeholder="例如：🔥 大三前端探索者 | 写代码也写生活 | 开源项目复盘 ✨"
                  className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all"
                />
              </div>

              {/* 第二行文案 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  博主详细描述 (第二行)
                </label>
                <textarea
                  value={introLine2}
                  onChange={(e) => setIntroLine2(e.target.value)}
                  placeholder="例如：欢迎来我的博客交流学习，一起成长进步，用代码碰撞灵感，一起走更远~"
                  rows={3}
                  className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>可以使用 emoji 表情修饰前台排版。</span>
            <button
              onClick={() => saveSection("自我介绍", { introLine1, introLine2 })}
              disabled={saving || !isStoryDirty}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600 border border-transparent dark:disabled:border-transparent disabled:cursor-not-allowed"
            >
              {isStoryDirty ? "保存更改" : "已同步"}
            </button>
          </div>
        </div>

        {/* Section 4: 社交与订阅绑定 */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                社交渠道与订阅源
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                绑定您的 GitHub 主页、联系邮箱及 RSS 路径。绑定后将在名片区和首屏自动点亮展示。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* GitHub */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  GitHub 账号链接
                </label>
                <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/30 dark:focus-within:bg-zinc-950 transition-all">
                  <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/80 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 select-none">
                    <GitFork size={11} /> github.com/
                  </span>
                  <input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="账号名称"
                    className="w-full px-2.5 h-9 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  联系电子邮箱
                </label>
                <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/30 dark:focus-within:bg-zinc-950 transition-all">
                  <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/80 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 select-none">
                    <Mail size={11} /> mailto:
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full px-2.5 h-9 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* RSS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  RSS 订阅源路径
                </label>
                <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/30 dark:focus-within:bg-zinc-950 transition-all">
                  <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/80 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 select-none">
                    <Rss size={11} /> PATH:
                  </span>
                  <input
                    value={rss}
                    onChange={(e) => setRss(e.target.value)}
                    placeholder="/feed.xml"
                    className="w-full px-2.5 h-9 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>社交与订阅变更后会自动在前台渲染交互组件。</span>
            <button
              onClick={() => saveSection("社交渠道", { github, email, rss })}
              disabled={saving || !isSocialDirty}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600 border border-transparent dark:disabled:border-transparent disabled:cursor-not-allowed"
            >
              {isSocialDirty ? "保存更改" : "已同步"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
