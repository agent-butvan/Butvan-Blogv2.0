package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 获取未读的通知总数量
     */
    long countByIsReadFalse();

    /**
     * 一键将所有未读通知标记为已读
     */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.isRead = false")
    void markAllAsRead();
}
