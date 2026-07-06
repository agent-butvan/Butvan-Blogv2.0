package com.butvan.blog.pojo.vo.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 照片墙 VO（跨相册聚合，按时间线排列）
 * <p>
 * 用于前台「时间线照片墙」页面，
 * 聚合所有已发布相册中的照片，
 * 不区分相册归属，仅按添加时间倒序排列。
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoWallVO {

    private Long id;              // 关联记录ID（blog_album_photo主键）
    private String fileUrl;       // 照片完整访问URL
    private Integer width;        // 图片宽度（px）
    private Integer height;       // 图片高度（px）
    private String caption;       // 照片说明文字
    private String albumTitle;    // 所属相册标题
    private String albumSlug;     // 所属相册slug
    private LocalDateTime createdAt; // 添加时间
}
