package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 文章分类实体类，映射 blog_category 表，支持两级树状自关联
 */
@Entity
@Table(name = "blog_category")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 分类唯一主键

    @Column(name = "name", nullable = false, length = 50)
    private String name; // 分类展示名称

    @Column(name = "slug", nullable = false, unique = true, length = 50)
    private String slug; // URL 友好标识符（拼音/英文）

    @Column(name = "description", length = 255)
    private String description; // 分类简介说明

    @Column(name = "parent_id")
    private Long parentId; // 父级分类 ID（顶级分类为 NULL）

    @Column(name = "icon", length = 100)
    private String icon; // 分类展示图标（Emoji 字符或 css 样式类名）

    @Column(name = "sort_order")
    private Integer sortOrder; // 分类同级排序权重

    @Column(name = "article_count")
    private Integer articleCount; // 冗余：该分类下累计已发布的文章总数

    @Column(name = "is_visible")
    private Boolean isVisible; // 是否在前台导航中展示该分类

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 记录更新时间

    /**
     * 在持久化保存实体对象前，自动装载初始时间和默认值
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.articleCount == null) {
            this.articleCount = 0;
        }
        if (this.isVisible == null) {
            this.isVisible = true;
        }
    }

    /**
     * 在实体记录发生任何修改和更新前，自动重置更新时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
