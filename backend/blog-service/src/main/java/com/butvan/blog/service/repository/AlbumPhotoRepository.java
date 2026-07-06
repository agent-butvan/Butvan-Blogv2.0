package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.AlbumPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 相册照片关联表 JPA 持久化仓储数据层接口
 */
@Repository
public interface AlbumPhotoRepository extends JpaRepository<AlbumPhoto, Long> {

    /**
     * 根据相册ID查询所有照片（按排序权重升序）
     *
     * @param albumId 相册ID
     * @return 照片关联列表
     */
    List<AlbumPhoto> findByAlbumIdOrderBySortOrderAsc(Long albumId);

    /**
     * 根据相册ID统计照片数量
     *
     * @param albumId 相册ID
     * @return 照片数量
     */
    int countByAlbumId(Long albumId);

    /**
     * 批量删除指定相册的所有照片关联
     *
     * @param albumId 相册ID
     */
    void deleteByAlbumId(Long albumId);

    /**
     * 检查指定相册中是否已存在某媒体资源关联
     *
     * @param albumId 相册ID
     * @param mediaId 媒体资源ID
     * @return 是否存在
     */
    boolean existsByAlbumIdAndMediaId(Long albumId, Long mediaId);
}
