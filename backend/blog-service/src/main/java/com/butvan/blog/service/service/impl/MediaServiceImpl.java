package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.repository.MediaRepository;
import com.butvan.blog.service.service.MediaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 媒体资源管理服务实现类
 */
@Service
@Slf4j
public class MediaServiceImpl implements MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp", "bmp");

    @Override
    @Transactional
    public Media uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("上传的文件不能为空");
        }

        // 1. 获取原文件名及文件后缀
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名为空，上传失败");
        }
        
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        // 2. 生成唯一的 UUID 文件名
        String newFilename = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

        // 3. 构建本地存储路径
        String userDir = System.getProperty("user.dir");
        String uploadDirPath = userDir + File.separator + "uploads";
        File uploadDir = new File(uploadDirPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destFile = new File(uploadDir, newFilename);
        try {
            // 4. 保存文件到本地
            file.transferTo(destFile);
            log.info("文件上传成功: {}", destFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("文件物理存储失败", e);
            throw new BusinessException("文件上传写入磁盘失败：" + e.getMessage());
        }

        // 5. 判定文件类型并拼装 URL 相对地址
        String fileType = "OTHER";
        if (IMAGE_EXTENSIONS.contains(extension)) {
            fileType = "IMAGE";
        }
        
        // 相对路径，前端可直接根据 baseURL 自行加载
        String relativePath = "/uploads/" + newFilename;

        // 6. 持久化记录到数据库中
        Media media = Media.builder()
                .fileName(originalFilename)
                .filePath(destFile.getAbsolutePath())
                .fileUrl(relativePath)
                .fileType(fileType)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .bucketName("local")
                .build();

        return mediaRepository.save(media);
    }
}
