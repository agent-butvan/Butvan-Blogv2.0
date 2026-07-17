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

    /** 手记总数 */
    private Long noteCount;

    /** 最近发布的文章列表 */
    private List<RecentArticleVO> recentArticles;

    /** 系统负载资源指标 */
    private SystemMetricsVO systemMetrics;

    /** AI推理与存储空余指标 */
    private AiStorageMetricsVO aiStorageMetrics;

    /** 7 日流量与访问走势数据 */
    private List<TrafficTrendVO> trafficTrend;

    /** 核心底层服务健康监测状态 */
    private ServiceStatusVO serviceStatus;
}