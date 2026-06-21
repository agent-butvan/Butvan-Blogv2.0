package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 用户数据库实体类，映射 blog_user 表，支持多作者账号管理
 */
@Entity
@Table(name = "blog_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 用户唯一主键

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username; // 登录用户名（唯一，支持字母数字下划线）

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // BCrypt 加密存储的密码哈希值

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname; // 前端界面展示的昵称（支持中文）

    @Column(name = "email", unique = true, length = 100)
    private String email; // 用户绑定的唯一邮箱地址（用于找回密码或回复通知）

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl; // 用户头像图片的外部访问 URL 链接

    @Column(name = "bio", columnDefinition = "text")
    private String bio; // 用户的个性化个人简介/电子签名

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", columnDefinition = "jsonb")
    private Map<String, Object> socialLinks; // 用户的社交网络主页链接扩展字段（例如 github/twitter）

    @Column(name = "github_id", length = 100)
    private String githubId; // 绑定的 GitHub 用户唯一标识 ID

    @Column(name = "github_username", length = 100)
    private String githubUsername; // 绑定的 GitHub 用户名

    @Column(name = "two_factor_secret", length = 100)
    private String twoFactorSecret; // 双重验证 TOTP 密钥 (Base32)

    @Builder.Default
    @Column(name = "two_factor_enabled", nullable = false)
    private Boolean twoFactorEnabled = false; // 是否启用双重验证

    @Column(name = "role", nullable = false, length = 20)
    private String role; // 用户的安全角色身份枚举：ADMIN（管理员）| AUTHOR（作者）

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 用户账号的安全启用状态：ACTIVE（正常）| DISABLED（禁用）

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt; // 用户的最后一次登录成功时间戳

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 用户的注册创建时间（自动生成）

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 用户的最后修改时间（更新时自动重置）

    /**
     * 在持久化保存实体对象前，自动装载初始时间和默认状态值
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = "AUTHOR";
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    /**
     * 在实体记录发生任何字段修改和更新前，自动重置更新时间戳
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
