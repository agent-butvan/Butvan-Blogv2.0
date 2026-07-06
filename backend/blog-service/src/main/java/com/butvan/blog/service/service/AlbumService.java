package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.album.AlbumQueryDTO;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSaveDTO;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSortDTO;
import com.butvan.blog.pojo.dto.album.AlbumSaveDTO;
import com.butvan.blog.pojo.vo.album.AlbumListVO;
import com.butvan.blog.pojo.vo.album.AlbumVO;

/**
 * 相册管理服务层接口
 */
public interface AlbumService {

    /**
     * 创建相册
     *
     * @param dto 相册保存DTO
     * @return 相册详情VO
     */
    AlbumVO createAlbum(AlbumSaveDTO dto);

    /**
     * 更新相册
     *
     * @param id  相册ID
     * @param dto 相册保存DTO
     * @return 相册详情VO
     */
    AlbumVO updateAlbum(Long id, AlbumSaveDTO dto);

    /**
     * 删除相册（级联删除照片关联）
     *
     * @param id 相册ID
     */
    void deleteAlbum(Long id);

    /**
     * 分页查询相册列表（管理后台）
     *
     * @param queryDTO 查询DTO
     * @return 分页结果
     */
    PageResult pageAlbums(AlbumQueryDTO queryDTO);

    /**
     * 根据ID查询相册详情（含照片列表）
     *
     * @param id 相册ID
     * @return 相册详情VO
     */
    AlbumVO getAlbumById(Long id);

    /**
     * 根据slug查询相册详情（前台公开，含照片列表）
     *
     * @param slug URL标识
     * @return 相册详情VO
     */
    AlbumVO getAlbumBySlug(String slug);

    /**
     * 查询前台公开相册列表
     *
     * @return 相册列表VO
     */
    java.util.List<AlbumListVO> listPublicAlbums();

    /**
     * 向相册添加照片
     *
     * @param albumId 相册ID
     * @param dto     照片添加DTO
     * @return 相册详情VO
     */
    AlbumVO addPhoto(Long albumId, AlbumPhotoSaveDTO dto);

    /**
     * 从相册移除照片（仅解除关联，不删除媒体文件）
     *
     * @param albumId 相册ID
     * @param photoId 关联记录ID
     */
    void removePhoto(Long albumId, Long photoId);

    /**
     * 调整相册内照片排序
     *
     * @param albumId 相册ID
     * @param dto     排序DTO
     */
    void sortPhotos(Long albumId, AlbumPhotoSortDTO dto);
}
