'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Heart, CornerDownRight, CheckCircle } from 'lucide-react'
import { Spinner } from '@heroui/react'
import CommentForm from './CommentForm'

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
  replyTo: string | null
  createdAt: string
  replies: CommentVO[]
}

interface CommentSectionProps {
  articleId: number
  isAllowComment?: boolean
}

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

  // 1. 获取评论列表
  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP_${res.status}`)
      
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        const fetched = json.data || []
        setComments(fetched)
        
        // 计算全部评论总数（包含顶级和所有子回复）
        let count = fetched.length
        fetched.forEach((c: CommentVO) => {
          count += (c.replies || []).length
        })
        setTotalCount(count)
      }
    } catch (err) {
      console.warn('获取真实评论接口不可用或失败，评论区展示为空列表。', err)
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

  // 2. 点赞处理
  const handleLike = async (commentId: number) => {
    if (likedIds.has(commentId)) return // 避免重复点赞

    // 本地即时更新状态以提升响应速度
    setLikedIds(prev => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })

    // 递归辅助器：更新评论树中的点赞数
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
      console.error('评论点赞失败', err)
    }
  }

  // 3. 一级/二级评论提交成功回调
  const handleCommentSuccess = (newComment: any) => {
    // 关闭回复框
    setActiveReplyId(null)
    // 重新拉取最新评论列表以防排序/数据不同步，顺便刷新总数
    fetchComments()
  }

  // 人性化时间格式化
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      // 1分钟内显示刚刚
      if (diff < 60000) return '刚刚'
      // 1小时内显示分钟数
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      // 24小时内显示小时数
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      // 超过1天显示常规日期
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return isoString
    }
  }

  return (
    <div id="comments-section" className="w-full flex flex-col gap-6 mt-12 animate-detail-item opacity-0">
      {/* 评论区头部标题 */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-900/60 pb-3">
        <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={18} className="text-[#727BBA]" />
          <span>交流讨论</span>
          <span className="text-xs font-mono font-bold bg-[#727BBA]/10 text-[#727BBA] dark:text-[#8E97D5] px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        </h3>
        {!isAllowComment && (
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            [ 评论已关闭 ]
          </span>
        )}
      </div>

      {/* 发表一级独立评论区 */}
      {isAllowComment ? (
        <CommentForm 
          articleId={articleId}
          onSuccess={handleCommentSuccess}
        />
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 text-center text-xs text-zinc-400 dark:text-zinc-500 font-serif">
          博主已关闭了本文的评论功能，静心阅读。
        </div>
      )}

      {/* 评论列表渲染层 */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Spinner size="sm" color="accent" />
          <span className="text-[11px] text-zinc-400 tracking-wider">正在拉取讨论列表...</span>
        </div>
      ) : comments.length === 0 ? (
        /* 空状态卡片 */
        <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-zinc-200/60 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-6">
          <MessageSquare size={32} className="text-zinc-300 dark:text-zinc-700 mb-2.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-serif italic mb-1">这里依然空无一物</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600">发表第一条评论，留下你的足迹吧~</p>
        </div>
      ) : (
        /* 评论盖楼结构 */
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div 
              key={comment.id}
              className="flex gap-4 p-5 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/20 shadow-xs transition-all duration-300"
            >
              {/* 一级用户头像 */}
              <div className="flex-shrink-0 select-none">
                <img
                  src={comment.avatarUrl}
                  alt={comment.nickname}
                  className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/50 dark:border-zinc-800 shadow-inner"
                  loading="lazy"
                />
              </div>

              {/* 评论主体 */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {/* 昵称及时间元数据 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {comment.visitorWebsite ? (
                      <a 
                        href={comment.visitorWebsite.startsWith('http') ? comment.visitorWebsite : `https://${comment.visitorWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-heading font-extrabold text-zinc-700 dark:text-zinc-300 hover:text-[#727BBA] dark:hover:text-[#8E97D5] transition-colors truncate hover:underline"
                      >
                        {comment.nickname}
                      </a>
                    ) : (
                      <span className="text-xs font-heading font-extrabold text-zinc-700 dark:text-zinc-300 truncate">
                        {comment.nickname}
                      </span>
                    )}

                    {/* 博主回复标记 */}
                    {comment.isAuthorReplied && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#727BBA]/15 text-[#727BBA] dark:text-[#8E97D5] text-[9px] font-bold rounded scale-90 select-none">
                        <CheckCircle size={8} fill="currentColor" className="text-white dark:text-zinc-900" />
                        博主
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>

                {/* 评论内容文本，解析换行 */}
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-350 break-words whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* 功能操作条 (点赞、回复) */}
                {isAllowComment && (
                  <div className="flex items-center gap-4 mt-1.5 select-none">
                    {/* 点赞 */}
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                        likedIds.has(comment.id)
                          ? 'text-rose-500'
                          : 'text-zinc-400 dark:text-zinc-500 hover:text-rose-500'
                      }`}
                      title="点赞评论"
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
                      className={`flex items-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                        activeReplyId === comment.id
                          ? 'text-[#727BBA] dark:text-[#8E97D5]'
                          : 'text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA]'
                      }`}
                    >
                      <CornerDownRight size={11} />
                      <span>回复</span>
                    </button>
                  </div>
                )}

                {/* 如果激活了回复当前顶级评论，嵌入回复表单 */}
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

                {/* 二级回复盖楼列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 flex flex-col gap-4 border-l border-zinc-200/50 dark:border-zinc-800/80 pl-4">
                    {comment.replies.map((reply) => (
                      <div 
                        key={reply.id}
                        className="flex gap-3 text-xs"
                      >
                        {/* 二级头像 */}
                        <div className="flex-shrink-0 select-none">
                          <img
                            src={reply.avatarUrl}
                            alt={reply.nickname}
                            className="w-8 h-8 rounded-lg bg-zinc-150 border border-zinc-200/40 dark:border-zinc-800 shadow-inner"
                            loading="lazy"
                          />
                        </div>

                        {/* 二级内容 */}
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              {reply.visitorWebsite ? (
                                <a 
                                  href={reply.visitorWebsite.startsWith('http') ? reply.visitorWebsite : `https://${reply.visitorWebsite}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-heading font-extrabold text-zinc-700 dark:text-zinc-300 hover:text-[#727BBA] transition-colors truncate hover:underline"
                                >
                                  {reply.nickname}
                                </a>
                              ) : (
                                <span className="font-heading font-extrabold text-zinc-700 dark:text-zinc-300 truncate">
                                  {reply.nickname}
                                </span>
                              )}

                              {reply.isAuthorReplied && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#727BBA]/15 text-[#727BBA] dark:text-[#8E97D5] text-[9px] font-bold rounded scale-90 select-none">
                                  博主
                                </span>
                              )}

                              {/* 回复 @xxx 的指向标 */}
                              {reply.replyTo && (
                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 select-none">
                                  回复 <strong className="text-zinc-500 dark:text-zinc-400">@{reply.replyTo}</strong>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>

                          {/* 二级评论文本 */}
                          <p className="leading-relaxed text-zinc-650 dark:text-zinc-400 break-words whitespace-pre-wrap">
                            {reply.content}
                          </p>

                          {/* 二级功能条 (点赞、回复) */}
                          {isAllowComment && (
                            <div className="flex items-center gap-3.5 mt-1 select-none">
                              {/* 点赞 */}
                              <button
                                onClick={() => handleLike(reply.id)}
                                className={`flex items-center gap-1 text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                                  likedIds.has(reply.id)
                                    ? 'text-rose-500'
                                    : 'text-zinc-400 dark:text-zinc-500 hover:text-rose-500'
                                }`}
                                title="点赞"
                              >
                                <Heart 
                                  size={10} 
                                  fill={likedIds.has(reply.id) ? 'currentColor' : 'none'} 
                                  className={likedIds.has(reply.id) ? 'scale-115 text-rose-500' : ''} 
                                />
                                <span>{reply.likeCount}</span>
                              </button>

                              {/* 回复二级，通过传递上一级 parentId 但把 replyTo 绑定为二级评论的作者 */}
                              <button
                                onClick={() => setActiveReplyId(activeReplyId === reply.id ? null : reply.id)}
                                className={`flex items-center gap-0.5 text-[9px] font-bold cursor-pointer transition-colors ${
                                  activeReplyId === reply.id
                                    ? 'text-[#727BBA] dark:text-[#8E97D5]'
                                    : 'text-zinc-400 dark:text-zinc-500 hover:text-[#727BBA]'
                                }`}
                              >
                                <CornerDownRight size={10} />
                                <span>回复</span>
                              </button>
                            </div>
                          )}

                          {/* 局部嵌入式回复表单 (为二级回复继续提供输入框) */}
                          {activeReplyId === reply.id && (
                            <div className="w-full mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                              <CommentForm
                                articleId={articleId}
                                parentId={comment.id} // 始终挂在顶级 parentId 下以维持两级扁平树
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
