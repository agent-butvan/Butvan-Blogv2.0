package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 工作台仪表盘统计数据 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsVO {

    /** 文章总数 */
    private Long articleCount;

    /** 评论总数 */
    private Long commentCount;

    /** 累计访问量 */
    private Long totalViews;

    /** 订阅者数量（暂无订阅功能，暂为0） */
    private Long subscriberCount;

    /** 最近发布的文章列表 */
    private List<RecentArticleVO> recentArticles;
}