package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 首页场景表 JPA 持久化仓储数据层接口
 */
@Repository
public interface SceneRepository extends JpaRepository<Scene, Long> {

    /**
     * 查询当前激活的场景
     *
     * @param isActive 是否启用
     * @return 激活的场景实体（若无返回空）
     */
    Optional<Scene> findByIsActive(Boolean isActive);

    /**
     * 默认方便查询已激活场景
     *
     * @return 场景实体包装类
     */
    default Optional<Scene> findActiveScene() {
        return findByIsActive(true);
    }
}
