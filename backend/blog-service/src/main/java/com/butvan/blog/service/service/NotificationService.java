package com.butvan.blog.service.service;

import com.butvan.blog.pojo.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    /**
     * 分页查询通知列表
     */
    Page<Notification> pageNotifications(Pageable pageable);

    /**
     * 获取未读通知总数
     */
    long getUnreadCount();

    /**
     * 将单条通知标记为已读
     */
    void markAsRead(Long id);

    /**
     * 一键标记所有未读通知为已读
     */
    void markAllAsRead();

    /**
     * 根据 ID 删除通知
     */
    void deleteNotification(Long id);
}
