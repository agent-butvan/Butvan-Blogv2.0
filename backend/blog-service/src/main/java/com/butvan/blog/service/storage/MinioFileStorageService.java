package com.butvan.blog.service.storage;

import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.common.utils.MinioUtils;
import com.butvan.blog.common.properties.StorageProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;

/**
 * MinIO 对象存储实现（纯 Java 类，不依赖 Spring 条件装配）
 * \u003cp\u003e
 * 由 {@link com.butvan.blog.service.config.StorageConfig} 工厂方法根据 storage.type 配置决定是否实例化。
 * \u003c/p\u003e
 */
@Slf4j
public class MinioFileStorageService implements FileStorageService {

    private final StorageProperties storageProperties;
    private final MinioUtils minioUtils;

    /**
     * 构造即连接 MinIO 并确保 Bucket 存在
     */
    public MinioFileStorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        StorageProperties.Minio cfg = storageProperties.getMinio();
        this.minioUtils = new MinioUtils(cfg.getEndpoint(), cfg.getAccessKey(), cfg.getSecretKey());
        this.minioUtils.ensureBucket(cfg.getBucket());
        log.info("MinIO 文件存储已就绪，Bucket: {}", cfg.getBucket());
    }

    @Override
    public String upload(MultipartFile file, String objectName, String contentType) throws IOException {
        String bucket = storageProperties.getMinio().getBucket();
        minioUtils.upload(bucket, objectName, file.getInputStream(), contentType, file.getSize());
        log.info("MinIO 文件上传成功: {}/{}", bucket, objectName);
        return getAccessUrl(objectName);
    }

    @Override
    public String upload(InputStream inputStream, String objectName, String contentType, long size) throws IOException {
        String bucket = storageProperties.getMinio().getBucket();
        minioUtils.upload(bucket, objectName, inputStream, contentType, size);
        log.info("MinIO 文件（流）上传成功: {}/{}", bucket, objectName);
        return getAccessUrl(objectName);
    }

    @Override
    public boolean delete(String objectName) {
        String bucket = storageProperties.getMinio().getBucket();
        return minioUtils.delete(bucket, objectName);
    }

    @Override
    public String getAccessUrl(String objectName) {
        String bucket = storageProperties.getMinio().getBucket();
        // 生成 7 天有效的预签名 URL
        return minioUtils.getPresignedUrl(bucket, objectName, 7, TimeUnit.DAYS);
    }
}
