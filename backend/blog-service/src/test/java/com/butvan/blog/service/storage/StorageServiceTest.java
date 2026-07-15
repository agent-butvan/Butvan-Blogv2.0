package com.butvan.blog.service.storage;

import com.butvan.blog.common.properties.StorageProperties;
import org.junit.jupiter.api.Test;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class StorageServiceTest {

    @Test
    public void testMinioAccessUrl() throws Exception {
        // 1. 初始化 MinIO 配置，直接从开发环境已有的配置来实例化
        StorageProperties properties = new StorageProperties();
        properties.setType("minio");
        
        StorageProperties.Minio minioCfg = properties.getMinio();
        minioCfg.setEndpoint("http://47.102.205.85:19000");
        minioCfg.setAccessKey("minio");
        minioCfg.setSecretKey("wj08265395");
        minioCfg.setBucket("blog2");
        minioCfg.setPublicRead(true); // 开启公共只读
        
        // 2. 初始化 MinioFileStorageService（这里会触发 ensureBucket 和 setBucketPublicReadOnly 桶策略设置）
        System.out.println("正在连接 MinIO 并应用桶只读策略...");
        MinioFileStorageService storageService = new MinioFileStorageService(properties);
        
        // 3. 生成测试文件的直连直调永久只读链接
        String objectName = "87a371bd-7bb1-425c-a161-af27112b5b41.png";
        String accessUrl = storageService.getAccessUrl(objectName);
        System.out.println("生成的直连永久访问 URL 为: " + accessUrl);
        
        // 4. 使用 HTTP GET 方式去请求生成的永久只读连接，验证其返回值
        URL url = new URL(accessUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        
        int responseCode = connection.getResponseCode();
        System.out.println("HTTP 请求返回状态码: " + responseCode);
        
        // 读取部分流数据，判断是图片流还是 XML 报错信息
        try (InputStream is = connection.getInputStream()) {
            byte[] buffer = new byte[200];
            int read = is.read(buffer);
            String snippet = new String(buffer, 0, Math.max(0, read));
            System.out.println("返回内容前缀截取: " + snippet);
            if (snippet.contains("<?xml") || snippet.contains("<Error>")) {
                System.err.println("⚠️ 测试失败：返回的似乎依然是 XML 报错数据！");
            } else {
                System.out.println("🎉 测试成功：返回的数据不是 XML，图片资源已被成功公开读取！");
            }
        } finally {
            connection.disconnect();
        }
    }
}
