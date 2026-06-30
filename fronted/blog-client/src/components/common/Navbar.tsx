'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, ArrowUpRight, Loader2 } from 'lucide-react'
import { fetchNavigations } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'

interface NavigationItem {
  id: number
  title: string
  linkUrl?: string
  children?: NavigationItem[]
}

interface NavbarProps {
  profile: ProfileVO | null
}

const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return ""
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
};

/**
  * 客户端顶部主导航栏
  * - 从后端动态拉取 'HEADER' 类型菜单树形结构并渲染
  * - PC 端支持二级下拉磨砂玻璃菜单悬浮展现
  * - 移动端支持自适应汉堡包折叠抽屉
  * - 内置沉浸空间快捷跳转入口与前台读者登录态管理
  */
export default function Navbar({ profile }: NavbarProps) {
  const [navItems, setNavItems] = useState<NavigationItem[] | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 读者登录状态
  const [user, setUser] = useState<{ nickname: string; avatarUrl?: string | null } | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  // 获取登录状态
  const initAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const infoStr = localStorage.getItem('user_info')
      if (token && infoStr) {
        try {
          setUser(JSON.parse(infoStr))
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user_info')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
  }

  useEffect(() => {
    initAuth()
    
    // 监听全局授权变更事件
    window.addEventListener('auth-change', initAuth)
    return () => {
      window.removeEventListener('auth-change', initAuth)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput) {
      setLoginError('请输入用户名和密码')
      return
    }
    setSubmitting(true)
    setLoginError('')
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput
        })
      })
      const json = await res.json()
      if (json.code === 200 || json.code === 0) {
        if (json.data && json.data.token) {
          localStorage.setItem('token', json.data.token)
          const userInfo = {
            nickname: json.data.nickname,
            avatarUrl: json.data.avatarUrl
          }
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          setUser(userInfo)
          setLoginModalOpen(false)
          setUsernameInput('')
          setPasswordInput('')
          
          // 广播通知
          window.dispatchEvent(new Event('auth-change'))
        } else {
          setLoginError('登录异常，未获得访问令牌')
        }
      } else {
        setLoginError(json.msg || '用户名或密码错误')
      }
    } catch (err) {
      console.error(err)
      setLoginError('网络连接失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  // 拉取顶部导航菜单
  useEffect(() => {
    fetchNavigations('HEADER').then((data) => {
      setNavItems(data || [])
    })
  }, [])

  // 若尚未加载完成或后台未配置任何顶部导航，则完全不渲染组件，保持极致极简
  if (navItems === null || navItems.length === 0) return null

  const nickname = profile?.nickname || '可梵'

  return (
    <header className="sticky top-0 w-full h-16 border-b border-zinc-200/50 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-40 px-6 md:px-16 lg:px-24 flex items-center justify-between transition-colors">
      {/* 左侧 Logo / 昵称 */}
      <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-base tracking-wider text-zinc-900 dark:text-zinc-50 hover:opacity-90">
        <span className="bg-[#727BBA] text-white w-5.5 h-5.5 rounded-md flex items-center justify-center text-[11px] font-heading tracking-tighter">VB</span>
        <span>{nickname}</span>
      </Link>

      {/* 中间：PC 端导航栏 */}
      <nav className="hidden md:flex items-center gap-7">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          return (
            <div key={item.id} className="relative group py-2">
              {hasChildren ? (
                <button className="flex items-center gap-1 text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer">
                  <span>{item.title}</span>
                  <ChevronDown size={11} className="text-zinc-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
              ) : (
                <Link
                  href={item.linkUrl || '#'}
                  className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-colors cursor-pointer"
                >
                  {item.title}
                </Link>
              )}

              {/* 二级悬浮菜单 (PC端) */}
              {hasChildren && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  {item.children!.map((child) => (
                    <Link
                      key={child.id}
                      href={child.linkUrl || '#'}
                      className="block px-4 py-2 text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-[#727BBA] dark:hover:text-[#727BBA] transition-all"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 右侧：PC 端沉浸空间入口与登录管理 */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 select-none">
              {user.avatarUrl ? (
                <img 
                  src={resolveAvatarUrl(user.avatarUrl)} 
                  className="w-5.5 h-5.5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 object-cover" 
                  alt="" 
                />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-550 flex items-center justify-center uppercase">
                  {user.nickname.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-zinc-650 dark:text-zinc-300">{user.nickname}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[10px] px-2.5 py-1.25 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 font-semibold cursor-pointer transition-colors"
            >
              注销
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setLoginError(''); setLoginModalOpen(true); }}
            className="text-xs font-semibold text-[#727BBA] hover:text-[#5f68a3] cursor-pointer transition-colors"
          >
            登录
          </button>
        )}

        <Link
          href="/article"
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-[#09B38A]/20 bg-[#09B38A]/5 hover:bg-[#09B38A]/10 text-[#09B38A] font-heading text-xs font-bold transition-all duration-200"
        >
          <span>📚 文章列表</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* 移动端汉堡包菜单与状态 */}
      <div className="flex md:hidden items-center gap-2.5">
        {user && (
          <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-200/60">
            {user.avatarUrl ? (
              <img src={resolveAvatarUrl(user.avatarUrl)} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-zinc-100 text-[9px] font-bold text-zinc-500 flex items-center justify-center">{user.nickname.charAt(0)}</div>
            )}
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 移动端全屏折叠遮罩菜单 */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-4 px-6 flex flex-col gap-4.5 z-40 md:hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              return (
                <div key={item.id} className="flex flex-col gap-2">
                  {!hasChildren ? (
                    <Link
                      href={item.linkUrl || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-1"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {item.title}
                      </span>
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-zinc-150 dark:border-zinc-850">
                        {item.children!.map((child) => (
                          <Link
                            key={child.id}
                            href={child.linkUrl || '#'}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 py-1"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 移动端登录/注销入口 */}
          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3.5 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">已登录: {user.nickname}</span>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-[10px] text-zinc-400 active:text-rose-500"
                >
                  注销
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setLoginError(''); setMobileMenuOpen(false); setLoginModalOpen(true); }}
                className="text-xs font-bold text-[#727BBA] cursor-pointer"
              >
                点此登录账户
              </button>
            )}
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3 flex flex-col">
            <Link
              href="/article"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-[#09B38A]/10 border border-[#09B38A]/20 text-[#09B38A] text-xs font-bold"
            >
              <span>� 进入文章列表</span>
            </Link>
          </div>
        </div>
      )}

      {/* 无刷新毛玻璃极简登录窗 */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <form 
            onSubmit={handleLogin}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl w-full max-w-xs p-6 relative flex flex-col gap-4.5 shadow-xl select-none mx-4"
          >
            <button 
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4.5 right-4.5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2.5">
              <h3 className="text-sm font-serif font-bold text-zinc-900 dark:text-white mb-1">欢迎回来</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-serif italic">登录您的可梵博客账号</p>
            </div>
            
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">用户名</label>
                <input
                  type="text"
                  placeholder="请输入登录用户名"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.25 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:border-[#727BBA] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">密码</label>
                <input
                  type="password"
                  placeholder="请输入登录密码"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.25 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:border-[#727BBA] transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-[10px] text-rose-500 text-center font-semibold animate-pulse">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.25 bg-[#727BBA] hover:bg-[#5f68a3] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer select-none mt-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? '安全登录中...' : '提交登录'}</span>
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
