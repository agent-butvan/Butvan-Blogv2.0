package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日流量统计实体，映射 blog_daily_stats 表
 */
@Entity
@Table(name = "blog_daily_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键 ID

    @Column(name = "stat_date", nullable = false, unique = true)
    private LocalDate statDate; // 统计日期

    @Column(name = "pv_count")
    private Long pvCount; // 访问量 (PV)

    @Column(name = "uv_count")
    private Long uvCount; // 独立访客量 (UV)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 更新时间

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.pvCount == null) {
            this.pvCount = 0L;
        }
        if (this.uvCount == null) {
            this.uvCount = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
