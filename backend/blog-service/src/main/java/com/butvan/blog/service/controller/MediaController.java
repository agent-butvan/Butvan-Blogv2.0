package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 媒体资源管理接口控制器，负责图片或切片文件的上传逻辑
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final MediaService mediaService;

    /**
     * 【管理后台】上传图片或透明 PNG 切片，返回保存后的媒体对象及可供前端预览的 URL
     *
     * @param file 上传的二进制文件
     * @return 统一格式 Result，携带 Media 实体
     */
    @PostMapping("/admin/media/upload")
    public Result<Media> uploadMedia(@RequestParam("file") MultipartFile file) {
        log.info("管理后台上传媒体资源，原始文件名: {}, 大小: {} 字节", file.getOriginalFilename(), file.getSize());
        Media media = mediaService.uploadFile(file);
        return Result.success(media);
    }
}
