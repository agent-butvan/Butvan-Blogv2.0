package com.butvan.blog.service.security;

import com.butvan.blog.service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import java.util.List;

/**
 * Spring Security 核心体系安全拦截与机制配置类
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

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
                    // 放行认证模块与导航资源获取接口
                    .requestMatchers("/api/auth/register", "/api/auth/login", "/api/navigations/**").permitAll()
                    // 其它任何后台 API 均需校验 Bearer Token 权限身份
                    .anyRequest().authenticated()
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
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
