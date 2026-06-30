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
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import { fetchProfile } from '@/lib/profile'
import { applyFriendLink } from '@/lib/friend-api'
import { resolveImageUrl } from '@/lib/image-url'
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
  const [error, setError] = useState('')

  // 复制状态
  const [copied, setCopied] = useState(false)

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
        console.error('加载数据失败:', err)
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
    setError('')

    if (!formData.name || !formData.url || !formData.description || !formData.email) {
      setError('请填写所有必填项')
      return
    }

    setSubmitting(true)
    try {
      await applyFriendLink(formData)
      setSubmitted(true)
    } catch (err) {
      console.error('提交失败:', err)
      setError('提交失败，请稍后重试')
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
      setError('复制失败，请手动选择文本复制')
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
      <div className="min-h-screen bg-[#f6f6f6] dark:bg-zinc-950 font-body text-zinc-900 dark:text-zinc-50 transition-colors">
        <Navbar profile={null} />
        <div className="flex items-center justify-center py-32" role="status" aria-label="加载中">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#727BBA] border-t-transparent" />
        </div>
      </div>
    )
  }

  // 提交成功状态
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] dark:bg-zinc-950 font-body text-zinc-900 dark:text-zinc-50 transition-colors">
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
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-zinc-950 font-body text-zinc-900 dark:text-zinc-50 transition-colors">
      <Navbar profile={profile} />

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
            className="apply-form lg:col-span-3 space-y-7"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="头像 URL" hint="选填，建议方形图">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className={inputCls}
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

            {/* 错误提示 */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 提交栏 */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#727BBA] hover:bg-[#6873B0] text-white text-sm font-heading font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    提交中…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    提交申请
                  </>
                )}
              </button>
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
            {/* 效果预览：使用友链目录的行样式 */}
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 p-3.5">
              <div className="flex items-center justify-between mb-3">
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

              {/* 预览行：复用 FriendLinks 的行样式语言 */}
              <div className="flex items-center gap-3 py-2 px-1.5 -mx-1.5 rounded-lg">
                <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {previewFriend.avatarUrl ? (
                    <img
                      src={resolveImageUrl(previewFriend.avatarUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                      {(previewFriend.name || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: previewCategory?.color || '#727BBA' }}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {previewFriend.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {previewFriend.description}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                  <Globe size={10} />
                  {previewDomain}
                </span>
                <span
                  className="shrink-0 w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400"
                  aria-hidden="true"
                >
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>

            {/* 本站友链信息：方便互贴 */}
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 p-3.5">
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

            {/* 申请须知：轻量内联提示，替代旧版大块琥珀色警示 */}
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 p-3.5">
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
