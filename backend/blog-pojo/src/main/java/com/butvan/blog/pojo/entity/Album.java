package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 相册实体类，映射 blog_album 表
 */
@Entity
@Table(name = "blog_album")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键ID

    @Column(name = "title", nullable = false, length = 100)
    private String title; // 相册标题

    @Column(name = "slug", nullable = false, length = 100, unique = true)
    private String slug; // URL友好的唯一标识

    @Column(name = "description", length = 500)
    private String description; // 相册简介描述

    @Column(name = "cover_image_id")
    private Long coverImageId; // 封面图媒体ID（关联blog_media表）

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT"; // 状态: DRAFT | PUBLISHED

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0; // 排序权重

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L; // 累计浏览次数

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 更新时间

    /**
     * 状态常量
     */
    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = STATUS_DRAFT;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        if (viewCount == null) {
            viewCount = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
