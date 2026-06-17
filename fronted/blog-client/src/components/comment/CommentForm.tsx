'use client'

import React, { useState, useEffect } from 'react'
import { Button, TextArea } from '@heroui/react'
import { Smile, Send, X, Globe, Mail, User, Eye, Edit2 } from 'lucide-react'
import { marked } from 'marked'
import HtmlRenderer from '@/components/common/HtmlRenderer'

// 支持点击快捷输入的 Emoji 列表
const EMOJIS = ['😄', '🎉', '❤️', '👍', '🚀', '💻', '🤔', '👀', '🔥', '👏']
const CONTENT_MAX_LENGTH = 500 // 限制评论最大字数

interface CommentFormProps {
  articleId: number
  parentId?: number | null
  replyToName?: string | null
  onSuccess: (newComment: any) => void
  onCancel?: () => void
}

export default function CommentForm({
  articleId,
  parentId = null,
  replyToName = null,
  onSuccess,
  onCancel
}: CommentFormProps) {
  // 游客基础信息状态
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [visitorWebsite, setVisitorWebsite] = useState('')
  const [content, setContent] = useState('')
  
  // 交互与显示模式状态
  const [previewMode, setPreviewMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  // 1. 组件挂载时自动从 localStorage 读取已保存的访客资料
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('comment_visitor_name')
      const savedEmail = localStorage.getItem('comment_visitor_email')
      const savedWebsite = localStorage.getItem('comment_visitor_website')
      
      if (savedName) setVisitorName(savedName)
      if (savedEmail) setVisitorEmail(savedEmail)
      if (savedWebsite) setVisitorWebsite(savedWebsite)
    } catch (e) {
      console.warn('读取 localStorage 缓存的游客资料失败', e)
    }
  }, [])

  // 2. 插入表情
  const handleInsertEmoji = (emoji: string) => {
    if (content.length + emoji.length > CONTENT_MAX_LENGTH) return
    setContent(prev => prev + emoji)
    setShowEmoji(false)
  }

  // 3. 清空草稿及确认状态逻辑
  const handleClearDraft = () => {
    setContent('')
    setConfirmClear(false)
    setErrorMsg(null)
  }

  // 4. 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // 前端严格校验
    if (!visitorName.trim()) {
      setErrorMsg('昵称是必填项哦~')
      return
    }
    if (!visitorEmail.trim()) {
      setErrorMsg('电子邮箱是必填项，用来拉取头像~')
      return
    }
    // 校验邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(visitorEmail.trim())) {
      setErrorMsg('请输入正确的电子邮箱格式~')
      return
    }
    if (!content.trim()) {
      setErrorMsg('评论正文内容不能为空~')
      return
    }
    if (content.length > CONTENT_MAX_LENGTH) {
      setErrorMsg(`评论内容不能超过 ${CONTENT_MAX_LENGTH} 个字~`)
      return
    }

    setSubmitting(true)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentId,
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim(),
          visitorWebsite: visitorWebsite.trim() || null,
          content: content.trim()
        })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.msg || `网络错误 (${res.status})`)
      }

      if (json.code === 200 || json.code === 0) {
        // 保存游客资料到本地 localStorage 供下一次自动回显
        try {
          localStorage.setItem('comment_visitor_name', visitorName.trim())
          localStorage.setItem('comment_visitor_email', visitorEmail.trim())
          localStorage.setItem('comment_visitor_website', visitorWebsite.trim())
        } catch (e) {
          console.warn('缓存游客资料到 localStorage 失败', e)
        }

        // 清空输入框内容与预览模式
        setContent('')
        setPreviewMode(false)
        setErrorMsg(null)
        
        // 成功回调
        onSuccess(json.data)
      } else {
        throw new Error(json.msg || '提交发表评论异常')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || '系统繁忙，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  // 计算预览模式下的 Markdown 解析 HTML
  const getPreviewHtml = () => {
    if (!content.trim()) return ''
    try {
      // marked 同步解析为 html
      return marked.parse(content) as string
    } catch {
      return content
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`w-full flex flex-col gap-5 p-6 rounded-2xl border transition-all duration-300 ${
        parentId 
          ? 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200/40 dark:border-zinc-800/40 mt-3 shadow-inner' 
          : 'bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 shadow-md shadow-zinc-200/10 dark:shadow-none'
      }`}
    >
      {/* 头部：若是回复别人，显示提示 */}
      {replyToName && (
        <div className="flex items-center justify-between text-xs font-mono font-medium text-[#727BBA] dark:text-[#8E97D5] border-b border-zinc-200/40 dark:border-zinc-800/40 pb-2 mb-1">
          <span className="flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#727BBA]"></span>
            回复 @{replyToName}
          </span>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <X size={12} />
              <span>取消回复</span>
            </button>
          )}
        </div>
      )}

      {/* 游客个人信息填写栅格（三列：昵称、邮箱、网址）- 重构为极简 underlined 下划线无框风格 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="relative flex items-center border-b border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-[#727BBA] dark:focus-within:border-[#8E97D5] transition-colors h-9 px-0 gap-2">
          <User size={13} className="text-zinc-400 dark:text-zinc-650 flex-shrink-0" />
          <input
            type="text"
            placeholder="称呼 *"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-serif text-zinc-700 dark:text-zinc-350 placeholder:text-zinc-350 dark:placeholder:text-zinc-650"
            required
            disabled={submitting}
          />
        </div>
        <div className="relative flex items-center border-b border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-[#727BBA] dark:focus-within:border-[#8E97D5] transition-colors h-9 px-0 gap-2">
          <Mail size={13} className="text-zinc-400 dark:text-zinc-650 flex-shrink-0" />
          <input
            type="email"
            placeholder="邮箱 (头像拉取) *"
            value={visitorEmail}
            onChange={(e) => setVisitorEmail(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-serif text-zinc-700 dark:text-zinc-350 placeholder:text-zinc-350 dark:placeholder:text-zinc-650"
            required
            disabled={submitting}
          />
        </div>
        <div className="relative flex items-center border-b border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-[#727BBA] dark:focus-within:border-[#8E97D5] transition-colors h-9 px-0 gap-2">
          <Globe size={13} className="text-zinc-400 dark:text-zinc-650 flex-shrink-0" />
          <input
            type="text"
            placeholder="个人主页 (https://)"
            value={visitorWebsite}
            onChange={(e) => setVisitorWebsite(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-serif text-zinc-700 dark:text-zinc-350 placeholder:text-zinc-350 dark:placeholder:text-zinc-650"
            disabled={submitting}
          />
        </div>
      </div>

      {/* 文本输入区上方增加：编辑/预览双模式切换小按钮 */}
      <div className="flex items-center gap-2 select-none text-[11px] font-serif">
        <button
          type="button"
          onClick={() => setPreviewMode(false)}
          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            !previewMode 
              ? 'bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Edit2 size={10} />
          <span>编辑</span>
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            previewMode 
              ? 'bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Eye size={10} />
          <span>预览</span>
        </button>
      </div>

      {/* 编辑/预览核心输入容器 */}
      {previewMode ? (
        <div className="min-h-[120px] rounded-xl border border-zinc-250/30 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 select-text overflow-y-auto">
          {content.trim() ? (
            <HtmlRenderer html={getPreviewHtml()} />
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600 italic">暂无预览内容，输入一些 Markdown 文字试试吧...</span>
          )}
        </div>
      ) : (
        <div className="relative">
          <TextArea
            placeholder="在此留下您的思绪... (支持 Markdown 语法)"
            minRows={4}
            maxRows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            classNames={{
              input: 'text-xs leading-relaxed font-sans',
              inputWrapper: 'bg-zinc-100/50 dark:bg-zinc-950/25 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl p-4 transition-colors focus-within:!border-zinc-300 dark:focus-within:!border-zinc-700'
            }}
            maxLength={CONTENT_MAX_LENGTH}
            isRequired
            disabled={submitting}
          />
        </div>
      )}

      {/* 底部辅助面板 (错误提示 + 表情/清空草稿 + 提交按钮) */}
      <div className="flex flex-col gap-3">
        {errorMsg && (
          <span className="text-[11px] font-mono font-medium text-rose-500 animate-headShake dark:text-rose-400 block truncate">
            ⚠️ {errorMsg}
          </span>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          {/* 左侧说明及清空草稿 */}
          <div className="flex flex-col items-start gap-1 text-[10px] font-serif tracking-wide text-zinc-400 dark:text-zinc-550 select-none">
            <div className="flex items-center gap-3">
              {/* 表情按钮 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/60 hover:border-[#727BBA]/40 bg-zinc-100/30 dark:bg-zinc-950/20 text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA] transition-colors cursor-pointer"
                  title="插入表情"
                  disabled={submitting}
                >
                  <Smile size={14} />
                </button>

                {/* Emoji 漂浮小面板 */}
                {showEmoji && (
                  <div className="absolute bottom-9 left-0 z-30 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl grid grid-cols-5 gap-1.5 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => handleInsertEmoji(e)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm cursor-pointer transition-colors"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 清空草稿 (带防误触确认) */}
              {confirmClear ? (
                <span className="flex items-center gap-1.5 text-[9px]">
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-rose-500 hover:text-rose-600 transition-colors font-bold cursor-pointer"
                  >
                    确认清空
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-800">/</span>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-400 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                </span>
              ) : (
                content.trim() && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-[10px] text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    清空草稿
                  </button>
                )
              )}
            </div>

            <div className="mt-1 font-mono text-[9px] scale-95 origin-left">
              支持 Markdown 语法，Ctrl + Enter 换行
            </div>
          </div>

          {/* 右侧字数与提交按钮 */}
          <div className="flex items-center gap-3.5 select-none">
            {/* 字数计数 */}
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550">
              {content.length}/{CONTENT_MAX_LENGTH}
            </span>

            {/* 大厂极简黑色投递按钮 */}
            <Button
              type="submit"
              size="sm"
              isLoading={submitting}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-heading font-extrabold rounded-xl px-5 flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <span>{submitting ? '投递中...' : '投递'}</span>
              {!submitting && <Send size={11} />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
