package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.Article;
import com.butvan.blog.pojo.vo.dashboard.DashboardStatsVO;
import com.butvan.blog.pojo.vo.dashboard.RecentArticleVO;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CommentRepository;
import com.butvan.blog.service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 工作台仪表盘 Service 实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;

    @Override
    public DashboardStatsVO getDashboardStats() {
        log.info("开始获取工作台统计数据...");

        // 1. 统计文章总数（已发布 + 草稿，不包含已删除）
        long articleCount = articleRepository.count();
        log.debug("文章总数: {}", articleCount);

        // 2. 统计评论总数
        long commentCount = commentRepository.count();
        log.debug("评论总数: {}", commentCount);

        // 3. 统计累计访问量（所有已发布文章的 view_count 之和）
        Long totalViews = articleRepository.sumViewCountByStatus("PUBLISHED");
        if (totalViews == null) {
            totalViews = 0L;
        }
        log.debug("累计访问量: {}", totalViews);

        // 4. 订阅者数量（暂无订阅功能，暂为 0）
        long subscriberCount = 0L;
        log.debug("订阅者数量: {}", subscriberCount);

        // 5. 获取最近发布的 5 篇文章
        List<Article> recentArticles = articleRepository
                .findByStatusOrderByPublishedAtDesc("PUBLISHED", PageRequest.of(0, 5));

        List<RecentArticleVO> recentArticleVOList = recentArticles.stream()
                .map(article -> RecentArticleVO.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .status(article.getStatus())
                        .viewCount(article.getViewCount() != null ? article.getViewCount() : 0L)
                        .publishedAt(article.getPublishedAt())
                        .build())
                .collect(Collectors.toList());
        log.debug("最近文章数: {}", recentArticleVOList.size());

        log.info("工作台统计数据获取完成");

        return DashboardStatsVO.builder()
                .articleCount(articleCount)
                .commentCount(commentCount)
                .totalViews(totalViews)
                .subscriberCount(subscriberCount)
                .recentArticles(recentArticleVOList)
                .build();
    }
}