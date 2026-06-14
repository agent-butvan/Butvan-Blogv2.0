package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 媒体资源表 JPA 持久化仓储数据层接口
 */
@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
}
