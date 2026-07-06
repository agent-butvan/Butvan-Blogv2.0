package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.AlbumPhoto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * 分页查询所有已发布相册中的照片（JOIN 媒体资源 + 相册，按添加时间倒序）
     *
     * @param pageable 分页参数
     * @return 分页结果（Object[]: AlbumPhoto, Media, Album.title, Album.slug）
     */
    @Query("SELECT ap, m.fileUrl, m.width, m.height, a.title, a.slug " +
           "FROM AlbumPhoto ap " +
           "JOIN Media m ON ap.mediaId = m.id " +
           "JOIN Album a ON ap.albumId = a.id " +
           "WHERE a.status = 'PUBLISHED' " +
           "ORDER BY ap.createdAt DESC")
    Page<Object[]> findPublishedPhotosWithMedia(Pageable pageable);
}
