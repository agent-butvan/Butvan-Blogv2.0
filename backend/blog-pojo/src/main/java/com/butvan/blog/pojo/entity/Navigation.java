package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 导航菜单数据库实体类，映射 blog_navigation 表，支持多级树形结构
 */
@Entity
@Table(name = "blog_navigation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Navigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 导航唯一ID

    @Column(name = "title", nullable = false, length = 50)
    private String title; // 菜单显示名称，如“文章”、“关于我”

    @Column(name = "parent_id")
    private Long parentId; // 父导航菜单ID（NULL表示一级菜单）

    @Column(name = "link_type", nullable = false, length = 20)
    private String linkType; // 链接类型：PAGE | CATEGORY | ARTICLE | EXTERNAL | NONE

    @Column(name = "link_target_id")
    private Long linkTargetId; // 关联目标实体ID（当类型为独立页面、分类、文章时关联其各自表的主键）

    @Column(name = "link_url", length = 500)
    private String linkUrl; // 自定义跳转超链接（当类型为 EXTERNAL 时使用）

    @Column(name = "icon", length = 100)
    private String icon; // 菜单显示的图标识别码（Emoji 字符串或 Lucide 图标 Key）

    @Column(name = "position", nullable = false, length = 20)
    private String position; // 菜单显示位置：HEADER | FOOTER | SIDEBAR | ADMIN_SIDEBAR

    @Column(name = "sort_order")
    private Integer sortOrder; // 菜单同级展示的排序权重（升序）

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible; // 是否在前台导航中显示出来

    @Column(name = "is_open_new_tab", nullable = false)
    private Boolean isOpenNewTab; // 点击后是否在新浏览器标签页中开启

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 修改时间

    /**
     * 在保存新记录前自动装载系统默认值和创建时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.linkType == null) {
            this.linkType = "PAGE";
        }
        if (this.position == null) {
            this.position = "HEADER";
        }
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.isVisible == null) {
            this.isVisible = true;
        }
        if (this.isOpenNewTab == null) {
            this.isOpenNewTab = false;
        }
    }

    /**
     * 在更新记录前自动重置修改时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
