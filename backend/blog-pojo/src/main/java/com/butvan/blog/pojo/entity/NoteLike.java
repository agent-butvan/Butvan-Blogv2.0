package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 手记点赞记录实体
 * 记录每一次手记点赞行为，支持 IP + UA 防刷赞以及登录用户绑定
 */
@Entity
@Table(name = "blog_note_like")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 点赞记录唯一自增 ID

    @Column(name = "note_id", nullable = false)
    private Long noteId; // 被点赞手记唯一关联 ID

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
