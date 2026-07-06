package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 相册照片关联实体类，映射 blog_album_photo 表
 * 维护相册与媒体资源的多对多关联关系
 */
@Entity
@Table(name = "blog_album_photo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 主键ID

    @Column(name = "album_id", nullable = false)
    private Long albumId; // 所属相册ID

    @Column(name = "media_id", nullable = false)
    private Long mediaId; // 关联媒体资源ID（复用blog_media表）

    @Column(name = "caption", length = 255)
    private String caption; // 照片说明文字

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0; // 在相册中的排序权重

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 添加时间

    /**
     * 多对一关联：所属相册（仅用于查询导航，不参与持久化写入）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", insertable = false, updatable = false)
    private Album album;

    /**
     * 多对一关联：关联的媒体资源（仅用于查询导航，不参与持久化写入）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", insertable = false, updatable = false)
    private Media media;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
