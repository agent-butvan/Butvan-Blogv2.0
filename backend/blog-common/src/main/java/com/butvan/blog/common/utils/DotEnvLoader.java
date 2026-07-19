package com.butvan.blog.common.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * .env 环境变量文件加载工具
 *
 * <p>设计目标：在 Spring Boot 启动前，自动加载项目根目录下的 .env 文件，
 * 将其中的 KEY=VALUE 键值对注入为 JVM System Properties，
 * 使 Spring Boot 的 ${KEY:default} 占位符能够正确解析。</p>
 *
 * <h3>优先级机制（兼容本地开发与生产部署）</h3>
 * <ul>
 *   <li>生产环境（Docker）：通过 docker-compose 注入的真实 OS 环境变量优先级高于 System Properties，
 *       即使 .env 被误打包也不会覆盖真实环境变量</li>
 *   <li>本地开发：无 OS 环境变量时，从 .env 加载的 System Properties 生效，
 *       覆盖 YAML 中的默认值</li>
 * </ul>
 *
 * <h3>.env 文件定位策略</h3>
 * <p>从 JVM 工作目录（user.dir）开始，逐级向上遍历父目录查找 .env 文件，
 * 最多向上查找 5 层。无论 IDE 将工作目录设为项目根目录、backend/ 还是
 * backend/blog-service/，都能可靠找到项目根目录下的 .env。</p>
 *
 * @author butvan
 */
public final class DotEnvLoader {

    /** 向上查找的最大目录层级数 */
    private static final int MAX_DEPTH = 5;

    private DotEnvLoader() {
        // 工具类禁止实例化
    }

    /**
     * 加载 .env 文件到 System Properties
     *
     * <p>在 SpringApplication.run() 调用前执行。
     * 只有当对应的 OS 环境变量不存在时，才设置 System Property，
     * 确保生产环境的真实环境变量始终优先。</p>
     */
    public static void load() {
        Path envFile = findEnvFile();
        if (envFile == null) {
            return;
        }

        Properties props = new Properties();
        try (BufferedReader reader = Files.newBufferedReader(envFile, StandardCharsets.UTF_8)) {
            props.load(reader);
        } catch (IOException e) {
            System.err.println("[DotEnvLoader] 读取 .env 文件失败: " + e.getMessage());
            return;
        }

        int loaded = 0;
        for (String key : props.stringPropertyNames()) {
            // 仅在 OS 环境变量未设置时才注入，保证生产环境变量优先
            if (System.getenv(key) == null) {
                System.setProperty(key, props.getProperty(key));
                loaded++;
            }
        }

        System.out.println("[DotEnvLoader] 已从 " + envFile.toAbsolutePath()
                + " 加载 " + loaded + " 个环境变量");
    }

    /**
     * 从当前工作目录开始，逐级向上查找 .env 文件
     *
     * @return .env 文件的 Path，未找到时返回 null
     */
    private static Path findEnvFile() {
        Path dir = Paths.get(System.getProperty("user.dir")).toAbsolutePath();

        for (int i = 0; i <= MAX_DEPTH && dir != null; i++) {
            Path candidate = dir.resolve(".env");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
            dir = dir.getParent();
        }

        System.out.println("[DotEnvLoader] 未找到 .env 文件，跳过加载（生产环境正常行为）");
        return null;
    }
}
