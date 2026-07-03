package com.butvan.blog.service.storage;

import com.butvan.blog.common.storage.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

/**
 * 本地磁盘文件存储实现（纯 Java 类，不依赖 Spring 条件装配）
 * \u003cp\u003e
 * 由 {@link com.butvan.blog.service.config.StorageConfig} 工厂方法根据 storage.type 配置决定是否实例化。
 * \u003c/p\u003e
 */
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final String uploadDir;

    /**
     * @param uploadDir 上传目录绝对路径
     */
    public LocalFileStorageService(String uploadDir) {
        this.uploadDir = uploadDir;
        ensureUploadDirExists();
    }

    @Override
    public String upload(MultipartFile file, String objectName, String contentType) throws IOException {
        ensureUploadDirExists();
        File destFile = new File(uploadDir, objectName);
        file.transferTo(destFile);
        log.info("本地文件上传成功: {}", destFile.getAbsolutePath());
        return "/uploads/" + objectName;
    }

    @Override
    public String upload(InputStream inputStream, String objectName, String contentType, long size) throws IOException {
        ensureUploadDirExists();
        File destFile = new File(uploadDir, objectName);
        Files.copy(inputStream, destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        log.info("本地文件（流）上传成功: {}", destFile.getAbsolutePath());
        return "/uploads/" + objectName;
    }

    @Override
    public boolean delete(String objectName) {
        String filePath = uploadDir + File.separator + objectName;
        File file = new File(filePath);
        if (file.exists() && file.isFile()) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("本地文件删除成功: {}", filePath);
            } else {
                log.warn("本地文件删除失败: {}", filePath);
            }
            return deleted;
        }
        log.debug("本地文件不存在，无需删除: {}", filePath);
        return true;
    }

    @Override
    public String getAccessUrl(String objectName) {
        return "/uploads/" + objectName;
    }

    /**
     * 确保上传目录存在
     */
    private void ensureUploadDirExists() {
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
}

