package com.butvan.blog.pojo.entity;

import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 数据库同步操作日志实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "db_sync_log")
public class DbSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 操作类型：'SCHEMA' / 'DATA'
     */
    @Column(name = "op_type", nullable = false, length = 20)
    private String opType;

    /**
     * 操作表名，如 'article'
     */
    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    /**
     * 同步 SQL
     */
    @Column(name = "sql_sync", nullable = false, columnDefinition = "TEXT")
    private String sqlSync;

    /**
     * 回退 SQL
     */
    @Column(name = "sql_rollback", nullable = false, columnDefinition = "TEXT")
    private String sqlRollback;

    /**
     * 操作人
     */
    @Column(name = "operator", nullable = false, length = 50)
    private String operator;

    /**
     * 状态：'SUCCESS' / 'FAILED' / 'ROLLED_BACK'
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
