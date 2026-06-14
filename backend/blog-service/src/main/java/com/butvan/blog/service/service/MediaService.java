package com.butvan.blog.service.service;

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
}
