package com.butvan.blog.common.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * 文件存储服务接口（策略模式）
 * <p>
 * 定义文件上传、删除、访问 URL 获取的标准契约。
 * 不同存储实现（本地磁盘、MinIO、阿里云 OSS 等）均需实现此接口，
 * 通过 {@link com.butvan.blog.common.properties.StorageProperties} 中的 type 配置切换。
 * </p>
 */
public interface FileStorageService {

    /**
     * 上传文件到存储介质
     *
     * @param file         MultipartFile 上传文件
     * @param objectName   存储对象名（如 UUID 文件名，不含路径前缀）
     * @param contentType  MIME 类型
     * @return 文件的访问 URL 或相对路径
     * @throws IOException IO 异常
     */
    String upload(MultipartFile file, String objectName, String contentType) throws IOException;

    /**
     * 从 InputStream 上传文件（适用于非 MultipartFile 场景）
     *
     * @param inputStream  输入流
     * @param objectName   存储对象名
     * @param contentType  MIME 类型
     * @param size         文件大小（字节）
     * @return 文件的访问 URL 或相对路径
     * @throws IOException IO 异常
     */
    String upload(InputStream inputStream, String objectName, String contentType, long size) throws IOException;

    /**
     * 删除存储介质中的文件
     *
     * @param objectName 存储对象名
     * @return true 删除成功，false 失败
     */
    boolean delete(String objectName);

    /**
     * 获取文件的公网访问 URL
     *
     * @param objectName 存储对象名
     * @return 完整的访问 URL，本地存储返回相对路径
     */
    String getAccessUrl(String objectName);
}
