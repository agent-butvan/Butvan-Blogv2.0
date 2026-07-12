package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 微信用户关联实体类，映射 blog_wechat_user 表
 * 记录微信公众号用户与系统用户的绑定关系，支持关注/取消关注状态管理
 */
@Entity
@Table(name = "blog_wechat_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WechatUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 自增主键

    @Column(name = "open_id", nullable = false, unique = true, length = 64)
    private String openId; // 微信公众号用户唯一标识（openid）

    @Column(name = "user_id")
    private Long userId; // 关联系统用户ID（未绑定时为NULL）

    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 1; // 关注状态: 1=已关注, 0=已取消关注

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间（首次关注时写入）

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 最后更新时间（关注/取消关注时刷新）

    /** 关注状态常量 */
    public static final Integer STATUS_FOLLOWED = 1;
    public static final Integer STATUS_UNFOLLOWED = 0;

    /**
     * 在持久化保存前自动填充时间和默认值
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = STATUS_FOLLOWED;
        }
    }

    /**
     * 在更新记录前自动刷新更新时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
