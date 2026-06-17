package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 评论数据库操作数据访问接口 (JPA Repository)
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment> {

    /**
     * 根据文章 ID 与发布状态查询全部可用评论
     *
     * @param articleId 文章唯一主键 ID
     * @param status 评论发布状态 (例如 "APPROVED")
     * @return 升序排序的评论集合列表
     */
    List<Comment> findByArticleIdAndStatusOrderByCreatedAtAsc(Long articleId, String status);

    /**
     * 根据文章 ID 和发布状态统计文章总评论篇数
     *
     * @param articleId 文章唯一主键 ID
     * @param status 评论发布状态 (例如 "APPROVED")
     * @return 审核通过评论的总数记录
     */
    long countByArticleIdAndStatus(Long articleId, String status);
}
