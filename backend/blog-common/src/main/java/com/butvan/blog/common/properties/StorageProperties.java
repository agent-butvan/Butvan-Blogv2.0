package com.butvan.blog.common.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 文件存储配置属性映射
 * <p>
 * 绑定 application-storage.yml 中 storage 前缀下的配置项，
 * 支持本地存储与 MinIO 对象存储的动态切换。
 * 后续扩展其他存储类型（如阿里云 OSS、七牛云）只需新增配置字段并实现 FileStorageService。
 * </p>
 */
@Data
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    /** 存储类型：local（本地磁盘）| minio（MinIO 对象存储） */
    private String type = "local";

    /** MinIO 连接配置（仅 type=minio 时生效） */
    private Minio minio = new Minio();

    @Data
    public static class Minio {

        /** MinIO 服务地址（含协议和端口），如 http://127.0.0.1:9000 */
        private String endpoint;

        /** 访问密钥（Access Key） */
        private String accessKey;

        /** 秘密密钥（Secret Key） */
        private String secretKey;

        /** 默认存储桶名称 */
        private String bucket = "butvan-blog";
    }
}
