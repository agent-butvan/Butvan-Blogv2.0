package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.media.MediaQueryDTO;
import com.butvan.blog.pojo.entity.Media;
import org.springframework.web.multipart.MultipartFile;

/**
 * 媒体资源管理服务层接口
 */
public interface MediaService {

    /**
     * 上传单个媒体文件并保存到本地存储，写入数据库（包含引用来源自动标记）
     *
     * @param file 前端表单上传的多部分文件
     * @param sourceType 来源类型/归属模块
     * @param sourceId 来源关联ID
     * @param sourceDetail 详细描述说明
     * @return 保存成功后的 Media 实体
     */
    Media uploadFile(MultipartFile file, String sourceType, Long sourceId, String sourceDetail);

    /**
     * 上传图片但不记录到数据库（用于公开上传场景，如友链头像）
     * 仅支持图片格式，返回相对路径 /uploads/filename.ext
     *
     * @param file 上传的图片文件
     * @return 相对路径
     */
    String uploadFileWithoutDb(MultipartFile file);

    /**
     * 分页多条件检索媒体资源列表
     *
     * @param queryDTO 分页与大类、关键词过滤条件
     * @return 分页统一响应 PageResult
     */
    PageResult pageMedia(MediaQueryDTO queryDTO);

    /**
     * 根据主键物理彻底删除单条媒体资源及对应磁盘文件
     *
     * @param id 媒体唯一ID
     */
    void deleteMedia(Long id);
}
