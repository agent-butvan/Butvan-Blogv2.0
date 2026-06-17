package com.butvan.blog.pojo.vo.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

/**
 * 后台文章管理列表中展示条目的轻量级 VO 载荷
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleItemVO {

    private Long id; // 主键 ID

    private String title; // 标题

    private String slug; // 短链接标识

    private String summary; // 摘要简介

    private String coverImageUrl; // 封面图片地址

    private String categoryName; // 分类名

    private String authorName; // 作者昵称

    private String status; // 发布状态

    private String visibility; // 可见性

    private String contentType; // 介质分类

    private Boolean isPinned; // 是否置顶

    private Boolean isFeatured; // 是否推荐

    private Long viewCount; // 阅读量

    private Long commentCount; // 评论数

    private LocalDateTime publishedAt; // 首次发布日期

    private LocalDateTime createdAt; // 创建日期

    private LocalDateTime updatedAt; // 更新日期
}
