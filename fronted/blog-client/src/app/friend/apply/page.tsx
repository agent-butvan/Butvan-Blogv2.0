'use client'

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Globe,
  Copy,
  Check,
  Info,
  Upload,
  X,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import { toast, Avatar, Button, Spinner, Tooltip, cn } from '@heroui/react'
import { fetchProfile } from '@/lib/profile'
import { applyFriendLink, uploadPublicImage, fetchWebMeta } from '@/lib/friend-api'
import { resolveImageUrl, getBackendHost } from '@/lib/image-url'
import { handleError, AppError } from '@/lib/error-handler'
import type { ProfileVO } from '@/types/profile'
import { FRIEND_CATEGORIES } from '@/types/friend'
import gsap from 'gsap'

/** 简介与备注的最大字数约束 */
const DESC_MAX = 40
const REMARK_MAX = 120

/**
 * 申请友链页面
 *
 * 设计语言：静谧深海（Quiet Deep Sea）—— 与 /friend 友链目录页保持一致。
 * - 背景 `#f6f6f6` / `zinc-950`，主色 `#727BBA`，CTA 绿 `#09B38A`
 * - 编辑式分栏布局（无重阴影卡片），左栏表单 + 右栏粘性预览/回贴信息
 * - 实时预览：按友链目录的行样式呈现申请人填写中的站点
 * - 本站友链信息：方便申请方互贴
 */
export default function FriendApplyPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 复制状态
  const [copied, setCopied] = useState(false)

  // 头像上传状态
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  // URL 自动抓取状态
  const [fetchingMeta, setFetchingMeta] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    avatarUrl: '',
    description: '',
    category: 'TECH',
    email: '',
    remark: '',
  })

  // 当前站点地址（用于「我的友链信息」互贴）
  // 使用 useSyncExternalStore 读取 client-only 的 window.location.origin，
  // 服务端与首次 hydration 统一返回空串，避免 hydration mismatch 与 effect 内 setState。
  const siteOrigin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => '',
  )

  // 加载博主资料
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await fetchProfile('butvan')
        setProfile(profileData)
      } catch (err) {
        handleError(err, { silent: true, fallbackMessage: '加载资料失败' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 页面入场动画：沿用友链目录页的交错节拍
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.apply-hero',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      )
      gsap.fromTo(
        '.apply-form',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power2.out' },
      )
      gsap.fromTo(
        '.apply-aside',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' },
      )
    })
    return () => ctx.revert()
  }, [])

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.url || !formData.description || !formData.email) {
      toast.danger('请填写所有必填项')
      return
    }

    setSubmitting(true)
    try {
      await applyFriendLink(formData)
      setSubmitted(true)
    } catch (err) {
      handleError(err, { fallbackMessage: '提交失败，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  // 复制本站友链信息到剪贴板
  const handleCopySiteInfo = async () => {
    const text = [
      `博客名称：${profile?.nickname || 'Butvan Blog'}`,
      `博客地址：${siteOrigin}`,
      `博客简介：${profile?.bio || '但行好事，莫问前程。'}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 降级：选中文本兜底
      toast.danger('复制失败，请手动选择文本复制')
    }
  }

  // 处理头像文件上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.danger('只支持图片格式（JPG、PNG、GIF、WebP）')
      return
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.danger('图片大小不能超过 5MB')
      return
    }

    setUploadingAvatar(true)

    try {
      // 生成预览 URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      // 上传图片到服务器
      const relativePath = await uploadPublicImage(file)
      
      // 更新表单数据（拼接完整 URL，uploads 静态资源不在 /api 路径下）
      const staticBase = getBackendHost()
      const fullUrl = `${staticBase}${relativePath}`
      setFormData({ ...formData, avatarUrl: fullUrl })
      
      toast.success('头像上传成功')
    } catch (err) {
      handleError(err, { fallbackMessage: '上传失败，请稍后重试' })
      setAvatarPreview('')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // 清除头像
  const handleClearAvatar = () => {
    setFormData({ ...formData, avatarUrl: '' })
    setAvatarPreview('')
  }

  // URL 自动抓取网站元数据
  const handleFetchMeta = async () => {
    if (!formData.url) {
      toast.danger('请先输入博客地址')
      return
    }

    setFetchingMeta(true)
    try {
      const meta = await fetchWebMeta(formData.url)

      if (meta.success) {
        // 自动填充表单
        setFormData({
          ...formData,
          name: meta.title || formData.name,
          description: meta.description || formData.description,
          avatarUrl: meta.faviconUrl || formData.avatarUrl,
        })
        toast.success('已自动抓取网站信息，请核对后提交')
      } else {
        toast.warning(meta.errorMsg || '无法抓取该网站信息，请手动填写')
      }
    } catch (err) {
      handleError(err, { fallbackMessage: '抓取失败，请稍后重试' })
    } finally {
      setFetchingMeta(false)
    }
  }

  // 实时预览的友链行数据
  const previewFriend = useMemo(
    () => ({
      id: 0,
      name: formData.name || '你的博客名称',
      url: formData.url || 'https://example.com',
      avatarUrl: formData.avatarUrl || null,
      description: formData.description || '一句话介绍你的博客',
      category: formData.category,
    }),
    [formData],
  )

  // 预览所属分类的颜色点
  const previewCategory = FRIEND_CATEGORIES.find((c) => c.value === previewFriend.category)
  const previewDomain = (() => {
    try {
      return new URL(previewFriend.url).hostname.replace(/^www\./, '')
    } catch {
      return previewFriend.url
    }
  })()

  // 加载中状态：与全站一致的紧凑 spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
        <Navbar profile={null} />
        <div className="flex items-center justify-center py-32" role="status" aria-label="加载中">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  // 提交成功状态
  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
        <Navbar profile={profile} />
        <div className="pt-20 pb-16 px-4">
          <div className="apply-hero max-w-md mx-auto text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#09B38A]/10 text-[#09B38A] mb-5">
              <CheckCircle size={22} />
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-bold tracking-tight mb-2">
              申请已提交
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-7">
              感谢你的申请。博主会尽快审核，审核通过后你的站点将出现在友链目录中。
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/friend"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#727BBA] hover:bg-[#6873B0] text-white text-sm font-heading font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                返回友链目录
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 text-sm font-heading font-medium transition-colors cursor-pointer"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 表单主视图
  return (
    <div className="min-h-screen bg-transparent font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

      {/* 左侧悬浮侧挂导航 */}
      <SidebarWidget />

      {/* Hero 区域：与友链目录页统一节奏 */}
      <section className="apply-hero pt-16 md:pt-20 pb-5 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/friend"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft size={13} />
            返回友链目录
          </Link>

          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#727BBA]/10 text-[#727BBA]">
              <Sparkles size={15} />
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
              申请友链
            </h1>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 translate-y-0.5">
              apply
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            填写下方信息提交申请。建议先在右下角复制本站友链信息贴到你的站点，我们会在审核通过后将你加入目录。
          </p>
        </div>
      </section>

      {/* 主体：左表单 + 右粘性信息栏 */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* 左栏：编辑式表单（无重卡片） */}
          <form
            onSubmit={handleSubmit}
            className="apply-form lg:col-span-3 space-y-6"
            noValidate
          >
            {/* 分组：站点信息 */}
            <fieldset className="space-y-3.5">
              <div className="flex items-baseline gap-2.5 pb-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#727BBA]" aria-hidden="true" />
                <h2 className="font-heading font-semibold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
                  站点信息
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                  01
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="博客名称" required>
                  <input
                    type="text"
                    placeholder="例如：Butvan Blog"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field label="博客地址" required>
                  <div className="relative flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className={`${inputCls} pr-24`}
                    />
                    {/* 自动抓取按钮 */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      isPending={fetchingMeta}
                      onPress={handleFetchMeta}
                      className="absolute right-1 px-2 py-1 text-xs bg-[#727BBA]/10 hover:bg-[#727BBA]/20 text-[#727BBA] dark:text-[#727BBA] border-none rounded-md transition-colors whitespace-nowrap"
                    >
                      {fetchingMeta ? (
                        <span className="flex items-center gap-1">
                          <Spinner size="sm" color="current" />
                          抓取中
                        </span>
                      ) : (
                        '自动填充'
                      )}
                    </Button>
                  </div>
                </Field>
              </div>
              
              <Field label="头像" hint="选填，建议方形图">
                {/* 一体化上传区域 */}
                <div className="relative group">
                  {/* 头像预览区 - 作为可点击的上传触发器 */}
                  <label
                    className={cn(
                      'flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed',
                      'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900',
                      'cursor-pointer transition-all duration-200',
                      'hover:border-[#727BBA] hover:bg-[#727BBA]/5 dark:hover:bg-[#727BBA]/10',
                      uploadingAvatar && 'pointer-events-none opacity-60',
                    )}
                  >
                    {avatarPreview || formData.avatarUrl ? (
                      // 有头像时显示图片
                      <>
                        <Avatar className="w-full h-full rounded-lg">
                          <Avatar.Image
                            src={avatarPreview || resolveImageUrl(formData.avatarUrl)}
                            alt={formData.name || '头像'}
                          />
                          <Avatar.Fallback className="text-sm font-medium text-zinc-400">
                            {(formData.name || '?').charAt(0)}
                          </Avatar.Fallback>
                        </Avatar>
                        {/* Hover 遮罩提示更换 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                          <Upload size={20} className="text-white" />
                        </div>
                      </>
                    ) : (
                      // 无头像时显示占位符
                      <div className="flex flex-col items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                        <Upload size={24} />
                        <span className="text-xs">点击上传</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>

                  {/* 清除按钮（仅在已上传时显示） */}
                  {formData.avatarUrl && !uploadingAvatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={handleClearAvatar}
                      className="absolute -top-2 -right-2 z-10 w-7 h-7 p-0 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <X size={14} />
                    </Button>
                  )}

                  {/* 上传中状态覆盖层 */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-xl backdrop-blur-sm">
                      <Spinner size="md" />
                    </div>
                  )}
                </div>
              </Field>
            </fieldset>

            {/* 分组：分类与联系 */}
            <fieldset className="space-y-3.5">
              <div className="flex items-baseline gap-2.5 pb-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#09B38A]" aria-hidden="true" />
                <h2 className="font-heading font-semibold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
                  分类与联系
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                  02
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="分类" required>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                    >
                      {FRIEND_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      aria-hidden="true"
                    />
                  </div>
                </Field>

                <Field label="邮箱" required hint="不公开，仅用于联系">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
            </fieldset>

            {/* 分组：介绍与备注 */}
            <fieldset className="space-y-3.5">
              <div className="flex items-baseline gap-2.5 pb-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CDBDE8]" aria-hidden="true" />
                <h2 className="font-heading font-semibold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
                  介绍与备注
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                  03
                </span>
              </div>

              <Field
                label="简介"
                required
                counter={`${formData.description.length}/${DESC_MAX}`}
              >
                <textarea
                  placeholder="一句话介绍你的博客"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value.slice(0, DESC_MAX),
                    })
                  }
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field
                label="备注"
                hint="选填"
                counter={`${formData.remark.length}/${REMARK_MAX}`}
              >
                <textarea
                  placeholder="想对博主说的话…"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value.slice(0, REMARK_MAX) })
                  }
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </fieldset>

            {/* 提交栏 */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                isPending={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#727BBA] hover:bg-[#6873B0] text-white text-sm font-heading font-medium transition-colors"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner size="sm" color="current" /> : <Send size={14} />}
                    {isPending ? '提交中…' : '提交申请'}
                  </>
                )}
              </Button>
              <Link
                href="/friend"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 text-sm font-medium transition-colors cursor-pointer"
              >
                取消
              </Link>
            </div>
          </form>

          {/* 右栏：粘性预览与回贴信息 */}
          <aside className="apply-aside lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* 效果预览：参考图2风格，卡片式布局 */}
            <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Info size={12} className="text-zinc-400" />
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                    PREVIEW
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  审核通过后将如此展示
                </span>
              </div>

              {/* 新设计：卡片式友链预览（参考图2） */}
              <div className="group rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-[#727BBA]/30 dark:hover:border-[#727BBA]/30 transition-colors p-4">
                {/* 顶部：favicon + 域名 + 复制按钮 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Favicon */}
                    {previewFriend.avatarUrl ? (
                      <img
                        src={resolveImageUrl(previewFriend.avatarUrl)}
                        alt={previewFriend.name}
                        className="w-5 h-5 rounded-sm object-contain"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-sm bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <Globe size={12} className="text-zinc-400" />
                      </div>
                    )}
                    {/* 域名 */}
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                      {previewDomain}
                    </span>
                  </div>
                  {/* 复制按钮 */}
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="复制链接"
                  >
                    <Copy size={14} className="text-zinc-400 hover:text-[#727BBA]" />
                  </button>
                </div>

                {/* 标题 */}
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-snug">
                  {previewFriend.name || '你的博客名称'}
                </h3>

                {/* 描述 */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {previewFriend.description || '一句话介绍你的博客'}
                </p>

                {/* 底部装饰线 */}
                <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {previewCategory?.label || '技术'}
                  </span>
                  <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-[#727BBA] transition-colors" />
                </div>
              </div>
            </div>

            {/* 本站友链信息：无边框浅底，方便互贴 */}
            <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#09B38A]/10 text-[#09B38A]">
                    <Sparkles size={11} />
                  </span>
                  <span className="text-xs font-heading font-semibold text-zinc-900 dark:text-zinc-50">
                    本站友链信息
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySiteInfo}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>

              <dl className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="text-zinc-400 dark:text-zinc-500 shrink-0 w-16">名称</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300 truncate">
                    {profile?.nickname || 'Butvan Blog'}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-zinc-400 dark:text-zinc-500 shrink-0 w-16">地址</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300 truncate font-mono">
                    {siteOrigin || '—'}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-zinc-400 dark:text-zinc-500 shrink-0 w-16">简介</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                    {profile?.bio || '但行好事，莫问前程。'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 申请须知：紧凑内联提示 */}
            <div className="rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={12} className="text-amber-500" />
                <span className="text-xs font-heading font-semibold text-zinc-900 dark:text-zinc-50">
                  申请须知
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <li>· 请确保博客内容健康、积极，原创为主</li>
                <li>· 建议先添加本站链接，审核通过率更高</li>
                <li>· 审核结果将通过邮件告知</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer：与友链目录页统一 */}
      <footer className="py-6 text-center border-t border-zinc-200/50 dark:border-zinc-900/60">
        <div className="flex items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-xs">
          <ArrowLeft size={10} />
          <span>2026 Butvan Blog. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

/**
 * 表单输入框统一样式类
 * - 圆角 lg（8px）、细边框、聚焦时静海紫色描边 + 极淡光晕
 */
const inputCls =
  'w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#727BBA] focus:ring-2 focus:ring-[#727BBA]/15 focus:outline-none transition-colors'

/** 单个表单字段：标签 + 可选必填星标 / 提示 / 计数器 + 控件 */
function Field({
  label,
  required,
  hint,
  counter,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        {required && <span className="text-[#727BBA]">*</span>}
        {hint && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">（{hint}）</span>
        )}
        {counter && (
          <span className="ml-auto text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            {counter}
          </span>
        )}
      </span>
      {children}
    </label>
  )
}
