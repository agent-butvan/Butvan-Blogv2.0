package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.DbConnectionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 数据库连接配置持久层
 */
public interface DbConnectionConfigRepository extends JpaRepository<DbConnectionConfig, Integer> {

    /**
     * 根据连接名称查询配置
     *
     * @param connName 连接名，如 'local_dev' / 'online_prod'
     * @return 数据库连接配置 Optional
     */
    Optional<DbConnectionConfig> findByConnName(String connName);
}
