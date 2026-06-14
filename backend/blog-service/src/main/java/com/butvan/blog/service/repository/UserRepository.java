package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 用户表 JPA 持久化仓储数据层接口
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查询用户实体记录
     *
     * @param username 登录用户名
     * @return 包含用户实体的 Optional 容器
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据电子邮箱查询用户实体记录
     *
     * @param email 邮箱地址
     * @return 包含用户实体的 Optional 容器
     */
    Optional<User> findByEmail(String email);

    /**
     * 校验用户名是否已存在于数据库记录中
     *
     * @param username 待校验的用户名
     * @return 存在返回 true，否则 false
     */
    boolean existsByUsername(String username);

    /**
     * 校验电子邮箱是否已存在于数据库记录中
     *
     * @param email 待校验的邮箱
     * @return 存在返回 true，否则 false
     */
    boolean existsByEmail(String email);
}
