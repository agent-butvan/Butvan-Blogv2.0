package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.ApiLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * 接口测速日志 JPA 持久化仓储数据层接口
 */
@Repository
public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {

    /**
     * 获取最近 100 次 API 调用的真实平均延迟（耗时）
     * 过滤非空并使用 nativeQuery
     *
     * @return 平均延迟时间(毫秒)
     */
    @Query(value = "SELECT COALESCE(AVG(cost_time), 0.0) FROM (SELECT cost_time FROM api_log ORDER BY created_at DESC LIMIT 100) as recent_logs", nativeQuery = true)
    Double findAverageCostTimeOfRecent();
}
