package com.butvan.blog.pojo.vo.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 相册详情 VO（含照片列表，用于管理后台和前台展示）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumVO {

    private Long id; // 相册ID
    private String title; // 相册标题
    private String slug; // URL标识
    private String description; // 描述
    private Long coverImageId; // 封面图媒体ID
    private String coverImageUrl; // 封面图完整访问URL
    private String status; // 状态
    private Integer sortOrder; // 排序权重
    private Long viewCount; // 浏览次数
    private Integer photoCount; // 照片数量
    private List<AlbumPhotoVO> photos; // 照片列表
    private LocalDateTime createdAt; // 创建时间
    private LocalDateTime updatedAt; // 更新时间
}
