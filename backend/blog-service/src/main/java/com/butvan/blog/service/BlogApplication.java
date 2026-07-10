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
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}
