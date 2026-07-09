package com.butvan.blog.service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 请求令牌解析与认证上下文填充过滤器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * 执行过滤拦截核心逻辑
     *
     * @param request 请求对象
     * @param response 响应对象
     * @param filterChain 过滤器链
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Token 提取优先级：Cookie > Authorization Header（兼容前台 Cookie + 后台 Authorization）
        final String jwt = extractToken(request);
        final String username;

        // 如果没有提取到 Token，直接放行（由后面的 Security 安全屏障鉴权）
        if (jwt == null || jwt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            username = jwtUtil.getUsernameFromToken(jwt);
            
            // 校验提取出的用户名，且当前安全上下文未保存认证信息
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                // 校验 Token 签名及过期等状态是否有效
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // 从 Token 中提取 userId 和 role，存入 details 供 Controller 层直接使用
                    Map<String, Object> tokenDetails = new HashMap<>();
                    Long userId = jwtUtil.getUserIdFromToken(jwt);
                    String role = jwtUtil.getRoleFromToken(jwt);
                    if (userId != null) tokenDetails.put("userId", userId);
                    if (role != null) tokenDetails.put("role", role);
                    tokenDetails.put("remoteAddress", new WebAuthenticationDetailsSource().buildDetails(request));
                    authToken.setDetails(tokenDetails);
                    
                    // 将认证信息放入 SecurityContextHolder 安全上下文
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.warn("JWT 解析或鉴权验证失败: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 从请求中提取 JWT Token
     * <p>提取优先级：Cookie(access_token) > Authorization Header(Bearer)
     * 前台用户端使用 httpOnly Cookie，后台管理端使用 Authorization 头</p>
     *
     * @param request HTTP 请求
     * @return JWT Token 字符串，未找到返回 null
     */
    private String extractToken(HttpServletRequest request) {
        // 1. 优先从 Cookie 读取 access_token（前台用户端）
        String cookieToken = getCookieValue(request, "access_token");
        if (cookieToken != null && !cookieToken.isEmpty()) {
            return cookieToken;
        }
        // 2. 回退到 Authorization 头（后台管理端兼容）
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * 从请求中提取指定名称的 Cookie 值
     */
    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
