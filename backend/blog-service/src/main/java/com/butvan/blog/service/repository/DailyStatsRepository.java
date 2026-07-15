package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.DailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface DailyStatsRepository extends JpaRepository<DailyStats, Long> {

    Optional<DailyStats> findByStatDate(LocalDate statDate);

    /**
     * 查找范围内的每日流量数据，并按日期升序排列
     */
    List<DailyStats> findByStatDateBetweenOrderByStatDateAsc(LocalDate startDate, LocalDate endDate);

    /**
     * 利用 PostgreSQL 的 ON CONFLICT 机制进行高效的原子性每日 PV 计数累加
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO blog_daily_stats (stat_date, pv_count, created_at, updated_at) " +
            "VALUES (CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
            "ON CONFLICT (stat_date) " +
            "DO UPDATE SET pv_count = blog_daily_stats.pv_count + 1, updated_at = CURRENT_TIMESTAMP", 
            nativeQuery = true)
    void incrementTodayPv();
}
