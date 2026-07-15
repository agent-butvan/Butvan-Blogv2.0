package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * 媒体资源表 JPA 持久化仓储数据层接口
 */
@Repository
public interface MediaRepository extends JpaRepository<Media, Long>, JpaSpecificationExecutor<Media> {

    /**
     * 根据文件哈希查找媒体资源列表
     */
    java.util.List<Media> findByFileHash(String fileHash);

    /**
     * 根据文件哈希统计媒体记录数，用于判断多处引用与去重
     */
    long countByFileHash(String fileHash);

    /**
     * 查询指定状态且创建时间在特定时间点之前的媒体资源
     */
    java.util.List<Media> findByStatusAndCreatedAtBefore(Integer status, java.time.LocalDateTime dateTime);
}
