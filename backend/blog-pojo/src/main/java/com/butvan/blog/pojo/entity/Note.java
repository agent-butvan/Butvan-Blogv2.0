package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

/**
 * 手记数据库实体类，映射 blog_note 表
 * 轻量随笔/日常记录，独立于文章体系，支持心情/天气/位置等特色元数据
 */
@Entity
@Table(name = "blog_note")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 手记唯一主键

    @Column(name = "title", nullable = false, length = 200)
    private String title; // 手记标题

    @Column(name = "slug", nullable = false, length = 200)
    private String slug; // URL 友好标识（英文/拼音短链接）

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content; // Markdown 格式正文源文本

    @Column(name = "content_html", columnDefinition = "text")
    private String contentHtml; // 服务端渲染缓存后的 HTML 格式文本

    @Column(name = "summary", length = 500)
    private String summary; // 手记摘要简介

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl; // 配图 URL 地址

    @Column(name = "mood", length = 50)
    private String mood; // 心情标记：开心/思考中/忙碌/放松/感动/平静

    @Column(name = "weather", length = 50)
    private String weather; // 天气标记：晴/多云/阴/雨/雪/风

    @Column(name = "location", length = 200)
    private String location; // 位置描述

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 发布状态：DRAFT（草稿）| PUBLISHED（已发布）

    @Column(name = "is_pinned")
    private Boolean isPinned; // 是否置顶

    @Column(name = "view_count")
    private Long viewCount; // 累计被阅读总数

    @Column(name = "like_count")
    private Long likeCount; // 被点赞赞许总数

    @Column(name = "comment_count")
    private Long commentCount; // 已通过评论总数

    @Column(name = "word_count")
    private Integer wordCount; // Markdown 文本总字符字数

    @Column(name = "reading_time")
    private Integer readingTime; // 根据字数预估的阅读时长（单位：分钟）

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // 手记作者关联（关联系统用户表）

    @Column(name = "published_at")
    private LocalDateTime publishedAt; // 首次公开正式发布日期时间

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 记录最后修改时间

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 逻辑软删除标记（非空表示已被丢弃至回收站）

    /**
     * 在实体插入保存前，自动补充默认元数据及字数估计
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = "DRAFT";
        }
        if (this.isPinned == null) {
            this.isPinned = false;
        }
        if (this.viewCount == null) {
            this.viewCount = 0L;
        }
        if (this.likeCount == null) {
            this.likeCount = 0L;
        }
        if (this.commentCount == null) {
            this.commentCount = 0L;
        }

        if ("PUBLISHED".equalsIgnoreCase(this.status) && this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }

        calculateCounts();
    }

    /**
     * 在数据更新保存前重置字数和修改时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if ("PUBLISHED".equalsIgnoreCase(this.status) && this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }

        calculateCounts();
    }

    /**
     * 计算 Markdown 正文字数及预估阅读分钟数 (假设平均阅读速度为 300 字/分钟)
     */
    private void calculateCounts() {
        if (this.content != null) {
            this.wordCount = this.content.length();
            this.readingTime = (int) Math.ceil(this.wordCount / 300.0);
        } else {
            this.wordCount = 0;
            this.readingTime = 0;
        }
    }
}
