'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input, Textarea } from '@heroui/react'
import { Smile, Send, X, Globe, Mail, User } from 'lucide-react'

// 支持点击快捷输入的 Emoji 列表
const EMOJIS = ['😄', '🎉', '❤️', '👍', '🚀', '💻', '🤔', '👀', '🔥', '👏']

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
  
  // 提交态与提示
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)

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
    setContent(prev => prev + emoji)
    setShowEmoji(false)
  }

  // 3. 提交评论
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
      setErrorMsg('评论正文不能为空哦~')
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

        // 清空输入框内容
        setContent('')
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

  return (
    <form 
      onSubmit={handleSubmit}
      className={`w-full flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-300 ${
        parentId 
          ? 'bg-zinc-150/40 dark:bg-zinc-900/35 border-zinc-200/50 dark:border-zinc-800/50 mt-3 shadow-inner' 
          : 'bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border-zinc-200/60 dark:border-zinc-800/80 shadow-md shadow-zinc-200/20 dark:shadow-none'
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

      {/* 游客个人信息填写栅格（三列：昵称、邮箱、网址） */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          size="sm"
          placeholder="昵称 (必填)"
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
          startContent={<User size={13} className="text-zinc-400" />}
          classNames={{
            input: 'text-xs',
            inputWrapper: 'bg-zinc-100/50 dark:bg-zinc-950/30 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl'
          }}
          isRequired
          disabled={submitting}
        />
        <Input
          size="sm"
          type="email"
          placeholder="邮箱 (必填，头像拉取)"
          value={visitorEmail}
          onChange={(e) => setVisitorEmail(e.target.value)}
          startContent={<Mail size={13} className="text-zinc-400" />}
          classNames={{
            input: 'text-xs',
            inputWrapper: 'bg-zinc-100/50 dark:bg-zinc-950/30 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl'
          }}
          isRequired
          disabled={submitting}
        />
        <Input
          size="sm"
          placeholder="网站 (选填，https://)"
          value={visitorWebsite}
          onChange={(e) => setVisitorWebsite(e.target.value)}
          startContent={<Globe size={13} className="text-zinc-400" />}
          classNames={{
            input: 'text-xs',
            inputWrapper: 'bg-zinc-100/50 dark:bg-zinc-950/30 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl'
          }}
          disabled={submitting}
        />
      </div>

      {/* 文本输入框 */}
      <div className="relative">
        <Textarea
          placeholder="既然来了，就留下你的真知灼见吧... (支持换行，遵从网络文明准则)"
          minRows={3}
          maxRows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          classNames={{
            input: 'text-xs leading-relaxed',
            inputWrapper: 'bg-zinc-100/50 dark:bg-zinc-950/30 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl p-3'
          }}
          maxLength={1000}
          isRequired
          disabled={submitting}
        />
      </div>

      {/* 底部功能栏 (错误提示 + 表情选择 + 提交) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-1.5">
        {/* 左侧错误提醒 */}
        <div className="flex-1 min-w-0">
          {errorMsg && (
            <span className="text-[11px] font-mono font-medium text-rose-500 animate-headShake dark:text-rose-400 block truncate">
              ⚠️ {errorMsg}
            </span>
          )}
        </div>

        {/* 右侧交互按钮 */}
        <div className="flex items-center gap-2.5 relative select-none">
          {/* 表情按钮 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/60 hover:border-[#727BBA]/40 bg-zinc-100/30 dark:bg-zinc-950/20 text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA] transition-colors cursor-pointer"
              title="插入表情"
              disabled={submitting}
            >
              <Smile size={15} />
            </button>

            {/* Emoji 漂浮小面板 */}
            {showEmoji && (
              <div className="absolute bottom-10 right-0 z-30 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl grid grid-cols-5 gap-1.5 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150">
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

          <Button
            type="submit"
            size="sm"
            isLoading={submitting}
            className="bg-[#727BBA] hover:bg-[#5E67A3] text-white font-heading font-bold rounded-xl px-4 flex items-center gap-1.5 shadow-md shadow-[#727BBA]/15 dark:shadow-none transition-all duration-300 cursor-pointer"
          >
            {!submitting && <Send size={12} />}
            <span>{parentId ? '回复' : '发表评论'}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
