package com.butvan.blog.pojo.vo.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 相册照片 VO（单张照片视图）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumPhotoVO {

    private Long id; // 关联记录ID（blog_album_photo主键）
    private Long mediaId; // 媒体资源ID
    private String fileName; // 原始文件名
    private String fileUrl; // 完整访问URL
    private String mimeType; // MIME类型
    private Long fileSize; // 文件大小（字节）
    private Integer width; // 图片宽度（px）
    private Integer height; // 图片高度（px）
    private String altText; // 无障碍替代文字
    private String caption; // 照片说明文字
    private Integer sortOrder; // 排序权重
    private LocalDateTime createdAt; // 添加时间
}
