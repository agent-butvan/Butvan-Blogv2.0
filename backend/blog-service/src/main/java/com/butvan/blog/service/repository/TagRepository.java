package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 标签持久化仓储数据层接口
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * 根据 URL slug 检索标签
     *
     * @param slug 友好短链接
     * @return 标签实体包装
     */
    Optional<Tag> findBySlug(String slug);

    /**
     * 根据名称检索标签
     *
     * @param name 标签名
     * @return 标签实体包装
     */
    Optional<Tag> findByName(String name);
}
