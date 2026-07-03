package com.butvan.blog.common.config;

import org.springframework.context.annotation.Configuration;

/**
 * Redis 基础配置类
 * <p>
 * {@link org.springframework.data.redis.core.StringRedisTemplate} 由 Spring Boot
 * 自动配置，无需手动声明 Bean。本类仅作为占位标识，后续如需自定义
 * RedisTemplate 或连接工厂时可在此扩展。
 * </p>
 */
@Configuration
public class RedisConfig {
    // StringRedisTemplate 自动配置已就绪，无需额外 Bean 定义
}
