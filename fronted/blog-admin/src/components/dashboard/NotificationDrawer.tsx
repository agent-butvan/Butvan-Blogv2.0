"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Check, Trash2, MessageSquare, Heart, Link2, UserPlus, Bell, Loader2 } from "lucide-react";
import type { Notification } from "@/types/notification";
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/lib/notification-api";
import { Card, Button, cn, Tooltip } from "@heroui/react";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 9991,
    type: "NEW_COMMENT",
    title: "收到新评论",
    content: "访客「开源小助手」在文章《SpringBoot与Redis深度整合指南》下发表了评论：写的太赞了！刚好解决了我的缓存雪崩问题，期待博主继续更新！",
    senderName: "开源小助手",
    targetId: 1,
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 9992,
    type: "FRIEND_LINK_APPLY",
    title: "收到新友链申请",
    content: "站长「三太子」申请交换友情链接。站点名：三太子纳斯达克之旅，网址：https://santaizi.dev",
    senderName: "三太子",
    targetId: 2,
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 9993,
    type: "LIKE_ARTICLE",
    title: "文章收到点赞",
    content: "访客「前端探险家」点赞了您的文章《Next.js 16 与 Turbopack 极致响应式重构实践》",
    senderName: "前端探险家",
    targetId: 3,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 9994,
    type: "USER_REGISTER",
    title: "新用户注册提醒",
    content: "新用户「butvan_dev」已成功注册到系统",
    senderName: "butvan_dev",
    targetId: 10,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    readAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
  }
];

/**
 * 精美骨架屏占位卡片列表组件
 */
function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="p-4 rounded-xl border border-zinc-200/20 dark:border-zinc-800/10 bg-zinc-50/20 dark:bg-zinc-900/5 shadow-none flex flex-row gap-3.5 animate-pulse select-none"
        >
          {/* 左侧图标占位 */}
          <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-850/30 shrink-0" />
          
          {/* 中间文本占位 */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center gap-4">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-850/30 rounded w-1/4" />
            </div>
            <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  );
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const drawerRef = useRef<HTMLDivElement>(null);

  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter((n) => !n.isRead);

  // 监听 Drawer 开关，开启时自动加载首屏
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setNotifications([]);
      loadNotifications(1, true);
    }
  }, [isOpen]);

  // 加载数据列表
  const loadNotifications = async (targetPage: number, replace: boolean = false) => {
    try {
      setLoading(true);
      const res = await fetchNotifications(targetPage, 10);
      let newRecords = res.records || [];
      
      // 若后端接口没有数据，则前端直接混入 mock 演示数据
      if (targetPage === 1 && newRecords.length === 0) {
        newRecords = MOCK_NOTIFICATIONS;
        res.total = MOCK_NOTIFICATIONS.length;
      }
      
      setNotifications((prev) => {
        return replace ? newRecords : [...prev, ...newRecords];
      });
      
      setTotal(res.total || 0);
      setHasMore((replace ? 0 : notifications.length) + newRecords.length < (res.total || 0));
    } catch (error) {
      console.error("加载系统通知失败, 降级使用前端写死的数据展示:", error);
      if (targetPage === 1) {
        setNotifications(MOCK_NOTIFICATIONS);
        setTotal(MOCK_NOTIFICATIONS.length);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载下一页
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage);
    }
  };

  // 标记单条为已读
  const handleMarkRead = async (id: number) => {
    if (actionLoadingMap[id]) return;
    try {
      setActionLoadingMap((prev) => ({ ...prev, [id]: true }));
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      // 获取当前最新的未读数并向父级同步
      triggerUnreadRefresh();
    } catch (err) {
      console.error("标记已读失败:", err);
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 一键全部已读
  const handleReadAll = async () => {
    try {
      setLoading(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      triggerUnreadRefresh();
    } catch (err) {
      console.error("一键已读失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除单条通知
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发卡片点击已读
    if (actionLoadingMap[id]) return;
    try {
      setActionLoadingMap((prev) => ({ ...prev, [id]: true }));
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      triggerUnreadRefresh();
    } catch (err) {
      console.error("删除通知失败:", err);
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 通过重新统计通知列表状态或向外触发刷新
  const triggerUnreadRefresh = () => {
    if (onUnreadChange) {
      onUnreadChange(-1); // 传入 -1 作为标记，通知父组件重新 fetchCount
    }
  };

  // 监听点击 Drawer 外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 渲染卡片的精美图标
  const renderIcon = (type: string) => {
    switch (type) {
      case "NEW_COMMENT":
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case "LIKE_ARTICLE":
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <Heart className="w-4 h-4 fill-rose-500/20" />
          </div>
        );
      case "FRIEND_LINK_APPLY":
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
            <Link2 className="w-4 h-4" />
          </div>
        );
      case "USER_REGISTER":
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-600 border border-zinc-150 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  // 根据通知类型及关联 ID 返回对应的管理页面路径
  const handleRedirect = (notification: Notification) => {
    // 标记已读
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
    
    onClose();
    switch (notification.type) {
      case "NEW_COMMENT":
        window.location.href = "/comments";
        break;
      case "FRIEND_LINK_APPLY":
        window.location.href = "/friends";
        break;
      case "USER_REGISTER":
        window.location.href = "/users";
        break;
      case "LIKE_ARTICLE":
        window.location.href = "/likes";
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300" />

      {/* 侧滑抽屉 */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-white/95 dark:bg-[#0c0c10]/95 border-l border-zinc-200/50 dark:border-zinc-800/40 shadow-2xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0 backdrop-blur-xl rounded-l-2xl"
      >
        {/* 头部区域 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md rounded-tl-2xl">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <h2 className="text-base font-semibold text-zinc-850 dark:text-zinc-150">通知中心</h2>
            {total > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 border border-indigo-500/20">
                共 {total} 条
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notifications.some((n) => !n.isRead) && (
              <Button
                size="sm"
                onClick={handleReadAll}
                className="text-[12px] h-7 min-w-0 flex items-center gap-1 text-zinc-650 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent border-none shadow-none transition-colors px-2 hover:bg-zinc-100/80 dark:hover:bg-zinc-850/60"
              >
                <Check className="w-4 h-4" />
                全部已读
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 导航区域 */}
        <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/40 px-6 bg-zinc-50/20 dark:bg-zinc-900/10 shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "py-3 text-xs font-semibold relative transition-colors focus:outline-none cursor-pointer mr-6",
              activeTab === "all"
                ? "text-indigo-650 dark:text-indigo-400 font-bold"
                : "text-zinc-550 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            全部通知
            {activeTab === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 dark:bg-indigo-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={cn(
              "py-3 text-xs font-semibold relative transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5",
              activeTab === "unread"
                ? "text-indigo-650 dark:text-indigo-400 font-bold"
                : "text-zinc-550 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            未读通知
            {notifications.some((n) => !n.isRead) && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
            {activeTab === "unread" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 dark:bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* 列表滚动区 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
          {filteredNotifications.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="w-14 h-14 rounded-full bg-zinc-50/80 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-400 dark:text-zinc-500 border border-zinc-200/40 dark:border-zinc-800/30 shadow-xs">
                <Bell className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 px-8">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {activeTab === "all" ? "暂无系统通知" : "没有未读通知"}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                  {activeTab === "all" 
                    ? "当系统有新评论、点赞或友链申请时，会在此收到通知。" 
                    : "所有消息处理完毕，去看看其他模块吧。"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {filteredNotifications.map((n) => (
                <Card
                  key={n.id}
                  onClick={() => handleRedirect(n)}
                  className={cn(
                    "group relative p-4 rounded-xl border transition-all duration-250 cursor-pointer flex flex-row gap-3.5 shadow-none select-none",
                    n.isRead
                      ? "bg-zinc-50/20 hover:bg-zinc-50/50 dark:bg-zinc-900/5 dark:hover:bg-zinc-900/10 border-zinc-200/30 dark:border-zinc-800/10 text-zinc-500 dark:text-zinc-450 hover:-translate-y-0.5 hover:shadow-xs"
                      : "bg-indigo-50/20 hover:bg-indigo-50/45 dark:bg-indigo-950/5 dark:hover:bg-indigo-950/10 border-indigo-100/60 dark:border-indigo-900/20 text-zinc-850 dark:text-zinc-200 shadow-[0_2px_12px_rgba(99,102,241,0.02)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.06)]"
                  )}
                >
                  {/* 未读状态下的左侧装饰条 */}
                  {!n.isRead && (
                    <div className="absolute left-0 top-3.5 bottom-3.5 w-[3.5px] rounded-r-md bg-indigo-500 dark:bg-indigo-400" />
                  )}

                  {/* 图标 */}
                  <div className="flex-shrink-0">{renderIcon(n.type)}</div>

                  {/* 文字正文 */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          n.isRead ? "text-zinc-500 dark:text-zinc-450" : "text-zinc-900 dark:text-zinc-150"
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {new Date(n.createdAt).toLocaleDateString()}{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed break-all">
                      {n.content}
                    </p>
                  </div>

                  {/* 右上角快捷删除 */}
                  <div className="flex flex-col justify-between items-end opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0">
                    <Tooltip delay={500}>
                      <Button
                        size="sm"
                        isIconOnly
                        onClick={(e) => handleDelete(n.id, e)}
                        isDisabled={actionLoadingMap[n.id]}
                        className="p-1 min-w-0 w-7 h-7 rounded text-zinc-450 hover:text-red-500 bg-transparent border-none shadow-none hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        {actionLoadingMap[n.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Tooltip.Content>
                        <p>删除该通知</p>
                      </Tooltip.Content>
                    </Tooltip>
                    {!n.isRead && (
                      <Tooltip delay={500}>
                        <Button
                          size="sm"
                          isIconOnly
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(n.id);
                          }}
                          isDisabled={actionLoadingMap[n.id]}
                          className="p-1 min-w-0 w-7 h-7 rounded text-zinc-450 hover:text-emerald-550 bg-transparent border-none shadow-none hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors mt-2"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Tooltip.Content>
                          <p>标为已读</p>
                        </Tooltip.Content>
                      </Tooltip>
                    )}
                  </div>
                </Card>
              ))}

              {/* 加载更多 */}
              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-[12px] text-indigo-650 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-300 font-semibold transition-all inline-flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    加载更多通知
                  </button>
                </div>
              )}
            </>
          )}

          {loading && filteredNotifications.length === 0 && (
            <NotificationSkeleton />
          )}
        </div>
      </div>
    </>
  );
}
