package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 评论封禁实体类，映射 blog_comment_ban 表
 * 记录被拉黑封禁的访客邮箱或 IP，阻断其继续评论
 */
@Entity
@Table(name = "blog_comment_ban")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentBan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键 ID

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // 被封禁的 IP 地址

    @Column(name = "email", length = 100)
    private String email; // 被封禁的邮箱

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 封禁时间

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
