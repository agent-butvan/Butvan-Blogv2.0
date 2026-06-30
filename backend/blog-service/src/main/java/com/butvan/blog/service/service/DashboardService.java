package com.butvan.blog.service.service;

import com.butvan.blog.pojo.vo.dashboard.DashboardStatsVO;

/**
 * 工作台仪表盘 Service 接口
 */
public interface DashboardService {

    /**
     * 获取工作台统计数据
     *
     * @return 统计数据 VO
     */
    DashboardStatsVO getDashboardStats();
}