package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.NoteLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 手记点赞记录数据访问层 Repository
 */
public interface NoteLikeRepository extends JpaRepository<NoteLike, Long>, JpaSpecificationExecutor<NoteLike> {

    /**
     * 根据手记 ID + 用户 ID + 时间范围查找最近一条点赞记录（用于已登录用户取消点赞判断）
     *
     * @param noteId   手记 ID
     * @param userId   用户 ID
     * @param since    时间界限（24 小时内）
     * @return 最近一条点赞记录
     */
    Optional<NoteLike> findFirstByNoteIdAndUserIdAndCreatedAtAfter(Long noteId, Long userId, LocalDateTime since);

    /**
     * 根据手记 ID + IP + UA + 时间范围查找最近一条点赞记录（用于游客取消点赞判断）
     *
     * @param noteId    手记 ID
     * @param ipAddress 访客 IP 地址
     * @param userAgent 访客 User-Agent
     * @param since     时间界限（24 小时内）
     * @return 最近一条点赞记录
     */
    Optional<NoteLike> findFirstByNoteIdAndIpAddressAndUserAgentAndCreatedAtAfter(
            Long noteId, String ipAddress, String userAgent, LocalDateTime since);
}
