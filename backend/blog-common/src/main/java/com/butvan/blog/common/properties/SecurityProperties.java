package com.butvan.blog.common.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Spring Security 安全放行路径配置属性
 * <p>
 * 绑定 application-security.yml 中 security 前缀下的配置项。
 * 将公开接口路径从 SecurityConfig 硬编码中解耦，
 * 后续新增放行接口只需修改 YAML 配置文件即可。
 * </p>
 *
 * <h3>配置格式</h3>
 * <pre>{@code
 * security:
 *   permit-all-paths:
 *     - "GET /api/articles/**"       # 仅放行 GET 请求
 *     - "POST /api/auth/login"       # 仅放行 POST 请求
 *     - "/uploads/**"                # 放行所有 HTTP 方法
 *     - "/ws/**"                     # 放行所有 HTTP 方法（WebSocket 握手）
 * }</pre>
 *
 * <p>格式规则：
 * <ul>
 *   <li>{@code "METHOD /path"} — 仅放行指定 HTTP 方法的请求</li>
 *   <li>{@code "/path"} — 放行所有 HTTP 方法的请求</li>
 * </ul>
 * </p>
 */
@Data
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    /**
     * 需要公开放行（permitAll）的路径规则列表
     * <p>每条规则格式为 "METHOD /path" 或 "/path"（不带方法则匹配所有方法）</p>
     */
    private List<String> permitAllPaths = new ArrayList<>();
}
