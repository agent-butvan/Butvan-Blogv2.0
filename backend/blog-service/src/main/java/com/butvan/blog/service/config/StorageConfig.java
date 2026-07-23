package com.butvan.blog.service.config;

import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.service.storage.LocalFileStorageService;
import com.butvan.blog.service.storage.MinioFileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 文件存储策略工厂配置
 * <p>
 * 根据 storage.type 配置决定装配哪个 FileStorageService 实现。
 * 支持在 MinIO 连接超时/服务不可达时自动容灾降级为本地磁盘存储，确保系统极高可用性。
 * </p>
 */
@Configuration
@Slf4j
public class StorageConfig {

    /**
     * 根据配置创建对应的文件存储实现 Bean
     *
     * @param storageProperties 存储配置（由 Spring 自动绑定 application-storage.yml）
     * @return FileStorageService 实例
     */
    @Bean
    public FileStorageService fileStorageService(StorageProperties storageProperties) {
        String type = storageProperties.getType();
        if ("minio".equalsIgnoreCase(type)) {
            try {
                log.info("🔍 尝试初始化 MinIO 对象存储服务 (Endpoint: {})...", storageProperties.getMinio().getEndpoint());
                MinioFileStorageService minioService = new MinioFileStorageService(storageProperties);
                if (minioService.testConnection()) {
                    log.info("✅ MinIO 对象存储初始化连通正常，分配模式: MinIO");
                    return minioService;
                } else {
                    log.warn("⚠️ MinIO 连通性测试未通过，自动触发降级机制!");
                }
            } catch (Exception e) {
                log.warn("⚠️ MinIO 对象存储初始化/连接超时 ({})，系统自动启动容灾降级方案 -> 切换为【本地磁盘存储】", e.getMessage());
            }
        }
        // 默认 / 降级：本地磁盘存储
        String uploadDir = System.getProperty("user.dir") + "/uploads";
        log.info("📁 当前已激活文件存储模式: 【本地磁盘存储】(存储路径: {})", uploadDir);
        return new LocalFileStorageService(uploadDir);
    }
}
