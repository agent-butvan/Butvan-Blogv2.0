package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.vo.dashboard.DashboardStatsVO;
import com.butvan.blog.service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 工作台仪表盘 Controller
 * 提供博客系统运营数据的统计接口
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 获取工作台统计数据
     * - 文章总数
     * - 评论总数
     * - 累计访问量
     * - 订阅者数量
     * - 最近发布的文章列表
     *
     * @return 统计数据 VO
     */
    @GetMapping("/dashboard")
    public Result<DashboardStatsVO> getDashboardStats() {
        log.info("获取工作台统计数据 API 请求");
        DashboardStatsVO stats = dashboardService.getDashboardStats();
        return Result.success(stats);
    }
}