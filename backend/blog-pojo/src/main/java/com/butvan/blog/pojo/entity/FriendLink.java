package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * 友链实体类，映射 blog_friend_link 表
 */
@Entity
@Table(name = "blog_friend_link")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键ID

    @Column(name = "site_name", nullable = false, length = 100)
    private String name; // 博客名称

    @Column(name = "site_url", nullable = false, length = 500)
    private String url; // 博客地址

    @Column(name = "site_logo", length = 500)
    private String avatarUrl; // 头像URL

    @Column(name = "description", length = 255)
    private String description; // 简介描述

    @Column(name = "category", nullable = false, length = 50)
    @Builder.Default
    private String category = "TECH"; // 分类: TECH|DESIGN|LIFE|PERSONAL

    @Column(name = "email", length = 100)
    private String email; // 邮箱（不公开）

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // 状态: PENDING|APPROVED|REJECTED

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0; // 排序号

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 更新时间

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 软删除时间

    /**
     * 分类常量
     */
    public static final String CATEGORY_TECH = "TECH";
    public static final String CATEGORY_DESIGN = "DESIGN";
    public static final String CATEGORY_LIFE = "LIFE";
    public static final String CATEGORY_PERSONAL = "PERSONAL";

    /**
     * 状态常量
     */
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}