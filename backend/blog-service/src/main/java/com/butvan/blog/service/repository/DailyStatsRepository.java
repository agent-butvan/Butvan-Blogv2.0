package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.DailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.repository.query.Param;
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
     * 利用 PostgreSQL 的 ON CONFLICT 机制进行高效的原子性每日 PV / UV 数据定时覆盖更新
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO blog_daily_stats (stat_date, pv_count, uv_count, created_at, updated_at) " +
            "VALUES (:statDate, :pvCount, :uvCount, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
            "ON CONFLICT (stat_date) " +
            "DO UPDATE SET pv_count = :pvCount, uv_count = :uvCount, updated_at = CURRENT_TIMESTAMP", 
            nativeQuery = true)
    void updateTodayTraffic(@Param("statDate") LocalDate statDate, @Param("pvCount") Long pvCount, @Param("uvCount") Long uvCount);
}
