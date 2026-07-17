package com.butvan.blog.service.storage;

import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.common.utils.MinioUtils;
import com.butvan.blog.common.properties.StorageProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;
import org.springframework.util.StringUtils;

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

    public MinioFileStorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        StorageProperties.Minio cfg = storageProperties.getMinio();
        this.minioUtils = new MinioUtils(cfg.getEndpoint(), cfg.getAccessKey(), cfg.getSecretKey());
        this.minioUtils.ensureBucket(cfg.getBucket());
        if (Boolean.TRUE.equals(cfg.getPublicRead())) {
            this.minioUtils.setBucketPublicReadOnly(cfg.getBucket());
        }
        log.info("MinIO 文件存储已就绪，Bucket: {}", cfg.getBucket());
    }

    @Override
    public String upload(MultipartFile file, String objectName, String category, String contentType) throws IOException {
        String bucket = storageProperties.getMinio().getBucket();
        String actualObjectName = getActualObjectName(category, objectName);
        minioUtils.upload(bucket, actualObjectName, file.getInputStream(), contentType, file.getSize());
        log.info("MinIO 文件上传成功: {}/{}", bucket, actualObjectName);
        return getAccessUrl(actualObjectName);
    }

    @Override
    public String upload(InputStream inputStream, String objectName, String category, String contentType, long size) throws IOException {
        String bucket = storageProperties.getMinio().getBucket();
        String actualObjectName = getActualObjectName(category, objectName);
        minioUtils.upload(bucket, actualObjectName, inputStream, contentType, size);
        log.info("MinIO 文件（流）上传成功: {}/{}", bucket, actualObjectName);
        return getAccessUrl(actualObjectName);
    }

    @Override
    public boolean delete(String objectName) {
        String bucket = storageProperties.getMinio().getBucket();
        return minioUtils.delete(bucket, objectName);
    }

    @Override
    public String getAccessUrl(String objectName) {
        StorageProperties.Minio cfg = storageProperties.getMinio();
        if (Boolean.TRUE.equals(cfg.getPublicRead())) {
            // 公共桶返回直连的永久 URL
            String domain = cfg.getCustomDomain();
            if (org.springframework.util.StringUtils.hasText(domain)) {
                // 使用自定义域名（例如：https://cdn.butvan.com/AVATAR/20260715/uuid.png）
                String base = domain.endsWith("/") ? domain : domain + "/";
                return base + objectName;
            } else {
                // 使用默认端点拼接（例如：http://127.0.0.1:9000/butvan-blog/AVATAR/20260715/uuid.png）
                String endpoint = cfg.getEndpoint();
                String base = endpoint.endsWith("/") ? endpoint : endpoint + "/";
                return base + cfg.getBucket() + "/" + objectName;
            }
        } else {
            // 私有桶，生成 7 天有效的预签名 URL
            String bucket = cfg.getBucket();
            return minioUtils.getPresignedUrl(bucket, objectName, 7, TimeUnit.DAYS);
        }
    }

    @Override
    public boolean testConnection() {
        try {
            String bucket = storageProperties.getMinio().getBucket();
            return minioUtils.bucketExists(bucket);
        } catch (Exception e) {
            log.warn("MinIO 对象存储连通性测试失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 拼接实际的存储对象名（格式：[分类大写]/[当前日期yyyyMMdd]/[原始UUID文件名]）
     */
    private String getActualObjectName(String category, String objectName) {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String cleanCategory = StringUtils.hasText(category) ? category.toUpperCase() : "MANUAL";
        return cleanCategory + "/" + datePrefix + "/" + objectName;
    }
}
