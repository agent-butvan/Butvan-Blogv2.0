package com.butvan.blog.service.security;

import com.butvan.blog.service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.butvan.blog.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Spring Security 核心体系安全拦截与机制配置类
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * 配置 UserDetailsService，对接 JPA 的 UserRepository 查询逻辑
     *
     * @return UserDetailsService bean
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPasswordHash())
                        .roles(user.getRole())
                        .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                        .build()
                )
                .orElseThrow(() -> new UsernameNotFoundException("用户名不存在: " + username));
    }

    /**
     * 声明 BCrypt 密码加密器 Bean
     *
     * @return PasswordEncoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 声明 AuthenticationManager 用于认证管理
     *
     * @param config 认证配置
     * @return AuthenticationManager
     * @throws Exception 异常
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 配置过滤规则与安全屏障链
     *
     * @param http HttpSecurity 配置对象
     * @param jwtAuthFilter 自定义 JWT 过滤器
     * @return 过滤链 SecurityFilterChain
     * @throws Exception 配置异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            // 禁用 CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 启用 CORS 跨域规则，对接 WebMvcConfig 中定义的全局策略
            .cors(Customizer.withDefaults())
            // 禁用 Session，启用 Stateless 无状态模式
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 设定安全请求过滤匹配规则
            .authorizeHttpRequests(auth -> auth
                    // 放行认证模块接口
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                    // 前台获取导航菜单完全公开（仅限 GET 读取）
                    .requestMatchers(HttpMethod.GET, "/api/navigations/**").permitAll()
                    // 放行前台获取首页活跃房间场景 API
                    .requestMatchers(HttpMethod.GET, "/api/scenes/active").permitAll()
                    // 放行前台获取公开用户资料 API
                    .requestMatchers(HttpMethod.GET, "/api/profile/public/**").permitAll()
                    // 放行前台公开站点配置查询 API（如背景图片URL等）
                    .requestMatchers(HttpMethod.GET, "/api/site-config/public/**").permitAll()
                    // 放行前台文章、分类、标签的 GET 查询请求
                    .requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/tags/**").permitAll()
                    // 放行前台评论相关的提交和点赞接口
                    .requestMatchers(HttpMethod.POST, "/api/articles/*/comments").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/comments/*/like").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/articles/*/like").permitAll()
                    // 放行前台友链接口（GET 查询 + POST 申请）
                    .requestMatchers(HttpMethod.GET, "/api/friends/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/friends/apply").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/friends/fetch-meta").permitAll()
                    // 放行前台相册公开接口（GET 查询）
                    .requestMatchers(HttpMethod.GET, "/api/public/albums/**").permitAll()
                    // 放行前台手记公开接口（GET 查询）
                    .requestMatchers(HttpMethod.GET, "/api/notes/**").permitAll()
                    // 放行前台照片墙公开接口（GET 查询）
                    .requestMatchers(HttpMethod.GET, "/api/public/photos/**").permitAll()
                    // 放行微信登录二维码获取接口（无需登录即可扫码）
                    .requestMatchers(HttpMethod.POST, "/api/weixin/login").permitAll()
                    // 放行公开图片上传接口（友链头像等无需登录的场景）
                    .requestMatchers(HttpMethod.POST, "/api/public/upload/image").permitAll()
                    // 放行本地静态图片映射路径
                    .requestMatchers("/uploads/**").permitAll()
                    // 其它任何后台 API 均需校验 Bearer Token 权限身份
                    .anyRequest().authenticated()
            )
            // 配置未认证和未授权时的统一 JSON 响应体
            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.setContentType("application/json;charset=UTF-8");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write(objectMapper.writeValueAsString(Result.error(401, "未授权，请重新登录")));
                    })
                    .accessDeniedHandler((request, response, accessDeniedException) -> {
                        response.setContentType("application/json;charset=UTF-8");
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.getWriter().write(objectMapper.writeValueAsString(Result.error(403, "无权限访问该资源")));
                    })
            )
            // 将 JWT 过滤器放置在 Spring Security 默认表单拦截器 UsernamePasswordAuthenticationFilter 之前
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 显式定义 CorsConfigurationSource 解决 Spring Security 跨域安全配置问题
     * 解决 allowCredentials(true) 与 allowedOrigins("*") 的冲突
     *
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许所有 Origin Pattern（比直接使用 "*" 安全且支持 allowCredentials）
        configuration.setAllowedOriginPatterns(List.of("*"));
        // 注意：必须包含 PATCH，否则 PATCH 请求的 CORS 预检会被 DefaultCorsProcessor 拒绝并返回 403
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
