package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.DbSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 数据库同步日志持久层
 */
public interface DbSyncLogRepository extends JpaRepository<DbSyncLog, Long> {
}
