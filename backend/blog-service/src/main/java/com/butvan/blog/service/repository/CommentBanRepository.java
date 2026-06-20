package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.CommentBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 评论封禁拦截数据访问接口
 */
@Repository
public interface CommentBanRepository extends JpaRepository<CommentBan, Long> {

    /**
     * 根据邮箱判断是否被封禁
     */
    boolean existsByEmail(String email);

    /**
     * 根据 IP 地址判断是否被封禁
     */
    boolean existsByIpAddress(String ipAddress);

    /**
     * 根据邮箱查询封禁记录
     */
    Optional<CommentBan> findByEmail(String email);

    /**
     * 根据 IP 查询封禁记录
     */
    Optional<CommentBan> findByIpAddress(String ipAddress);
}
