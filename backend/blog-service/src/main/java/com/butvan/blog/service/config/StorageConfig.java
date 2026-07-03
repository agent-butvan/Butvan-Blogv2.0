package com.butvan.blog.service.config;

import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.service.storage.LocalFileStorageService;
import com.butvan.blog.service.storage.MinioFileStorageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 文件存储策略工厂配置
 * <p>
 * 唯一依赖 Spring 的地方——根据 storage.type 配置决定装配哪个 FileStorageService 实现。
 * 策略模式的核心选择逻辑以纯 Java 方式执行，两个实现类零框架注解。
 * </p>
 */
@Configuration
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
        if ("minio".equals(type)) {
            return new MinioFileStorageService(storageProperties);
        }
        // 默认：本地磁盘存储
        String uploadDir = System.getProperty("user.dir") + "/uploads";
        return new LocalFileStorageService(uploadDir);
    }
}
