package com.butvan.blog.service.config;

import com.butvan.blog.common.utils.AesUtils;
import com.butvan.blog.pojo.entity.DbConnectionConfig;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 动态数据库连接池管理器
 * 提供基于 HikariCP 的连接池缓存、热插拔与自动释放能力，防止连接泄露
 */
@Component
@Slf4j
public class DbConnectionManager {

    private final Map<String, HikariDataSource> dataSourceCache = new ConcurrentHashMap<>();

    /**
     * 获取指定配置的动态数据源 (支持缓存)
     *
     * @param config 数据库连接配置
     * @return HikariDataSource 实例
     */
    public DataSource getDataSource(DbConnectionConfig config) {
        return dataSourceCache.computeIfAbsent(config.getConnName(), name -> {
            log.info("开始动态构建 HikariCP 连接池: {}", name);
            HikariConfig hikariConfig = new HikariConfig();
            
            // 基础配置
            hikariConfig.setJdbcUrl(config.getJdbcUrl());
            hikariConfig.setUsername(config.getUsername());
            // 解密落库密码后再使用
            hikariConfig.setPassword(AesUtils.decrypt(config.getPassword()));
            hikariConfig.setDriverClassName("org.postgresql.Driver");

            // 连接池精简调优，保障线上及本地两端资源利用率最优
            hikariConfig.setPoolName("Dynamic-Pool-" + name);
            hikariConfig.setMinimumIdle(1);
            hikariConfig.setMaximumPoolSize(5); 
            hikariConfig.setIdleTimeout(30000); // 30秒闲置物理连接自动释放
            hikariConfig.setConnectionTimeout(10000); // 10秒连接超时上限
            hikariConfig.setValidationTimeout(3000);
            hikariConfig.setConnectionTestQuery("SELECT 1");

            return new HikariDataSource(hikariConfig);
        });
    }

    /**
     * 释放并清空指定的动态数据源连接池缓存
     *
     * @param connName 连接名称
     */
    public void removeDataSource(String connName) {
        HikariDataSource ds = dataSourceCache.remove(connName);
        if (ds != null) {
            try {
                if (!ds.isClosed()) {
                    log.info("注销并关闭动态数据库连接池: {}", connName);
                    ds.close();
                }
            } catch (Exception e) {
                log.error("关闭动态连接池 {} 时发生异常", connName, e);
            }
        }
    }

    /**
     * 测试提供的连接参数是否可用
     *
     * @param jdbcUrl 链接URL
     * @param username 账号
     * @param password 密码 (明文)
     * @return true 代表连接验证成功，否则抛出异常
     */
    public boolean testConnection(String jdbcUrl, String username, String password) {
        HikariDataSource testDs = null;
        try {
            HikariConfig hikariConfig = new HikariConfig();
            hikariConfig.setJdbcUrl(jdbcUrl);
            hikariConfig.setUsername(username);
            hikariConfig.setPassword(password);
            hikariConfig.setDriverClassName("org.postgresql.Driver");
            
            hikariConfig.setMinimumIdle(0);
            hikariConfig.setMaximumPoolSize(1);
            hikariConfig.setConnectionTimeout(5000); // 快速超时
            hikariConfig.setInitializationFailTimeout(1);

            testDs = new HikariDataSource(hikariConfig);
            try (Connection conn = testDs.getConnection()) {
                return conn != null && !conn.isClosed();
            }
        } catch (Exception e) {
            log.error("动态测试连接失败 URL: {}", jdbcUrl, e);
            throw new RuntimeException("测试连接失败: " + e.getMessage(), e);
        } finally {
            if (testDs != null) {
                testDs.close();
            }
        }
    }
}
