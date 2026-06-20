package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.ArticleLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 文章点赞记录表 JPA 持久化仓储数据层接口
 */
@Repository
public interface ArticleLikeRepository extends JpaRepository<ArticleLike, Long>, JpaSpecificationExecutor<ArticleLike> {

    /**
     * 判断某个 IP 地址与特定 UA（设备标识）在指定时间段之后是否已对某篇文章进行了点赞
     * 用于 24 小时防刷赞策略校验
     *
     * @param articleId 文章 ID
     * @param ipAddress 访客 IP 物理地址
     * @param userAgent 访客设备浏览器指纹（User-Agent）信息
     * @param time      起始过滤限制时间 (如当前时间减去 24 小时)
     * @return 是否已存在点赞记录
     */
    boolean existsByArticleIdAndIpAddressAndUserAgentAndCreatedAtAfter(
            Long articleId, String ipAddress, String userAgent, LocalDateTime time
    );

    /**
     * 判断某个已登录用户在指定时间段之后是否已对特定文章进行了点赞
     * 用于登录状态下的 24 小时防刷赞策略校验
     *
     * @param articleId 文章 ID
     * @param userId    点赞绑定的用户 ID
     * @param time      起始过滤限制时间
     * @return 是否已存在点赞记录
     */
    boolean existsByArticleIdAndUserIdAndCreatedAtAfter(Long articleId, Long userId, LocalDateTime time);

    /**
     * 获取特定 IP + UA 在指定时间后的第一条点赞流水，供取消点赞使用
     *
     * @param articleId 文章 ID
     * @param ipAddress 访客 IP 地址
     * @param userAgent 访客设备浏览器指纹 (UA)
     * @param time      起始限制时间
     * @return 点赞流水记录 Optional 包装
     */
    Optional<ArticleLike> findFirstByArticleIdAndIpAddressAndUserAgentAndCreatedAtAfter(
            Long articleId, String ipAddress, String userAgent, LocalDateTime time
    );

    /**
     * 获取特定已登录用户在指定时间后的第一条点赞流水，供取消点赞使用
     *
     * @param articleId 文章 ID
     * @param userId    点赞关联用户唯一 ID
     * @param time      起始限制时间
     * @return 点赞流水记录 Optional 包装
     */
    Optional<ArticleLike> findFirstByArticleIdAndUserIdAndCreatedAtAfter(
            Long articleId, Long userId, LocalDateTime time
    );
}
