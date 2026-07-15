package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Article;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    /**
     * 判断某个分类下是否存在未删除的文章
     *
     * @param categoryId 分类ID
     * @return 是否存在
     */
    boolean existsByCategoryId(Long categoryId);

    /**
     * 判断某个标签下是否存在未删除的文章
     *
     * @param tagId 标签ID
     * @return 是否存在
     */
    boolean existsByTagsId(Long tagId);

    /**
     * 统计指定状态文章的浏览量总和
     *
     * @param status 文章状态
     * @return 浏览量总和
     */
    @Query("SELECT COALESCE(SUM(a.viewCount), 0) FROM Article a WHERE a.status = :status")
    Long sumViewCountByStatus(String status);

    /**
     * 统计没有分配任何分类的文章数
     */
    long countByCategoryIsNull();

    /**
     * 查询最近发布的文章列表
     *
     * @param status   文章状态
     * @param pageable 分页参数
     * @return 文章列表
     */
    List<Article> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    /**
     * 统计指定作者的文章总数（不含已删除）
     *
     * @param authorId 作者用户 ID
     * @return 文章数量
     */
    long countByAuthorIdAndDeletedAtIsNull(Long authorId);
}
