package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 文章点赞流水记录实体类，映射 blog_article_like 表
 * 记录游客的 IP 地址和设备 UA 信息，提供 24 小时防刷赞策略
 */
@Entity
@Table(name = "blog_article_like")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 点赞记录唯一自增 ID

    @Column(name = "article_id", nullable = false)
    private Long articleId; // 被点赞文章唯一关联 ID

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress; // 访客的真实客户端 IP 物理地址

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 访客的设备浏览器指纹（User-Agent）信息

    @Column(name = "user_id")
    private Long userId; // 点赞绑定的用户 ID（游客点赞则为 NULL）

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建/点赞时间

    /**
     * 在数据保存前自动填充当前系统时间作为点赞时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
