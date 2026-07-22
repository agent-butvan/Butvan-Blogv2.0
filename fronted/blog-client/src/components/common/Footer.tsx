'use client'

import React, { useState, useEffect } from 'react'
import type { ProfileVO } from '@/types/profile'
import { fetchProfile, fetchNavigations } from '@/lib/profile'

interface NavigationItem {
  id: number
  title: string
  linkUrl?: string
  children?: NavigationItem[]
}

/**
 * 全站统一大厂级优雅页脚组件
 * - 纯文字流式响应式排版，消弭无意义留白
 * - 自动拉取后台配置中展示位置为 FOOTER 的树状导航栏目与链接
 * - 站点标题、副标题、备案号直接与后台个人公开资料配置打通
 * - 动态秒表天数计时器：精准计算并呈现在线运行天数
 * - 全无死角适配信手捏合暗色模式：消弭硬朗白线，暗色下提供极具质感的微妙描边
 */
export default function Footer() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [runTimeText, setRunTimeText] = useState('')
  const [onlineCount, setOnlineCount] = useState(1)

  // 1. 挂载时异步加载数据
  useEffect(() => {
    fetchProfile('butvan').then((data) => setProfile(data)).catch(() => {})
    fetchNavigations('FOOTER').then((data) => setNavItems(data || [])).catch(() => {})
  }, [])

  // 2. 模拟在线人数微幅变化 (1~3 之间，隔 15 秒更新)
  useEffect(() => {
    const timer = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1
      setOnlineCount(count)
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  // 3. 计算建站天数/时/分/秒，1 秒更新一次
  useEffect(() => {
    const links = profile?.socialLinks || {}
    const startDateStr = links.footerStartDate || '2022-06-15'
    
    let startTime: number
    try {
      startTime = new Date(startDateStr).getTime()
      if (isNaN(startTime)) {
        startTime = new Date('2022-06-15').getTime()
      }
    } catch {
      startTime = new Date('2022-06-15').getTime()
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = now - startTime
      if (diff <= 0) {
        setRunTimeText('0 天 0 小时 0 分 0 秒')
        return
      }

      const msecPerDay = 24 * 60 * 60 * 1000
      const msecPerHour = 60 * 60 * 1000
      const msecPerMinute = 60 * 1000
      const msecPerSecond = 1000

      const days = Math.floor(diff / msecPerDay)
      let remainder = diff % msecPerDay

      const hours = Math.floor(remainder / msecPerHour)
      remainder = remainder % msecPerHour

      const minutes = Math.floor(remainder / msecPerMinute)
      remainder = remainder % msecPerMinute

      const seconds = Math.floor(remainder / msecPerSecond)

      setRunTimeText(`${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [profile])

  // --- 解析页脚参数与静态降级兜底 ---
  const links = profile?.socialLinks || {}
  const footerTitle = links.footerTitle || (profile?.nickname ? `${profile.nickname}'s Blog.` : "Butvan's Blog.")
  const footerSubtitle = links.footerSubtitle || "总之岁月漫长，然而值得等待"
  const footerIcp = links.footerIcp || "湘ICP备2023033970号-1"
  
  const currentYear = new Date().getFullYear()
  const startYear = links.footerStartDate ? links.footerStartDate.substring(0, 4) : '2022'

  return (
    <footer className="w-full bg-transparent border-t border-zinc-200/50 dark:border-white/10 transition-colors py-12 px-6 md:px-16 lg:px-24 text-left font-body text-zinc-600 dark:text-zinc-400 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* 上半部分：4栏流式布局 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* 1 ~ 3 栏：根据后台 FOOTER 位置导航动态拉取 */}
          {navItems.length > 0 ? (
            navItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-primary rounded-full shrink-0" />
                  <span className="text-xs font-heading font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">
                    {item.title} &gt;
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 pl-3">
                  {item.children && item.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={child.linkUrl || '#'}
                        className="text-xs text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors cursor-pointer"
                      >
                        {child.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // 静态兜底结构，保证无数据时的呈现
            <>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-[#09B38A] rounded-full shrink-0" />
                  <span className="text-xs font-heading font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">
                    想要了解我 &gt;
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 pl-3">
                  <li><a href="/friend" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">关于我</a></li>
                  <li><a href="/article" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">本站历史</a></li>
                  <li><a href="https://github.com/18755120710/Butvan-Blogv2.0" target="_blank" rel="noreferrer" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">关于此项目</a></li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-[#09B38A] rounded-full shrink-0" />
                  <span className="text-xs font-heading font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">
                    你也许在找 &gt;
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 pl-3">
                  <li><a href="/notes" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">手记列表</a></li>
                  <li><a href="/friend" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">友链网络</a></li>
                  <li><a href="/albums" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">光影相册</a></li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-[#09B38A] rounded-full shrink-0" />
                  <span className="text-xs font-heading font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">
                    联系我呗 &gt;
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 pl-3">
                  <li><a href="/friend/apply" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">申请友链</a></li>
                  <li><a href="mailto:wj5395@outlook.com" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">发送邮件</a></li>
                  <li><a href="https://github.com/18755120710" target="_blank" rel="noreferrer" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">GitHub 主页</a></li>
                </ul>
              </div>
            </>
          )}

          {/* 右侧站点标题及标语栏 */}
          <div className="flex flex-col gap-3 md:items-end text-left md:text-right md:ml-auto">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight font-heading">
                {footerTitle}
              </h2>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal">
                {footerSubtitle}
              </p>
            </div>
            {/* 动态在线人数挂件 */}
            <div className="flex items-center gap-1.5 mt-1 bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-white/10 px-2.5 py-1 rounded-full text-[10px] text-zinc-500 dark:text-zinc-400 w-fit md:ml-auto shadow-xs backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>正在有 <strong className="text-emerald-500 font-bold">{onlineCount}</strong> 位小伙伴看着我的网站呐</span>
            </div>
          </div>

        </div>

        {/* 细分割线 */}
        <div className="border-t border-zinc-200/40 dark:border-white/10 my-1" />

        {/* 下半部分：版权、运行天数、ICP备案 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-[10.5px] text-zinc-400 dark:text-zinc-500 leading-normal">
          <div className="flex flex-col gap-1 text-left">
            <div>
              Copyright &copy; {startYear} - {currentYear} <strong className="text-zinc-500 dark:text-zinc-400 font-medium">{profile?.nickname || '可梵'}</strong>. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
              <span>Powered by <a href="https://github.com/18755120710/Butvan-Blogv2.0" target="_blank" rel="noreferrer" className="text-[#09B38A] hover:underline">Butvan Blog 2.0</a></span>
              <span className="text-zinc-300 dark:text-zinc-800">|</span>
              <span>风雨飘摇中，本站已运行 <strong className="font-mono text-zinc-500 dark:text-zinc-400">{runTimeText}</strong></span>
              {footerIcp && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-800">|</span>
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:underline">{footerIcp}</a>
                </>
              )}
            </div>
          </div>
          <div className="text-left md:text-right text-[10px]">
            Designed by <span className="font-medium text-zinc-500 dark:text-zinc-400">{profile?.nickname || '可梵'}</span> with <span className="text-red-500">❤</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
