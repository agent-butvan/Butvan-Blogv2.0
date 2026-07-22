'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { HelpCircle, User, LogOut, Upload, Mail, AtSign } from 'lucide-react'
import { Button, Tooltip, Avatar, Separator, toast, Input, Modal, Badge } from '@heroui/react'
import { fetchNavigations } from '@/lib/profile'
import { resolveImageUrl } from '@/lib/image-url'
import { upload } from '@/lib/http-client'
import { useAuth } from '@/contexts/AuthContext'
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
  // 全局认证状态
  const { user, isLoggedIn, logout, refreshUser } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [uploadAvatarModalOpen, setUploadAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userInfoModalOpen, setUserInfoModalOpen] = useState(false)
  // 当前路由路径，用于高亮激活菜单项
  const pathname = usePathname()
  // 移动端折叠菜单开关状态
  const [isOpen, setIsOpen] = useState(false)

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    await logout()
    toast.success('已退出登录')
  }

  /**
   * 处理头像上传（使用 http-client 统一封装，自动携带 Cookie）
   */
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.warning('请选择要上传的图片')
      return
    }

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const data = await upload<{ avatarUrl: string }>('/auth/me/avatar', formData)

      // 通过全局认证状态更新头像
      refreshUser({ avatarUrl: data?.avatarUrl || '' })
      toast.success('头像上传成功')
      setUploadAvatarModalOpen(false)
      setSelectedFile(null)
    } catch (error) {
      console.error('上传头像失败:', error)
      toast.danger(error instanceof Error ? error.message : '上传失败')
    }
  }

  /**
   * 解析头像 URL
   */
  const resolveAvatarUrl = (avatarUrl?: string | null): string => {
    return resolveImageUrl(avatarUrl || "");
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
      <>
        {/* PC 端加载占位 */}
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

        {/* 移动端加载占位（放置在左上角，极简且不挡屏幕） */}
        <div className="fixed left-4 top-3 z-40 lg:hidden w-10 h-10 rounded-full bg-zinc-200/70 dark:bg-zinc-850/60 animate-pulse" />
      </>
    )
  }

  // ---- 空状态：仅登录图标（统一定位在左侧垂直居中） ----
  if (items.length === 0) {
    return (
      <>
        {/* PC 端空状态 */}
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

        {/* 移动端空状态 (仅展示单个圆形登录/头像按钮，放置在左上角，绝对不挡屏幕) */}
        <div className="fixed left-4 top-3 z-40 lg:hidden">
          {user ? (
            <button
              type="button"
              aria-label="查看个人信息"
              onClick={() => setUserInfoModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/85 shadow-md backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
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
          ) : (
            <button
              type="button"
              aria-label="登录"
              onClick={() => setLoginModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/85 shadow-md text-zinc-650 dark:text-zinc-355 backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
            >
              <User size={16} />
            </button>
          )}
        </div>

        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      {/* 注入一个 CSS slideDown 动画定义，供移动端侧边栏从上而下展开时使用 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: scaleY(0.7) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }
      ` }} />

      {/* PC 端：侧边菜单栏容器（始终展开） */}
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

      {/* 移动端：自适应折叠菜单栏（仅在 lg 以下屏幕显示，只占用一个圆形按钮的空间，永不挡屏，垂直方向向下抽出展开） */}
      <div className="fixed left-4 top-3 z-45 lg:hidden flex flex-col items-center select-none">
        {/* 开关触发按钮 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/85 shadow-md text-zinc-650 dark:text-zinc-300 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        >
          {isOpen ? <Icons.X size={18} /> : <Icons.Menu size={18} />}
        </button>

        {/* 展开的悬浮快捷菜单面板 */}
        {isOpen && (
          <div
            style={{ 
              animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transformOrigin: 'top center'
            }}
            className="absolute left-0 top-12 flex flex-col gap-2.5 bg-white/95 dark:bg-zinc-950/95 p-2 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/85 shadow-xl backdrop-blur-md min-w-[40px] items-center z-50"
          >
            {items.map((item) => {
              const IconComp = getIconComponent(item.icon)
              const isActive = !!(item.linkUrl && pathname === item.linkUrl)
              return (
                <Link
                  key={item.id}
                  href={item.linkUrl || '#'}
                  onClick={() => setIsOpen(false)}
                  aria-label={item.title}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? 'bg-[#727BBA]/15 text-[#727BBA]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <IconComp size={16} />
                </Link>
              )
            })}

            <Separator className="my-0.5 w-4/5" />

            {/* 登录/个人信息按钮 */}
            {user ? (
              <button
                type="button"
                aria-label="查看个人信息"
                onClick={() => {
                  setUserInfoModalOpen(true);
                  setIsOpen(false);
                }}
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
            ) : (
              <button
                type="button"
                aria-label="登录"
                onClick={() => {
                  setLoginModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <User size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 登录弹窗 */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* 上传头像弹窗 */}
      <Modal isOpen={uploadAvatarModalOpen} onOpenChange={(open) => !open && setUploadAvatarModalOpen(false)}>
        <Modal.Backdrop>
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
      <Modal isOpen={userInfoModalOpen} onOpenChange={(open) => !open && setUserInfoModalOpen(false)}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[380px]">
              <Modal.CloseTrigger />
              <Modal.Body>
                <div className="flex flex-col items-center gap-5">
                  {/* 用户头像（带在线状态指示点） */}
                  <Badge.Anchor>
                    <Avatar size="lg" className="w-24 h-24">
                      {user?.avatarUrl ? (
                        <Avatar.Image src={resolveAvatarUrl(user.avatarUrl)} alt="User avatar" />
                      ) : null}
                      <Avatar.Fallback className="text-2xl font-bold bg-[#727BBA]/15 text-[#727BBA] flex items-center justify-center">
                        {(user?.nickname || '?').charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                    <Badge color="success" placement="bottom-right" size="sm" />
                  </Badge.Anchor>

                  {/* 用户昵称与用户名 */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      {user?.nickname || '用户'}
                    </span>
                    {user?.username && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <AtSign className="size-3" />
                        {user.username}
                      </span>
                    )}
                  </div>

                  {/* 分隔线 */}
                  <Separator className="w-full" />

                  {/* 详细信息列表 */}
                  <div className="w-full flex flex-col gap-2.5">
                    {/* 邮箱信息 */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-[#727BBA]/10 flex items-center justify-center">
                        <Mail className="size-4 text-[#727BBA]" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">邮箱</span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {user?.email || '未设置'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    className="w-full"
                    variant="secondary"
                    slot="close"
                    onPress={() => setUploadAvatarModalOpen(true)}
                  >
                    <Upload className="size-4 mr-2" />
                    更换头像
                  </Button>
                  <Button
                    className="w-full"
                    variant="danger"
                    slot="close"
                    onPress={handleLogout}
                  >
                    <LogOut className="size-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
}
