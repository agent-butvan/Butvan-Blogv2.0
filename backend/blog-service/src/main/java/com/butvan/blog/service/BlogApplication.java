package com.butvan.blog.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.properties.SecurityProperties;

@SpringBootApplication(scanBasePackages = "com.butvan.blog")
@EntityScan(basePackages = "com.butvan.blog.pojo.entity")
@EnableJpaRepositories(basePackages = "com.butvan.blog.service.repository")
@EnableConfigurationProperties({WeiXinProperties.class, StorageProperties.class, SecurityProperties.class})
@org.springframework.scheduling.annotation.EnableScheduling
public class BlogApplication {

    @jakarta.annotation.PostConstruct
    public void init() {
        // 强制设置全局 JVM 时区为东八区，保证本地时间计算均以北京时间为准
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Shanghai"));
    }

    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}

