'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { HelpCircle, User, LogOut, Upload, Mail, AtSign } from 'lucide-react'
import { Button, Tooltip, Avatar, Separator, Dropdown, Label, toast, Input, Modal, Badge } from '@heroui/react'
import { fetchNavigations } from '@/lib/profile'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LoginModal from '@/components/auth/LoginModal'

interface NavigationItem {
  id: number
  title: string
  linkUrl?: string
  icon?: string
}

/** 动态匹配 Lucide 图标 */
const getIconComponent = (iconName?: string): Icons.LucideIcon => {
  if (!iconName) return HelpCircle
  const IconComponent = (Icons as Record<string, unknown>)[iconName] as Icons.LucideIcon
  return IconComponent || HelpCircle
}

/**
 * 客户端左侧中部固定悬浮快捷侧挂栏 (SidebarWidget)
 * - 动态拉取后台中展示位置为 'SIDEBAR' 的菜单导航
 * - 使用 HeroUI Tooltip 实现 hover 滑出提示
 * - 底部集成登录图标（HeroUI Avatar/Button + Separator 分隔）
 * - 支持当前页面激活态高亮、加载骨架屏、无障碍 aria-label
 * - 若后台未配置任何侧边栏目，仅显示登录图标（统一定位）
 */
export default function SidebarWidget() { 
  const [items, setItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  // 登录状态
  const [user, setUser] = useState<{ nickname: string; avatarUrl?: string | null; username?: string | null; email?: string | null } | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [uploadAvatarModalOpen, setUploadAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userInfoModalOpen, setUserInfoModalOpen] = useState(false)
  // 当前路由路径，用于高亮激活菜单项
  const pathname = usePathname()

  /**
   * 获取登录状态
   */
  const initAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const infoStr = localStorage.getItem('user_info')
      if (token && infoStr) {
        try {
          const parsed = JSON.parse(infoStr)
          // 若解析成功但缺少有效 nickname，说明是旧版脏数据，主动清理
          if (!parsed || !parsed.nickname) {
            localStorage.removeItem('token')
            localStorage.removeItem('user_info')
            setUser(null)
          } else {
            // 兼容旧数据：若缺少 email 字段，尝试从其他位置获取
            if (!parsed.email && parsed.username?.includes('@')) {
              parsed.email = parsed.username
            }
            setUser(parsed)
          }
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

  // 初始化登录状态
  useEffect(() => {
    initAuth()
    
    // 监听全局授权变更事件
    window.addEventListener('auth-change', initAuth)
    return () => {
      window.removeEventListener('auth-change', initAuth)
    }
  }, [])

  /**
   * 处理登出 — 清除本地状态并广播 auth-change 事件
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
    toast.success('已退出登录')
  }

  /**
   * 处理头像上传
   */
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.warning('请选择要上传的图片')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.danger('请先登录')
        return
      }

      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/auth/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const json = await response.json()
      if (json.code === 200 && json.data) {
        // 更新本地用户信息
        const updatedUser = { ...user!, avatarUrl: json.data.avatarUrl }
        setUser(updatedUser)
        localStorage.setItem('user_info', JSON.stringify(updatedUser))
        toast.success('头像上传成功')
        setUploadAvatarModalOpen(false)
        setSelectedFile(null)
      } else {
        throw new Error(json.msg || '上传失败')
      }
    } catch (error) {
      console.error('上传头像失败:', error)
      toast.danger(error instanceof Error ? error.message : '上传失败')
    }
  }

  /**
   * 解析头像 URL
   */
  const resolveAvatarUrl = (avatarUrl?: string | null): string => {
    if (!avatarUrl) return ""
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      return avatarUrl;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const host = apiBase.replace(/\/api$/, "");
    return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
  };

  // 拉取侧边栏动态菜单
  useEffect(() => {
    setLoading(true)
    fetchNavigations('SIDEBAR')
      .then((data) => {
        setItems(data || [])
      })
      .catch(() => {
        // fetchNavigations 内部已 warn，此处静默降级
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // ---- 骨架屏渲染（数据加载中） ----
  if (loading) {
    return (
      <div
        className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none"
        aria-label="侧边栏菜单加载中"
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            aria-hidden="true"
          />
        ))}
        <Separator className="my-1" />
        <div
          className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          aria-hidden="true"
        />
      </div>
    )
  }

  // ---- 空状态：仅登录图标（统一定位在左侧垂直居中） ----
  if (items.length === 0) {
    return (
      <>
        <div
          className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none"
          aria-label="侧边栏"
        >
          {user ? (
            <Tooltip>
              <Tooltip.Trigger>
                <button
                  type="button"
                  aria-label="查看个人信息"
                  onClick={() => setUserInfoModalOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Avatar size="sm" className="w-6 h-6">
                    {user.avatarUrl ? (
                      <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                    ) : null}
                    <Avatar.Fallback className="text-[10px] font-bold bg-[#727BBA]/15 text-[#727BBA] flex items-center justify-center">
                      {(user.nickname || '?').charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow>
                个人信息
              </Tooltip.Content>
            </Tooltip>
          ) : (
            <Tooltip>
              <Tooltip.Trigger>
                <button
                  type="button"
                  aria-label="登录"
                  onClick={() => setLoginModalOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <User size={15} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow>
                登录
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      {/* 左侧菜单栏容器（包含菜单项 + 分隔线 + 登录图标） */}
      <nav
        className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3.5 bg-white/70 dark:bg-zinc-950/70 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-xs select-none"
        aria-label="侧边栏导航"
      >
        {/* 动态菜单项 — 使用 Link 直接渲染避免嵌套交互元素，激活态高亮 */}
        {items.map((item) => {
          const IconComp = getIconComponent(item.icon)
          const isActive = !!(item.linkUrl && pathname === item.linkUrl)
          return (
            <Tooltip key={item.id}>
              <Tooltip.Trigger>
                <Link
                  href={item.linkUrl || '#'}
                  aria-label={item.title}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? 'bg-[#727BBA]/15 text-[#727BBA]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <IconComp size={15} />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow>
                {item.title}
              </Tooltip.Content>
            </Tooltip>
          )
        })}

        {/* 分隔线 - 将菜单与登录图标隔开 */}
        <Separator className="my-1" />

        {/* 登录图标 / 用户头像 */}
        {user ? (
          <Tooltip>
            <Tooltip.Trigger>
              <button
                type="button"
                aria-label="查看个人信息"
                onClick={() => setUserInfoModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Avatar size="sm" className="w-6 h-6">
                  {user.avatarUrl ? (
                    <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                  ) : null}
                  <Avatar.Fallback className="text-[10px] font-bold bg-[#727BBA]/15 text-[#727BBA] flex items-center justify-center">
                    {(user.nickname || '?').charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
              个人信息
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <Tooltip>
            <Tooltip.Trigger>
              <button
                type="button"
                aria-label="登录"
                onClick={() => setLoginModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <User size={15} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
              登录
            </Tooltip.Content>
          </Tooltip>
        )}
      </nav>

      {/* 登录弹窗 */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* 上传头像弹窗 */}
      <Modal>
        <Modal.Backdrop isOpen={uploadAvatarModalOpen} onOpenChange={(open) => !open && setUploadAvatarModalOpen(false)}>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-[#727BBA]/15 text-[#727BBA]">
                  <Upload className="size-5" />
                </Modal.Icon>
                <Modal.Heading>上传头像</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <Avatar size="lg" className="w-20 h-20">
                      {selectedFile ? (
                        <Avatar.Image src={URL.createObjectURL(selectedFile)} alt="Preview avatar" />
                      ) : user?.avatarUrl ? (
                        <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="Current avatar" />
                      ) : null}
                      <Avatar.Fallback className="text-lg font-bold bg-[#727BBA]/15 text-[#727BBA] flex items-center justify-center">
                        {(user?.nickname || '?').charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    variant="secondary"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setSelectedFile(file)
                    }}
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    支持 JPG、PNG 格式，建议尺寸 200x200 像素
                  </p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary" onPress={() => setUploadAvatarModalOpen(false)}>
                  取消
                </Button>
                <Button 
                  slot="close" 
                  onPress={handleAvatarUpload}
                  isDisabled={!selectedFile}
                >
                  确认上传
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* 用户信息弹窗 */}
      <Modal>
        <Modal.Backdrop isOpen={userInfoModalOpen} onOpenChange={(open) => !open && setUserInfoModalOpen(false)}>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[400px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-[#727BBA]/15 text-[#727BBA]">
                  <User className="size-5" />
                </Modal.Icon>
                <Modal.Heading>个人信息</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col items-center gap-5">
                  {/* 用户头像（带 Badge 在线状态指示） */}
                  <Badge
                    content=""
                    color="success"
                    placement="bottom-right"
                    className="w-3 h-3"
                  >
                    <Avatar size="lg" className="w-24 h-24">
                      {user?.avatarUrl ? (
                        <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                      ) : null}
                      <Avatar.Fallback className="text-2xl font-bold bg-[#727BBA]/15 text-[#727BBA] flex items-center justify-center">
                        {(user?.nickname || '?').charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                  </Badge>

                  {/* 用户昵称与用户名 */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <Label className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      {user?.nickname || '用户'}
                    </Label>
                    {user?.username && (
                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <AtSign className="size-3" />
                        <Label className="text-xs font-normal">{user.username}</Label>
                      </div>
                    )}
                  </div>

                  {/* 分隔线 */}
                  <Separator className="w-full" />

                  {/* 详细信息列表 */}
                  <div className="w-full flex flex-col gap-3">
                    {/* 邮箱信息 */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-[#727BBA]/10 flex items-center justify-center">
                        <Mail className="size-4 text-[#727BBA]" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">邮箱</Label>
                        <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {user?.email || '未设置'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="flex-col gap-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  onPress={() => {
                    setUserInfoModalOpen(false)
                    setUploadAvatarModalOpen(true)
                  }}
                >
                  <Upload className="size-4 mr-2" />
                  更换头像
                </Button>
                <Button
                  className="w-full"
                  variant="danger"
                  onPress={() => {
                    setUserInfoModalOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="size-4 mr-2" />
                  退出登录
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
}
