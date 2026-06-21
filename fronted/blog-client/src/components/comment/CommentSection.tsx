'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Heart, CornerDownRight, CheckCircle, Monitor, ShieldAlert, Pin } from 'lucide-react'
import { Spinner } from '@heroui/react'
import { marked } from 'marked'
import CommentForm from './CommentForm'
import HtmlRenderer from '@/components/common/HtmlRenderer'
import { resolveImageUrl } from '@/lib/image-url'

interface CommentVO {
  id: number
  articleId: number
  parentId: number | null
  userId: number | null
  nickname: string
  avatarUrl: string
  visitorWebsite: string | null
  content: string
  likeCount: number
  isAuthorReplied: boolean
  isAuthor?: boolean | null
  isPinned?: boolean | null
  replyTo: string | null
  status?: string | null
  createdAt: string
  userAgent?: string | null
  replies: CommentVO[]
}

interface CommentSectionProps {
  articleId: number
  isAllowComment?: boolean
}

// 1. 极其轻量的 UA 操作系统/浏览器解析器，无需引入额外三方依赖，性能极高
const parseUA = (uaString: string | null | undefined) => {
  if (!uaString) return null
  const ua = uaString.toLowerCase()
  
  let os = 'Other'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('macintosh') || ua.includes('mac os x') || ua.includes('mac os')) os = 'macOS'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'iOS'
  else if (ua.includes('linux')) os = 'Linux'
  
  let browser = 'Web'
  if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('chrome') && !ua.includes('safari')) browser = 'Chrome'
  else if (ua.includes('safari') && ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera'
  
  return `${os} · ${browser}`
}

// 站长打勾大V认证徽章组件
const VerifiedBadge = ({ type }: { type: 'admin' | 'author' }) => {
  const color = type === 'admin' ? '#1d9bf0' : '#10b981'; // 亮蓝色为站长/管理员，绿色为文章作者
  const text = type === 'admin' ? '这位是本站的主人呀' : '这位是本文的作者呀';
  return (
    <span className="relative group inline-block select-none ml-1 cursor-default">
      {/* 悬停精美 Tooltip 浮层 */}
      <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-max opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 pointer-events-none bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-sans font-bold leading-none tracking-wide text-center">
        <span>{text}</span>
        {/* 气泡指向小尖角 (与气泡底色及暗色模式完美融合的白色/深色尖角) */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[4px] border-transparent border-t-white dark:border-t-zinc-900 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]"></span>
      </span>
      <svg 
        viewBox="0 0 24 24" 
        className="w-3.5 h-3.5 shrink-0 inline-block align-middle" 
        aria-hidden="true" 
        style={{ verticalAlign: 'sub', fill: color }}
      >
        <g>
          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.015 3.422-2.27c.407.17.867.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.03l-3.85-3.85 1.43-1.4 2.42 2.42 6.25-6.25 1.43 1.42-7.68 7.66z" />
        </g>
      </svg>
    </span>
  );
};

export default function CommentSection({
  articleId,
  isAllowComment = true
}: CommentSectionProps) {
  // 评论数据与加载态
  const [comments, setComments] = useState<CommentVO[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // 局部交互状态
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  // API 根路径
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

  // 1. 获取评论列表并递归计算总数
  const fetchComments = async () => {
    try {
      let name = ''
      let email = ''
      try {
        name = localStorage.getItem('comment_visitor_name') || ''
        email = localStorage.getItem('comment_visitor_email') || ''
      } catch (e) {
        console.warn('读取 localStorage 缓存的游客资料失败', e)
      }

      const params = new URLSearchParams()
      if (name) params.append('viewerName', name)
      if (email) params.append('viewerEmail', email)
      const queryString = params.toString() ? `?${params.toString()}` : ''

      const res = await fetch(`${API_BASE}/articles/${articleId}/comments${queryString}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP_${res.status}`)
      
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        const fetched = json.data || []
        setComments(fetched)
        
        let count = fetched.length
        fetched.forEach((c: CommentVO) => {
          count += (c.replies || []).length
        })
        setTotalCount(count)
      }
    } catch (err) {
      console.warn('拉取评论数据列表失败，启用优雅兜底降级为空列表显示：', err)
      setComments([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (articleId) {
      fetchComments()
    }
  }, [articleId])

  // 2. 点赞处理，配合弹性脉冲动效状态
  const handleLike = async (commentId: number) => {
    if (likedIds.has(commentId)) return

    setLikedIds(prev => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })

    const updateLikesInTree = (list: CommentVO[]): CommentVO[] => {
      return list.map(c => {
        if (c.id === commentId) {
          return { ...c, likeCount: c.likeCount + 1 }
        } else if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateLikesInTree(c.replies) }
        }
        return c
      })
    }
    setComments(prev => updateLikesInTree(prev))

    try {
      await fetch(`${API_BASE}/comments/${commentId}/like`, {
        method: 'POST'
      })
    } catch (err) {
      console.error('评论点赞 API 请求异常', err)
    }
  }

  // 3. 提交成功逻辑
  const handleCommentSuccess = (newComment: any) => {
    setActiveReplyId(null)
    fetchComments()
  }

  // 人性化时间格式化
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return isoString
    }
  }

  // 极轻量级、无依赖的前端 HTML XSS 注入净化过滤器，拦截危险标签、事件和伪协议
  const sanitizeCommentHtml = (htmlStr: string): string => {
    if (!htmlStr) return ''
    return htmlStr
      // 1. 移去 <script> 标签及其中间的内容
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // 2. 移去 <iframe>, <object>, <embed>, <form>, <style>, <link>, <meta> 标签及其中间内容
      .replace(/<(iframe|object|embed|form|link|meta|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '')
      .replace(/<(iframe|object|embed|form|link|meta|style)\b[^>]*>/gi, '')
      // 3. 移去任何 on 开头的事件属性，例如 onload, onerror, onclick
      .replace(/\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
      // 4. 移去 javascript: 伪协议链接，例如 href="javascript:..."
      .replace(/\bhref\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+)/gi, 'href="#"')
      // 5. 移去 src="javascript:..." 伪协议
      .replace(/\bsrc\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+)/gi, 'src=""')
  }

  // 计算 Markdown 解析 HTML，并全数通过 XSS 过滤器进行安全净化
  const getCommentHtml = (contentStr: string) => {
    if (!contentStr) return ''
    try {
      const rawHtml = marked.parse(contentStr) as string
      return sanitizeCommentHtml(rawHtml)
    } catch {
      return sanitizeCommentHtml(contentStr)
    }
  }

  return (
    <div id="comments-section" className="w-full flex flex-col gap-6 mt-16 animate-detail-item opacity-0">
      {/* 评论区头部设计：融合大厂极简划线风格 */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-950/60 pb-3 mb-2 select-none">
        <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={16} className="text-[#727BBA]" />
          <span>交流讨论</span>
          <span className="text-[10px] font-mono font-bold bg-[#727BBA]/10 text-[#727BBA] dark:text-[#8E97D5] px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        </h3>
        {!isAllowComment && (
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-650 flex items-center gap-1">
            <ShieldAlert size={12} />
            评论关闭
          </span>
        )}
      </div>

      {/* 发表一级评论 */}
      {isAllowComment ? (
        <CommentForm 
          articleId={articleId}
          onSuccess={handleCommentSuccess}
        />
      ) : (
        <div className="p-5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950/10 text-center text-xs text-zinc-400 dark:text-zinc-500 font-serif select-none">
          博主已关闭了本文的评论功能，享受纯粹静默阅读。
        </div>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 select-none">
          <Spinner size="sm" color="accent" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wider">正在投递讨论列表...</span>
        </div>
      ) : comments.length === 0 ? (
        /* 优雅极简空状态 */
        <div className="py-12 flex flex-col items-center justify-center text-center select-none">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-serif italic mb-1">这里依然寂静无声</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600">留下你的第一笔回响，划破这片寂静吧~</p>
        </div>
      ) : (
        /* 二级嵌套树形列表 */
        <div className="flex flex-col gap-6">
          {comments.map((comment, idx) => (
            <div 
              key={comment.id}
              className="group relative flex gap-4 py-5 border-b border-zinc-200/45 dark:border-zinc-900/50 last:border-b-0 transition-all duration-300"
            >
              {/* 一级头像 */}
              <div className="flex-shrink-0 select-none relative">
                <img
                  src={resolveImageUrl(comment.avatarUrl)}
                  alt={comment.nickname}
                  className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border shadow-inner ${
                    comment.userId
                      ? 'border-[#727BBA]/50 ring-1 ring-[#727BBA]/20'
                      : comment.isAuthor
                      ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                      : 'border-zinc-200/50 dark:border-zinc-850'
                  }`}
                  loading="lazy"
                />
              </div>

              {/* 评论核心区 */}
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                {/* 顶部元数据：昵称、博主徽章、发布时间与楼层 */}
                <div className="flex items-center justify-between gap-3 select-none">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    {comment.visitorWebsite ? (
                      <a 
                        href={comment.visitorWebsite.startsWith('http') ? comment.visitorWebsite : `https://${comment.visitorWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow ugc"
                        className="text-xs font-heading font-extrabold text-zinc-700 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#8E97D5] transition-colors truncate hover:underline flex items-center"
                      >
                        <span>{comment.nickname}</span>
                      </a>
                    ) : (
                      <span className="text-xs font-heading font-extrabold text-zinc-700 dark:text-zinc-350 truncate flex items-center">
                        <span>{comment.nickname}</span>
                      </span>
                    )}
                    {comment.userId ? (
                      <VerifiedBadge type="admin" />
                    ) : comment.isAuthor ? (
                      <VerifiedBadge type="author" />
                    ) : null}
                    {comment.status === 'PENDING' && (
                      <span className="bg-amber-100/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium select-none ml-1 shrink-0 animate-pulse">
                        待审核，仅自己可见
                      </span>
                    )}
                    {comment.status === 'SPAM' && (
                      <span className="bg-amber-100/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium select-none ml-1 shrink-0">
                        未通过，仅自己可见
                      </span>
                    )}
                  </div>

                  {/* 楼层与相对发布时间 */}
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 flex items-center gap-2 flex-shrink-0">
                    {comment.isPinned && (
                      <span className="flex items-center gap-0.5 text-rose-500 font-bold select-none border border-rose-200/50 dark:border-rose-950/50 bg-rose-50/80 dark:bg-rose-950/20 px-1 py-0.5 rounded text-[9px] shrink-0 animate-fade-in">
                        <Pin size={8} className="rotate-45" />
                        <span>置顶</span>
                      </span>
                    )}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-350 dark:text-zinc-700 select-none">
                      #{idx + 1} 楼
                    </span>
                    <span>{formatTime(comment.createdAt)}</span>
                  </span>
                </div>

                {/* 评论 Markdown 正文渲染区 */}
                <div className="text-xs font-serif text-zinc-700 dark:text-zinc-300 leading-relaxed break-words whitespace-normal select-text">
                  <HtmlRenderer html={getCommentHtml(comment.content)} proseClass="comment-content-prose" />
                </div>

                {/* 元数据及 UA 浏览器标识 + 操作行 */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-550 select-none">
                  {/* 点赞与回复功能键 */}
                  {isAllowComment && (
                    <div className="flex items-center gap-4">
                      {/* 点赞 */}
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                          likedIds.has(comment.id)
                            ? 'text-rose-500 font-extrabold'
                            : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart 
                          size={11} 
                          fill={likedIds.has(comment.id) ? 'currentColor' : 'none'} 
                          className={`transition-transform duration-200 ${likedIds.has(comment.id) ? 'scale-120 animate-pulse' : 'hover:scale-110'}`} 
                        />
                        <span>{comment.likeCount}</span>
                      </button>

                      {/* 回复 */}
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className={`flex items-center gap-0.5 font-bold cursor-pointer transition-colors ${
                          activeReplyId === comment.id
                            ? 'text-[#727BBA] dark:text-[#8E97D5]'
                            : 'hover:text-[#727BBA]'
                        }`}
                      >
                        <CornerDownRight size={11} />
                        <span>回复</span>
                      </button>
                    </div>
                  )}

                  {/* UA 浏览器 & 系统标识 */}
                  {comment.userAgent && !comment.isAuthor && (
                    <span className="flex items-center gap-1.5 opacity-85 text-[9px]">
                      <Monitor size={10} strokeWidth={1.5} />
                      <span>{parseUA(comment.userAgent)}</span>
                    </span>
                  )}
                </div>

                {/* 局部嵌入式回复表单 */}
                {activeReplyId === comment.id && (
                  <div className="w-full mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <CommentForm
                      articleId={articleId}
                      parentId={comment.id}
                      replyToName={comment.nickname}
                      onSuccess={handleCommentSuccess}
                      onCancel={() => setActiveReplyId(null)}
                    />
                  </div>
                )}

                {/* 二级回复楼层列表：左侧细腻淡淡线条点缀 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-5 flex flex-col gap-4 border-l border-zinc-200/50 dark:border-zinc-800/80 pl-5">
                    {comment.replies.map((reply) => (
                      <div 
                        key={reply.id}
                        className="group/reply flex gap-3.5 text-xs"
                      >
                        {/* 二级头像 */}
                        <div className="flex-shrink-0 select-none relative">
                          <img
                            src={resolveImageUrl(reply.avatarUrl)}
                            alt={reply.nickname}
                            className={`w-8 h-8 rounded-full bg-zinc-155 dark:bg-zinc-900 border shadow-inner ${
                              reply.userId
                                ? 'border-[#727BBA]/50 ring-1 ring-[#727BBA]/20'
                                : reply.isAuthor
                                ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                                : 'border-zinc-200/40 dark:border-zinc-850'
                            }`}
                            loading="lazy"
                          />
                        </div>

                        {/* 二级评论区 */}
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          {/* 二级头部 */}
                          <div className="flex items-center justify-between gap-2.5 select-none">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              {reply.visitorWebsite ? (
                                <a 
                                  href={reply.visitorWebsite.startsWith('http') ? reply.visitorWebsite : `https://${reply.visitorWebsite}`}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow ugc"
                                  className="font-heading font-extrabold text-zinc-700 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#8E97D5] transition-colors truncate hover:underline flex items-center"
                                >
                                  <span>{reply.nickname}</span>
                                </a>
                              ) : (
                                <span className="font-heading font-extrabold text-zinc-700 dark:text-zinc-350 truncate flex items-center">
                                  <span>{reply.nickname}</span>
                                </span>
                              )}
                              {reply.userId ? (
                                <VerifiedBadge type="admin" />
                              ) : reply.isAuthor ? (
                                <VerifiedBadge type="author" />
                              ) : null}
                              {reply.status === 'PENDING' && (
                                <span className="bg-amber-100/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium select-none ml-1 shrink-0 animate-pulse">
                                  待审核，仅自己可见
                                </span>
                              )}
                              {reply.status === 'SPAM' && (
                                <span className="bg-amber-100/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium select-none ml-1 shrink-0">
                                  未通过，仅自己可见
                                </span>
                              )}

                              {/* 回复某人标识 */}
                              {reply.replyTo && (
                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 select-none">
                                  回复 <span className="text-zinc-500 dark:text-zinc-400 font-medium">@{reply.replyTo}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>

                          {/* 二级正文 Markdown */}
                          <div className="font-serif text-zinc-650 dark:text-zinc-350 leading-relaxed break-words whitespace-normal select-text">
                            <HtmlRenderer html={getCommentHtml(reply.content)} proseClass="comment-content-prose" />
                          </div>

                          {/* 二级底部及 UA/功能行 */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono text-zinc-400 dark:text-zinc-550 select-none">
                            {isAllowComment && (
                              <div className="flex items-center gap-4">
                                {/* 点赞 */}
                                <button
                                  onClick={() => handleLike(reply.id)}
                                  className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                                    likedIds.has(reply.id)
                                      ? 'text-rose-500 font-extrabold'
                                      : 'hover:text-rose-500'
                                  }`}
                                >
                                  <Heart 
                                    size={10} 
                                    fill={likedIds.has(reply.id) ? 'currentColor' : 'none'} 
                                    className={likedIds.has(reply.id) ? 'scale-115 text-rose-500' : ''} 
                                  />
                                  <span>{reply.likeCount}</span>
                                </button>

                                {/* 回复 */}
                                <button
                                  onClick={() => setActiveReplyId(activeReplyId === reply.id ? null : reply.id)}
                                  className={`flex items-center gap-0.5 font-bold cursor-pointer transition-colors ${
                                    activeReplyId === reply.id
                                      ? 'text-[#727BBA] dark:text-[#8E97D5]'
                                      : 'hover:text-[#727BBA]'
                                  }`}
                                >
                                  <CornerDownRight size={10} />
                                  <span>回复</span>
                                </button>
                              </div>
                            )}

                            {/* UA 浏览器 & 系统标识 */}
                            {reply.userAgent && !reply.isAuthor && (
                              <span className="flex items-center gap-1 opacity-80 text-[8px] scale-95 origin-right">
                                <Monitor size={9} strokeWidth={1.5} />
                                <span>{parseUA(reply.userAgent)}</span>
                              </span>
                            )}
                          </div>

                          {/* 回复二级的局部输入框 (始终挂载于顶级 parentId 下维持盖楼大体结构) */}
                          {activeReplyId === reply.id && (
                            <div className="w-full mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                              <CommentForm
                                articleId={articleId}
                                parentId={comment.id}
                                replyToName={reply.nickname}
                                onSuccess={handleCommentSuccess}
                                onCancel={() => setActiveReplyId(null)}
                              />
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
