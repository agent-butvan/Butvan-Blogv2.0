package com.butvan.blog.service.config;

import com.butvan.blog.service.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * 数据库测试种子数据自动注入器
 * 仅在本地开发开启了 seeding 且数据库为空时自动导入种子数据，避免手动导入的麻烦
 */
@Component
public class DatabaseSeeder {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final ArticleRepository articleRepository;
    private final DataSource dataSource;
    private final ApplicationContext applicationContext;

    @Value("${blog.database.seeding.enabled:false}")
    private boolean seedingEnabled;

    @Autowired
    public DatabaseSeeder(ArticleRepository articleRepository, DataSource dataSource, ApplicationContext applicationContext) {
        this.articleRepository = articleRepository;
        this.dataSource = dataSource;
        this.applicationContext = applicationContext;
    }

    /**
     * 在 Spring Boot 启动就绪后，检查并注入开发种子数据
     */
    @EventListener(ApplicationReadyEvent.class)
    public void seedDatabase() {
        if (!seedingEnabled) {
            log.info("[DatabaseSeeder] 本地数据库种子数据注入已关闭（当前环境为禁用状态）。");
            return;
        }

        try {
            long articleCount = articleRepository.count();
            if (articleCount == 0) {
                log.info("[DatabaseSeeder] 检测到本地数据库文章表为空，开始自动注入开发测试种子数据...");
                Resource resource = applicationContext.getResource("classpath:db/dev-seeds.sql");
                if (resource.exists()) {
                    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(resource);
                    populator.execute(dataSource);
                    log.info("[DatabaseSeeder] 开发测试种子数据注入成功！");
                } else {
                    log.warn("[DatabaseSeeder] 未找到种子数据文件 db/dev-seeds.sql，跳过注入。");
                }
            } else {
                log.info("[DatabaseSeeder] 检测到本地数据库已存在 {} 篇文章数据，跳过种子数据自动注入。", articleCount);
            }
        } catch (Exception e) {
            log.error("[DatabaseSeeder] 注入种子数据时发生异常: ", e);
        }
    }
}
