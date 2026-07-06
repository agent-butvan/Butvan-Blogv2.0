package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.SiteConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 站点配置持久化仓储数据层接口
 */
@Repository
public interface SiteConfigRepository extends JpaRepository<SiteConfig, Long> {

    /**
     * 根据配置键查询配置项
     *
     * @param configKey 配置键，如 background_image_url
     * @return 配置项实体，不存在时返回 Optional.empty()
     */
    Optional<SiteConfig> findByConfigKey(String configKey);
}
