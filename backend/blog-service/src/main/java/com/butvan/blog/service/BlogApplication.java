package com.butvan.blog.service;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

import com.butvan.blog.common.utils.DotEnvLoader;
import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.properties.SecurityProperties;

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
        // 加载项目根目录的 .env 文件（本地开发生效，生产环境自动跳过）
        DotEnvLoader.load();
        SpringApplication.run(BlogApplication.class, args);
    }
}

