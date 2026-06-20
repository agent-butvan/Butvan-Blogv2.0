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
     * 上传单个媒体文件并保存到本地存储，写入数据库
     *
     * @param file 前端表单上传的多部分文件
     * @return 保存成功后的 Media 实体
     */
    Media uploadFile(MultipartFile file);

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
