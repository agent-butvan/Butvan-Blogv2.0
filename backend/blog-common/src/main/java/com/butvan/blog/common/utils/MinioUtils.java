package com.butvan.blog.common.utils;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * MinIO 对象存储通用工具类
 * <p>
 * 封装 MinIO Java SDK 的常用操作，包括 Bucket 管理、文件上传/下载/删除、
 * 预签名 URL 生成等。方法均直接抛出原始异常，由调用方决定处理策略。
 * </p>
 *
 * <h3>使用示例</h3>
 * <pre>{@code
 * MinioUtils minioUtils = new MinioUtils(endpoint, accessKey, secretKey);
 *
 * // 确保 Bucket 存在
 * minioUtils.ensureBucket("my-bucket");
 *
 * // 上传文件
 * minioUtils.upload("my-bucket", "avatar/001.jpg", inputStream, "image/jpeg");
 *
 * // 获取预签名 URL（7 天有效）
 * String url = minioUtils.getPresignedUrl("my-bucket", "avatar/001.jpg", 7, TimeUnit.DAYS);
 * }</pre>
 */
@Slf4j
public class MinioUtils {

    private final MinioClient client;

    /**
     * 构造 MinIO 工具类实例
     *
     * @param endpoint  MinIO 服务地址（含协议和端口），如 http://127.0.0.1:9000
     * @param accessKey 访问密钥
     * @param secretKey 秘密密钥
     */
    public MinioUtils(String endpoint, String accessKey, String secretKey) {
        this.client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * 获取底层 MinioClient 实例（用于高级操作）
     */
    public MinioClient getClient() {
        return client;
    }

    // ==================== Bucket 操作 ====================

    /**
     * 检查 Bucket 是否存在
     *
     * @param bucketName 存储桶名称
     * @return true 存在，false 不存在
     */
    public boolean bucketExists(String bucketName) {
        try {
            return client.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        } catch (Exception e) {
            log.error("检查 Bucket [{}] 是否存在异常", bucketName, e);
            return false;
        }
    }

    /**
     * 创建 Bucket（如果不存在则创建）
     *
     * @param bucketName 存储桶名称
     */
    public void ensureBucket(String bucketName) {
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket [{}] 创建成功", bucketName);
            }
        } catch (Exception e) {
            log.error("创建 Bucket [{}] 失败", bucketName, e);
            throw new RuntimeException("MinIO Bucket 创建失败: " + bucketName, e);
        }
    }

    /**
     * 设置 Bucket 的访问策略为公共匿名只读 (ReadOnly)
     *
     * @param bucketName 存储桶名称
     */
    public void setBucketPublicReadOnly(String bucketName) {
        try {
            // 构造 MinIO 公共只读访问策略 JSON（允许匿名下载和定位）
            String policy = "{\n" +
                    "    \"Version\": \"2012-10-17\",\n" +
                    "    \"Statement\": [\n" +
                    "        {\n" +
                    "            \"Effect\": \"Allow\",\n" +
                    "            \"Principal\": {\n" +
                    "                \"AWS\": [\"*\"]\n" +
                    "            },\n" +
                    "            \"Action\": [\n" +
                    "                \"s3:GetBucketLocation\",\n" +
                    "                \"s3:GetObject\"\n" +
                    "            ],\n" +
                    "            \"Resource\": [\n" +
                    "                \"arn:aws:s3:::" + bucketName + "\",\n" +
                    "                \"arn:aws:s3:::" + bucketName + "/*\"\n" +
                    "            ]\n" +
                    "        }\n" +
                    "    ]\n" +
                    "}";
            client.setBucketPolicy(SetBucketPolicyArgs.builder()
                    .bucket(bucketName)
                    .config(policy)
                    .build());
            log.info("已成功将 Bucket [{}] 的访问权限设置为公共只读 Policy", bucketName);
        } catch (Exception e) {
            log.error("设置 Bucket [{}] 公共只读 Policy 失败", bucketName, e);
            throw new RuntimeException("设置 Bucket 只读策略失败: " + bucketName, e);
        }
    }

    // ==================== 对象操作 ====================

    /**
     * 上传文件到 MinIO
     *
     * @param bucketName  存储桶名称
     * @param objectName  对象名（存储路径，如 avatar/001.jpg）
     * @param inputStream 文件输入流
     * @param contentType MIME 类型
     * @param size        文件大小（字节），未知时传 -1
     * @throws IOException IO 异常
     */
    public void upload(String bucketName, String objectName, InputStream inputStream,
                       String contentType, long size) throws IOException {
        try {
            PutObjectArgs.Builder builder = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .contentType(contentType);
            if (size > 0) {
                builder.stream(inputStream, size, -1);
            } else {
                builder.stream(inputStream, -1, 10485760); // 未知大小，分片 10MB
            }
            client.putObject(builder.build());
            log.debug("文件上传成功: {}/{}", bucketName, objectName);
        } catch (Exception e) {
            log.error("MinIO 上传文件失败: {}/{}", bucketName, objectName, e);
            throw new IOException("MinIO 上传失败: " + e.getMessage(), e);
        }
    }

    /**
     * 下载文件
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名
     * @return 文件输入流
     * @throws IOException IO 异常
     */
    public InputStream download(String bucketName, String objectName) throws IOException {
        try {
            return client.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("MinIO 下载文件失败: {}/{}", bucketName, objectName, e);
            throw new IOException("MinIO 下载失败: " + e.getMessage(), e);
        }
    }

    /**
     * 删除单个文件
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名
     * @return true 删除成功，false 失败
     */
    public boolean delete(String bucketName, String objectName) {
        try {
            client.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            log.debug("文件删除成功: {}/{}", bucketName, objectName);
            return true;
        } catch (Exception e) {
            log.error("MinIO 删除文件失败: {}/{}", bucketName, objectName, e);
            return false;
        }
    }

    /**
     * 批量删除文件
     *
     * @param bucketName 存储桶名称
     * @param objectNames 对象名列表
     * @return 删除失败的对象名列表（空列表表示全部成功）
     */
    public List<String> deleteBatch(String bucketName, List<String> objectNames) {
        List<DeleteObject> objects = objectNames.stream()
                .map(DeleteObject::new)
                .collect(Collectors.toList());
        try {
            Iterable<Result<DeleteError>> results = client.removeObjects(
                    RemoveObjectsArgs.builder().bucket(bucketName).objects(objects).build());
            List<String> errors = new java.util.ArrayList<>();
            for (Result<DeleteError> result : results) {
                try {
                    DeleteError error = result.get();
                    errors.add(error.objectName());
                    log.warn("批量删除失败: {}/{}", bucketName, error.objectName());
                } catch (Exception e) {
                    log.error("解析删除结果异常", e);
                }
            }
            return errors;
        } catch (Exception e) {
            log.error("MinIO 批量删除异常", e);
            return objectNames; // 全部失败
        }
    }

    /**
     * 生成预签名 URL（用于临时访问私有文件）
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名
     * @param duration   有效时长
     * @param timeUnit   时间单位
     * @return 预签名 URL
     */
    public String getPresignedUrl(String bucketName, String objectName,
                                  long duration, TimeUnit timeUnit) {
        try {
            return client.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .method(Method.GET)
                    .expiry((int) timeUnit.toSeconds(duration))
                    .build());
        } catch (Exception e) {
            log.error("生成预签名 URL 失败: {}/{}", bucketName, objectName, e);
            return null;
        }
    }

    /**
     * 获取文件信息
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名
     * @return 文件元数据，不存在返回 null
     */
    public StatObjectResponse statObject(String bucketName, String objectName) {
        try {
            return client.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.debug("获取文件信息失败: {}/{}", bucketName, objectName);
            return null;
        }
    }
}
