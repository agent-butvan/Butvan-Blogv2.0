package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 媒体文件数据库实体类，映射 blog_media 表，统一管理上传的静态资源
 */
@Entity
@Table(name = "blog_media")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 媒体唯一主键

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName; // 原始文件名（带扩展名）

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath; // 文件存储的相对路径

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl; // 文件的完整外部访问 URL 链接

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // 文件所属分类大类：IMAGE | VIDEO | DOCUMENT | OTHER

    @Column(name = "mime_type", length = 100)
    private String mimeType; // 文件的 MIME 类型（例如 image/png）

    @Column(name = "file_size")
    private Long fileSize; // 文件的大小（单位：字节）

    @Column(name = "width")
    private Integer width; // 如果是图片或视频，存储其像素宽度

    @Column(name = "height")
    private Integer height; // 如果是图片或视频，存储其像素高度

    @Column(name = "alt_text", length = 255)
    private String altText; // 图片替代文本，用于无障碍辅助阅读 (ALT)

    @Column(name = "bucket_name", length = 50)
    private String bucketName; // 存储桶或驱动标识（如 local / aliyun-oss，默认 local）

    @Column(name = "uploader_id")
    private Long uploaderId; // 上传者的用户主键ID

    @Column(name = "source_type", nullable = false, length = 50)
    private String sourceType; // 来源类型/归属模块: ARTICLE|SCENE|USER_AVATAR|SYSTEM_CONFIG|MANUAL

    @Column(name = "source_id")
    private Long sourceId; // 来源实体唯一ID

    @Column(name = "source_detail", length = 255)
    private String sourceDetail; // 详细来源说明文本（如：文章《xxx》的插图）

    @Column(name = "file_hash", length = 64)
    private String fileHash; // 文件内容的 SHA-256 哈希值，用于秒传去重

    @Column(name = "ip_address", length = 50)
    private String ipAddress; // 上传者的客户端 IP 地址

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 上传者客户端 User-Agent

    @Column(name = "status")
    private Integer status; // 文件状态：0-临时(草稿未保存)，1-正常(已关联实体)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 文件的上传完成时间戳

    /**
     * 保存记录前填充初始默认值
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.bucketName == null) {
            this.bucketName = "local";
        }
        if (this.sourceType == null) {
            this.sourceType = "MANUAL";
        }
        if (this.status == null) {
            this.status = 1;
        }
    }
}
