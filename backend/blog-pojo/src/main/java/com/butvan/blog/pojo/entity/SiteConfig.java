package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 站点配置实体类，映射 blog_site_config 表
 *
 * 以键值对方式存储站点级别的全局配置项，
 * 如 background_image_url、site_name 等。
 */
@Entity
@Table(name = "blog_site_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键ID

    @Column(name = "config_key", nullable = false, length = 100, unique = true)
    private String configKey; // 配置键，如 background_image_url

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue; // 配置值（字符串存储，按 type 解析）

    @Column(name = "config_type", length = 20)
    @Builder.Default
    private String configType = "string"; // 值类型: string|number|json|boolean

    @Column(name = "description", length = 255)
    private String description; // 配置项中文说明

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 更新时间

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
