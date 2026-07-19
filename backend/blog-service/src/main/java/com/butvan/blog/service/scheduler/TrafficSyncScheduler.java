package com.butvan.blog.service.scheduler;

import com.butvan.blog.service.repository.DailyStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

/**
 * 每日流量访问（PV/UV）Redis 缓存数据定时同步回刷到数据库的任务调度器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TrafficSyncScheduler {

    private final StringRedisTemplate stringRedisTemplate;
    private final DailyStatsRepository dailyStatsRepository;

    /**
     * 每 5 分钟同步一次今天与昨天的流量访问数据到数据库，做平滑缓冲
     */
    @Scheduled(cron = "0 0/5 * * * ?")
    public void syncTrafficData() {
        log.info("【流量统计定时同步】开始同步 Redis 流量数据至数据库...");
        
        // 同步过去两天（今天、昨天）的数据，避免临界点跨天时的数据漏记
        syncDateTraffic(LocalDate.now());
        syncDateTraffic(LocalDate.now().minusDays(1));
        
        log.info("【流量统计定时同步】Redis 流量数据同步完成");
    }

    /**
     * 同步指定日期的 PV 与 UV 数据至数据库中，并为 Redis 键设置 7 天生存期
     */
    private void syncDateTraffic(LocalDate date) {
        String dateStr = date.toString();
        String pvKey = "blog:traffic:pv:" + dateStr;
        String uvKey = "blog:traffic:uv:" + dateStr;

        try {
            // 1. 读取 PV 计数
            String pvVal = stringRedisTemplate.opsForValue().get(pvKey);
            long pvCount = 0;
            if (pvVal != null) {
                pvCount = Long.parseLong(pvVal);
            }

            // 2. 读取 HyperLogLog 估算的去重 UV 计数
            Long uvCount = stringRedisTemplate.opsForHyperLogLog().size(uvKey);
            if (uvCount == null) {
                uvCount = 0L;
            }

            // 3. 如果 PV 有访问，或者 UV 存在，则刷回数据库
            if (pvCount > 0 || uvCount > 0) {
                dailyStatsRepository.updateTodayTraffic(date, pvCount, uvCount);
                log.debug("【流量统计】同步日期 [{}] 完成，PV: {}, UV: {}", dateStr, pvCount, uvCount);
            }

            // 4. 设置 Redis 键生命周期为 7 天，防无限制堆积
            stringRedisTemplate.expire(pvKey, 7, TimeUnit.DAYS);
            stringRedisTemplate.expire(uvKey, 7, TimeUnit.DAYS);

        } catch (Exception e) {
            log.error("【流量统计】同步日期 [{}] 访问统计至数据库发生异常: ", dateStr, e);
        }
    }
}
