package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * 分类持久化仓储数据层接口
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * 根据 URL slug 检索分类
     *
     * @param slug 友好短链接
     * @return 分类实体包装
     */
    Optional<Category> findBySlug(String slug);

    /**
     * 根据可见性获取分类列表，支持按 sort_order 升序排序
     *
     * @param isVisible 是否可见
     * @return 分类实体列表
     */
    List<Category> findByIsVisibleOrderBySortOrderAsc(Boolean isVisible);

    /**
     * 判断某个分类下是否含有子级分类
     *
     * @param parentId 父级分类ID
     * @return 是否存在子类
     */
    boolean existsByParentId(Long parentId);
}
