package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.media.MediaQueryDTO;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
     * @param file 上传的二进制 file 对象
     * @return 统一格式 Result，携带 Media 实体
     */
    @PostMapping("/admin/media/upload")
    public Result<Media> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sourceType", required = false) String sourceType,
            @RequestParam(value = "sourceId", required = false) Long sourceId,
            @RequestParam(value = "sourceDetail", required = false) String sourceDetail
    ) {
        log.info("管理后台上传媒体资源，原始文件名: {}, 大小: {} 字节, 来源: {}, 关联ID: {}, 详情: {}", 
                file.getOriginalFilename(), file.getSize(), sourceType, sourceId, sourceDetail);
        Media media = mediaService.uploadFile(file, sourceType, sourceId, sourceDetail);
        return Result.success(media);
    }

    /**
     * 【公开】上传图片（用于友链头像等无需登录的场景）
     * 仅允许图片格式，最大 5MB
     *
     * @param file 上传的图片文件
     * @return 统一格式 Result，携带相对路径 /uploads/filename.ext
     */
    @PostMapping("/public/upload/image")
    public Result<String> uploadPublicImage(@RequestParam("file") MultipartFile file) {
        log.info("公开接口上传图片，原始文件名: {}, 大小: {} 字节", 
                file.getOriginalFilename(), file.getSize());
        
        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return Result.error("只支持图片格式");
        }
        
        // 验证文件大小（5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            return Result.error("图片大小不能超过 5MB");
        }
        
        try {
            // 复用现有上传逻辑，但不记录到数据库（因为无用户ID）
            String relativePath = mediaService.uploadFileWithoutDb(file);
            return Result.success(relativePath);
        } catch (Exception e) {
            log.error("公开上传图片失败", e);
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    /**
     * 【管理后台】多条件分页获取已上传媒体资源列表
     *
     * @param queryDTO 包含搜索、分类及页码参数
     * @return 分页列表统一响应
     */
    @GetMapping("/admin/media")
    public Result<PageResult> pageMedia(MediaQueryDTO queryDTO) {
        log.info("管理后台分页获取媒体资源列表，检索参数: {}", queryDTO);
        PageResult pageResult = mediaService.pageMedia(queryDTO);
        return Result.success(pageResult);
    }

    /**
     * 【管理后台】彻底删除单条媒体资源（级联清理物理磁盘文件）
     *
     * @param id 媒体唯一ID
     * @return 成功状态
     */
    @DeleteMapping("/admin/media/{id}")
    public Result<Void> deleteMedia(@PathVariable("id") Long id) {
        log.info("管理后台彻底物理删除媒体资源，ID: {}", id);
        mediaService.deleteMedia(id);
        return Result.success();
    }
}
