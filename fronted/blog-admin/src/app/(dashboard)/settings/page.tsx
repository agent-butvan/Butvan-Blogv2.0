"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Upload, Save, Github, Mail, Rss, Laptop, FileText, Sparkles } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "@/lib/toast";

/**
 * 个人资料配置页面
 * 允许管理员上传修改个人头像，编辑昵称、签名、多行详细自我介绍文案，
 * 以及 GitHub, Email, RSS 等社交链接。
 */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 表单状态 ---
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [introLine1, setIntroLine1] = useState("");
  const [introLine2, setIntroLine2] = useState("");
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [rss, setRss] = useState("");

  // --- 加载与保存状态 ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- 解析图片 URL ---
  const resolveUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("/") ? `http://localhost:8080${url}` : url;
  };

  // --- 挂载时获取初始资料 ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiClient.get("/admin/profile");
        if (res.data.code === 200 || res.data.code === 0) {
          const data = res.data.data;
          const links = data.socialLinks || {};
          setNickname(data.nickname || "");
          setAvatarUrl(data.avatarUrl || "");
          setBio(data.bio || "");
          setIntroLine1(links.introLine1 || "");
          setIntroLine2(links.introLine2 || "");
          setGithub(links.github || "");
          setEmail(links.email || "");
          setRss(links.rss || "");
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

  // --- 处理头像文件选择并上传 ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // 简单校验文件类型
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
        toast.success("头像上传成功");
        setAvatarUrl(res.data.data.fileUrl);
      } else {
        toast.error(res.data.msg || "头像上传失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("上传头像接口异常，请确认后端媒体服务开启");
    } finally {
      setUploading(false);
      e.target.value = ""; // 清空以便重复选择
    }
  };

  // --- 提交更新公开资料 ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.warning("昵称不能为空");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put("/admin/profile", {
        nickname,
        avatarUrl,
        bio,
        socialLinks: {
          introLine1,
          introLine2,
          github,
          email,
          rss,
        },
      });
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success("博主公开资料更新保存成功！");
      } else {
        toast.error(res.data.msg || "保存公开资料失败");
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

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6 text-left font-body">
      {/* 头部标题区域 */}
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <User className="text-primary w-5 h-5" />
        <h1 className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-heading">
          博主个人公开资料设置
        </h1>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-semibold">
          HOME PROFILE
        </span>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* 左侧：头像上传与配置 */}
        <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col items-center gap-4">
          <label className="text-xs font-heading font-medium text-zinc-500 self-start">
            头像配置 (方形比例)
          </label>
          <div
            onClick={handleAvatarClick}
            className="relative w-40 h-40 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/30 overflow-hidden cursor-pointer group hover:shadow-md transition-all flex items-center justify-center"
            title="点击更换头像"
          >
            {avatarUrl ? (
              <img
                src={resolveUrl(avatarUrl)}
                alt="头像预览"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                <User size={32} />
                <span className="text-[9px]">暂无头像</span>
              </div>
            )}

            {/* Hover 替换遮罩层 */}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white">
              <Upload size={18} />
              <span className="text-[9px] font-heading font-medium">
                {uploading ? "上传中..." : "更换公开头像"}
              </span>
            </div>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
            支持 JPG, PNG, WEBP。建议使用 1:1 的方形个人二次元或个性头像，展示效果最美。
          </span>
        </div>

        {/* 右侧：资料表单信息 */}
        <div className="md:col-span-2 flex flex-col gap-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          {/* 基本项：昵称 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" /> 昵称 (Nickname)
            </label>
            <input
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="您的公开展示昵称"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* 个性签名/技术栈 (bio) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Laptop size={13} className="text-primary" /> 技术栈简介 / 电子签名 (Bio)
            </label>
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="例如：Java/Kotlin + JavaScript/Typescript 全栈开发者"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* 详细自我介绍：第一行文案 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText size={13} className="text-primary" /> 详细介绍文案 (第一行)
            </label>
            <input
              value={introLine1}
              onChange={(e) => setIntroLine1(e.target.value)}
              placeholder="例如：🔥 大三前端探索者 | 写代码也写生活 | 开源项目复盘 ✨"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 h-9 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* 详细自我介绍：第二行文案 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-heading font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText size={13} className="text-primary" /> 详细介绍文案 (第二行)
            </label>
            <textarea
              value={introLine2}
              onChange={(e) => setIntroLine2(e.target.value)}
              placeholder="例如：欢迎来我的博客交流学习，一起成长进步，用代码碰撞灵感，一起走更远~"
              rows={2}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* 社交链接划分线 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 my-1 pt-4">
            <h3 className="text-xs font-heading font-bold text-zinc-900 dark:text-zinc-50 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              社交网络配置
            </h3>
            <div className="flex flex-col gap-3">
              {/* GitHub */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Github size={14} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="GitHub 个人主页链接"
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email 联系邮箱或 mailto 链接"
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* RSS */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Rss size={14} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <input
                  value={rss}
                  onChange={(e) => setRss(e.target.value)}
                  placeholder="RSS 订阅源路径或外部 URL"
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-white text-xs font-heading font-medium hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-98 cursor-pointer"
          >
            {saving ? (
              "保存中..."
            ) : (
              <>
                <Save size={13} /> 保存个人公开资料
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
