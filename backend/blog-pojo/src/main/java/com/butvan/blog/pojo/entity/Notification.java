package com.butvan.blog.pojo.entity;

import com.butvan.blog.common.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 系统通知实体，映射 blog_notification 表
 */
@Entity
@Table(name = "blog_notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type; // 通知事件类型 (FRIEND_LINK_APPLY, USER_REGISTER, LIKE_ARTICLE, NEW_COMMENT)

    @Column(name = "title", nullable = false)
    private String title; // 通知标题

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content; // 通知正文内容

    @Column(name = "sender_name")
    private String senderName; // 触发该事件的发送人昵称（比如点赞用户，如游客）

    @Column(name = "target_id")
    private Long targetId; // 关联跳转的目标业务 ID（如文章 ID，评论 ID）

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false; // 是否已读状态，默认未读

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "read_at")
    private LocalDateTime readAt; // 已读阅读时间

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}
