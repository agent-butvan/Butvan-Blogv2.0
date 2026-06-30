package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 最近文章 VO（用于工作台展示）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentArticleVO {

    /** 文章 ID */
    private Long id;

    /** 文章标题 */
    private String title;

    /** 发布状态：DRAFT | PUBLISHED */
    private String status;

    /** 浏览量 */
    private Long viewCount;

    /** 发布时间 */
    private LocalDateTime publishedAt;
}