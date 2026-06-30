package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.FriendLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 友链持久化仓储数据层接口
 */
@Repository
public interface FriendLinkRepository extends JpaRepository<FriendLink, Long>, JpaSpecificationExecutor<FriendLink> {

    /**
     * 查询已批准的友链列表（按排序号倒序）
     *
     * @return 友链列表
     */
    List<FriendLink> findByStatusOrderBySortOrderDesc(String status);

    /**
     * 根据分类查询已批准的友链列表
     *
     * @param category 分类
     * @return 友链列表
     */
    List<FriendLink> findByCategoryAndStatusOrderBySortOrderDesc(String category, String status);

    /**
     * 统计待审核友链数量
     *
     * @return 数量
     */
    long countByStatus(String status);
}