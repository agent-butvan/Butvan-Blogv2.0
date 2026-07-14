package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.WechatUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 微信用户关联表 JPA 持久化仓储数据层接口
 */
@Repository
public interface WechatUserRepository extends JpaRepository<WechatUser, Long> {

    /**
     * 根据微信 openid 查询关联记录
     *
     * @param openId 微信公众号用户唯一标识
     * @return 微信用户关联实体
     */
    Optional<WechatUser> findByOpenId(String openId);

    /**
     * 根据系统用户ID查询微信关联记录
     *
     * @param userId 系统用户ID
     * @return 微信用户关联实体
     */
    Optional<WechatUser> findByUserId(Long userId);

    /**
     * 判断 openid 是否已存在
     *
     * @param openId 微信公众号用户唯一标识
     * @return 存在返回 true
     */
    boolean existsByOpenId(String openId);

    /**
     * 根据 openid 查询且状态为已关注的记录
     *
     * @param openId 微信公众号用户唯一标识
     * @param status 关注状态
     * @return 微信用户关联实体
     */
    Optional<WechatUser> findByOpenIdAndStatus(String openId, Integer status);

    /**
     * 统计指定关注状态的用户总数
     *
     * @param status 关注状态
     * @return 符合状态的用户总数
     */
    long countByStatus(Integer status);
}

