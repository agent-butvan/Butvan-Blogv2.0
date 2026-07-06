package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 相册表 JPA 持久化仓储数据层接口
 */
@Repository
public interface AlbumRepository extends JpaRepository<Album, Long>, JpaSpecificationExecutor<Album> {

    /**
     * 根据 slug 查询相册
     *
     * @param slug URL标识
     * @return 相册实体
     */
    Optional<Album> findBySlug(String slug);
}
