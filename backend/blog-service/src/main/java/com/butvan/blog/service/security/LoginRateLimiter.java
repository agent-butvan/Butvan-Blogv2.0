 package com.butvan.blog.service.security;

import com.butvan.blog.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * 登录频率限制器 — 基于 Redis 滑动窗口
 * <p>
 * 防止暴力枚举密码：同一用户名 5 分钟内最多 5 次失败尝试，
 * 超过限制返回 429 状态码。登录成功后立即清除失败计数。
 * </p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LoginRateLimiter {

    private final StringRedisTemplate stringRedisTemplate;

    /** 滑动窗口时长（分钟） */
    private static final long WINDOW_MINUTES = 5;

    /** 窗口内最大允许失败次数 */
    private static final long MAX_ATTEMPTS = 5;

    /** Redis Key 前缀：按用户名限流 */
    private static final String KEY_PREFIX_USER = "login:fail:user:";

    /** Redis Key 前缀：按客户端 IP 限流 */
    private static final String KEY_PREFIX_IP = "login:fail:ip:";

    /**
     * 登录前校验：检查用户名和 IP 是否超过频率限制
     *
     * @param username  登录用户名
     * @param clientIp  客户端 IP 地址
     * @throws BusinessException 超过限制时抛出 429 异常
     */
    public void checkRateLimit(String username, String clientIp) {
        String userKey = KEY_PREFIX_USER + username;
        String ipKey = KEY_PREFIX_IP + clientIp;

        Long userFails = getCount(userKey);
        if (userFails >= MAX_ATTEMPTS) {
            long remainingSeconds = getRemainingTtl(userKey);
            log.warn("登录频率限制触发 [用户名: {}]，失败 {} 次，剩余冷却 {} 秒", username, userFails, remainingSeconds);
            throw new BusinessException(429, String.format("操作过于频繁，请 %d 分钟后重试", Math.max(remainingSeconds / 60, 1)));
        }

        Long ipFails = getCount(ipKey);
        if (ipFails >= MAX_ATTEMPTS) {
            long remainingSeconds = getRemainingTtl(ipKey);
            log.warn("登录频率限制触发 [IP: {}]，失败 {} 次，剩余冷却 {} 秒", clientIp, ipFails, remainingSeconds);
            throw new BusinessException(429, String.format("操作过于频繁，请 %d 分钟后重试", Math.max(remainingSeconds / 60, 1)));
        }
    }

    /**
     * 登录失败后递增失败计数（用户名 + IP 双维度）
     *
     * @param username 登录用户名
     * @param clientIp 客户端 IP 地址
     */
    public void recordFailure(String username, String clientIp) {
        increment(KEY_PREFIX_USER + username);
        increment(KEY_PREFIX_IP + clientIp);
        log.debug("记录登录失败：用户 [{}]，IP [{}]", username, clientIp);
    }

    /**
     * 登录成功后清除该用户和 IP 的失败计数
     *
     * @param username 登录用户名
     * @param clientIp 客户端 IP 地址
     */
    public void clearFailCount(String username, String clientIp) {
        String userKey = KEY_PREFIX_USER + username;
        String ipKey = KEY_PREFIX_IP + clientIp;
        Boolean deletedUser = stringRedisTemplate.delete(userKey);
        Boolean deletedIp = stringRedisTemplate.delete(ipKey);
        if (Boolean.TRUE.equals(deletedUser) || Boolean.TRUE.equals(deletedIp)) {
            log.debug("已清除登录失败计数：用户 [{}]，IP [{}]", username, clientIp);
        }
    }

    // ---- 内部方法 --------------------------------------------------------

    /**
     * 获取指定 Key 的当前计数值
     */
    private Long getCount(String key) {
        String val = stringRedisTemplate.opsForValue().get(key);
        if (val == null) return 0L;
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    /**
     * 递增计数器，首次写入时自动设置过期时间
     */
    private void increment(String key) {
        Long count = stringRedisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            // 首次写入，设置窗口过期时间
            stringRedisTemplate.expire(key, WINDOW_MINUTES, TimeUnit.MINUTES);
        }
    }

    /**
     * 获取 Key 的剩余 TTL（秒），用于提示用户等待时间
     */
    private long getRemainingTtl(String key) {
        Long ttl = stringRedisTemplate.getExpire(key, TimeUnit.SECONDS);
        return (ttl != null && ttl > 0) ? ttl : 0L;
    }
}
