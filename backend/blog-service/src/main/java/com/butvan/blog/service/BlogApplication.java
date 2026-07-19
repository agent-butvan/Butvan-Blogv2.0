package com.butvan.blog.service;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.properties.SecurityProperties;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication(scanBasePackages = "com.butvan.blog")
@EntityScan(basePackages = "com.butvan.blog.pojo.entity")
@EnableJpaRepositories(basePackages = "com.butvan.blog.service.repository")
@EnableConfigurationProperties({WeiXinProperties.class, StorageProperties.class, SecurityProperties.class})
@EnableScheduling
public class BlogApplication {

    @PostConstruct
    public void init() {
        // 强制设置全局 JVM 时区为东八区，保证本地时间计算均以北京时间为准
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
    }

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(BlogApplication.class, args);
    }

    /**
     * 自动向上搜寻并加载 .env 配置文件到 System properties
     */
    private static void loadEnv() {
        File dir = new File(System.getProperty("user.dir"));
        File envFile = null;
        for (int i = 0; i < 5; i++) {
            File file = new File(dir, ".env");
            if (file.exists() && file.isFile()) {
                envFile = file;
                break;
            }
            dir = dir.getParentFile();
            if (dir == null) {
                break;
            }
        }

        if (envFile != null) {
            System.out.println("[EnvLoader] Found .env file at: " + envFile.getAbsolutePath());
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("[EnvLoader] Failed to load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("[EnvLoader] No .env file found in parent directories.");
        }
    }
}

