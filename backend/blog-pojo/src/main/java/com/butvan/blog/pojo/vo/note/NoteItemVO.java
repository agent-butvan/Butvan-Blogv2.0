package com.butvan.blog.pojo.vo.note;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

/**
 * 手记列表项视图对象 VO
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NoteItemVO {

    private Long id; // 手记主键 ID

    private String title; // 手记标题

    private String slug; // URL 友好标识

    private String summary; // 摘要简介

    private String coverImageUrl; // 配图 URL（单图兼容）

    private java.util.List<String> coverImageUrls; // 多张配图 URL 数组（最多3张）

    private String mood; // 心情标记

    private String weather; // 天气标记

    private String location; // 位置描述

    private String authorName; // 作者展示昵称

    private String status; // 发布状态

    private Boolean isPinned; // 是否置顶

    private Long viewCount; // 累计浏览量

    private Long likeCount; // 累计点赞数

    private Long commentCount; // 已通过评论数

    private LocalDateTime publishedAt; // 首次发布时间

    private LocalDateTime createdAt; // 创建时间

    private LocalDateTime updatedAt; // 最后修改时间
}
