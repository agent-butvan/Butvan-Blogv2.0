package com.butvan.blog.pojo.entity;

import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 数据库动态连接配置实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "db_connection_config")
public class DbConnectionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 连接名称，如 'local_dev' / 'online_prod'
     */
    @Column(name = "conn_name", nullable = false, unique = true, length = 50)
    private String connName;

    /**
     * JDBC 连接 URL
     */
    @Column(name = "jdbc_url", nullable = false, length = 255)
    private String jdbcUrl;

    /**
     * 数据库账号
     */
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    /**
     * 数据库密码 (对称加密密文)
     */
    @Column(name = "password", nullable = false, length = 150)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
