package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 首页场景数据库实体类，映射 blog_homepage_scene 表
 */
@Entity
@Table(name = "blog_homepage_scene")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scene {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 场景唯一ID

    @Column(name = "title", nullable = false, length = 100)
    private String title; // 场景标题，如“我的书房”

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl; // 房间背景图URL（高分辨率）

    @Column(name = "is_active", nullable = false)
    private Boolean isActive; // 是否当前启用（全局唯一为 true）

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 更新时间

    /**
     * 在保存新记录前自动装载系统默认值和创建时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = false;
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
