package com.butvan.blog.pojo.vo.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 相册列表 VO（精简版，用于前台列表展示）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumListVO {

    private Long id; // 相册ID
    private String title; // 相册标题
    private String slug; // URL标识
    private String description; // 描述
    private String coverImageUrl; // 封面图URL
    private Integer photoCount; // 照片数量
    private LocalDateTime createdAt; // 创建时间
}
