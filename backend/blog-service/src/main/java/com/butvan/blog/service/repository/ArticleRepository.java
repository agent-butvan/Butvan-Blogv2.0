package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 文章持久化仓储数据层接口，继承 JpaSpecificationExecutor 支持动态多条件 Specification 查询
 */
@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {

    /**
     * 根据文章唯一 slug 查找未删除的文章
     *
     * @param slug 友好短标识
     * @return 文章实体包装
     */
    Optional<Article> findBySlug(String slug);
}
