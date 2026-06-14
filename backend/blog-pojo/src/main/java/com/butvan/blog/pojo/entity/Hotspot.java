package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "blog_homepage_hotspot")
@Data
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scene_id", nullable = false)
    private Long sceneId;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "geometry", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> geometry;

    @Column(name = "hover_tips", length = 255)
    private String hoverTips;

    @Column(name = "redirect_type", nullable = false, length = 50)
    private String redirectType; // 'internal' or 'external'

    @Column(name = "redirect_path", nullable = false, length = 255)
    private String redirectPath;

    @Column(name = "zoom_scale", precision = 3, scale = 2)
    private BigDecimal zoomScale = BigDecimal.valueOf(3.0);

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
