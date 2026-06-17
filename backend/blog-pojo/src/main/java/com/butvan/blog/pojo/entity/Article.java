package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 文章核心数据库实体类，映射 blog_article 表
 * 包含生命周期自动字段更新，以及逻辑软删除特性
 */
@Entity
@Table(name = "blog_article")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 文章唯一主键

    @Column(name = "title", nullable = false, length = 200)
    private String title; // 文章标题

    @Column(name = "slug", nullable = false, length = 200)
    private String slug; // URL 唯一标识（拼音/英文短链接）

    @Column(name = "summary", length = 500)
    private String summary; // 文章摘要说明，列表卡片展示用

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content; // Markdown 格式正文源文本

    @Column(name = "content_html", columnDefinition = "text")
    private String contentHtml; // 服务端解析缓存后的 HTML 格式文本

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl; // 文章特色头图/封面图 URL 地址

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category; // 所属分类关联

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // 文章作者关联（关联系统用户表）

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 发布状态：DRAFT（草稿）| PUBLISHED（已发布）| PRIVATE（私密）| ARCHIVED（归档）

    @Column(name = "visibility", nullable = false, length = 20)
    private String visibility; // 访问可见性：PUBLIC（公开）| PRIVATE（私密仅自己）| PASSWORD_PROTECTED（密码访问）

    @Column(name = "password", length = 100)
    private String password; // 密码访问时的明文/密文校验码（仅当 visibility=PASSWORD_PROTECTED 有效）

    @Column(name = "is_pinned")
    private Boolean isPinned; // 是否置顶推荐

    @Column(name = "is_featured")
    private Boolean isFeatured; // 是否首页精选推荐

    @Column(name = "is_allow_comment")
    private Boolean isAllowComment; // 是否开启评论模块

    @Column(name = "view_count")
    private Long viewCount; // 文章累计被阅读总数

    @Column(name = "like_count")
    private Long likeCount; // 文章被点赞赞许总数

    @Column(name = "comment_count")
    private Long commentCount; // 文章审核通过的已发布评论总数

    @Column(name = "word_count")
    private Integer wordCount; // 文章 Markdown 文本总字符字数

    @Column(name = "reading_time")
    private Integer readingTime; // 系统根据字数预估的阅读时长（单位：分钟）

    @Column(name = "seo_title", length = 200)
    private String seoTitle; // 自定义搜索优化 SEO 标题

    @Column(name = "seo_description", length = 500)
    private String seoDescription; // 自定义搜索优化 SEO 摘要

    @Column(name = "seo_keywords", length = 300)
    private String seoKeywords; // 自定义 SEO 检索关键字，用英文逗号分隔

    @Column(name = "template", length = 50)
    private String template; // 前台渲染使用的特色自定义模板名

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType; // 资源分类：ARTICLE（长文）| NOTE（随笔）| GALLERY（照片墙）| PROJECT（项目作品）

    @Column(name = "published_at")
    private LocalDateTime publishedAt; // 首次公开正式发布日期时间

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 记录最后修改时间

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 逻辑软删除标记（非空表示已被丢弃至回收站）

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "blog_article_tag",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>(); // 关联标签多对多中间表

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
        if (this.visibility == null) {
            this.visibility = "PUBLIC";
        }
        if (this.isPinned == null) {
            this.isPinned = false;
        }
        if (this.isFeatured == null) {
            this.isFeatured = false;
        }
        if (this.isAllowComment == null) {
            this.isAllowComment = true;
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
        if (this.contentType == null) {
            this.contentType = "ARTICLE";
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
