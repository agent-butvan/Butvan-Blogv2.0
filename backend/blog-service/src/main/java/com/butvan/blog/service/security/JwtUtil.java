package com.butvan.blog.service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT 签名生成与校验解析工具类
 */
@Component
@Slf4j
public class JwtUtil {

    /** 默认弱密钥标识，生产环境禁止使用 */
    private static final String DEFAULT_SECRET = "butvan_blog_secret_key_minimum_256_bit_standard_key_value";

    /** 密钥最小安全长度（字节），HS256 要求至少 256 bit = 32 字节 */
    private static final int MIN_SECRET_LENGTH = 32;

    @Value("${jwt.secret:butvan_blog_secret_key_minimum_256_bit_standard_key_value}")
    private String secret; // 签名密钥（应在配置文件或环境变量中设定，最小32字节）

    @Value("${jwt.expiration:604800}")
    private Long expiration; // Token 生存期，默认 7 天（单位：秒）

    /**
     * 启动时校验 JWT 密钥安全性
     * - 检测是否仍在使用默认弱密钥
     * - 检测密钥长度是否满足 HS256 最低要求（256 bit / 32 字节）
     *
     * @throws IllegalStateException 密钥长度不足时阻止应用启动
     */
    @PostConstruct
    public void validateSecret() {
        if (DEFAULT_SECRET.equals(secret)) {
            log.warn("【安全警告】JWT 签名密钥仍在使用默认值，请尽快在配置文件中设置 jwt.secret 为高强度自定义密钥！");
        }
        int secretLength = secret.getBytes(StandardCharsets.UTF_8).length;
        if (secretLength < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    String.format("JWT 签名密钥长度不足：当前 %d 字节，最低要求 %d 字节（256 bit）。请在配置文件中设置足够长的 jwt.secret",
                            secretLength, MIN_SECRET_LENGTH));
        }
        log.info("JWT 密钥安全校验通过（长度: {} 字节，有效期: {} 秒）", secretLength, expiration);
    }

    /**
     * 根据签名密钥文本，获取加密算法对应的 Key 密钥对象
     *
     * @return 密钥 Key
     */
    private Key getSigningKey() {
        byte[] keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 JWT Token（仅含用户名，向后兼容）
     *
     * @param username 登录用户名
     * @return 签发的加密 Token 串
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * 携带 userId 和 role 生成增强 JWT Token
     * <p>Token 载荷中包含用户 ID、用户名和角色，减少后续请求的不必要 DB 查询</p>
     *
     * @param userId   用户唯一 ID
     * @param username 登录用户名
     * @param role     用户角色（ADMIN / AUTHOR）
     * @return 签发的加密 Token 串
     */
    public String generateToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        return createToken(claims, username);
    }

    /**
     * 携带额外自定义声明生成 JWT Token
     *
     * @param claims 额外声明载荷
     * @param username 登录用户名
     * @return 签发的加密 Token 串
     */
    public String generateToken(Map<String, Object> claims, String username) {
        return createToken(claims, username);
    }

    /**
     * 核心 Token 构建方法
     *
     * @param claims 载荷数据
     * @param subject 主题（用户名）
     * @return Token 串
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + this.expiration * 1000);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 从 Token 中提取用户名
     *
     * @param token 加密 Token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * 从 Token 中提取用户 ID
     *
     * @param token 加密 Token
     * @return 用户 ID，未携带时返回 null
     */
    public Long getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object userId = claims.get("userId");
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return null;
        });
    }

    /**
     * 从 Token 中提取用户角色
     *
     * @param token 加密 Token
     * @return 用户角色字符串，未携带时返回 null
     */
    public String getRoleFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get("role", String.class));
    }

    /**
     * 从 Token 中提取过期时间
     *
     * @param token 加密 Token
     * @return 过期日期
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * 通用单项载荷字段读取方法
     *
     * @param token 加密 Token
     * @param claimsResolver 读取映射器
     * @param <T> 返回字段类型
     * @return 载荷字段
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 解析并获取所有载荷明细
     *
     * @param token 加密 Token
     * @return Claims 载荷
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 判断 Token 是否已过期
     *
     * @param token 加密 Token
     * @return 是否过期
     */
    private Boolean isTokenExpired(String token) {
        final Date expirationDate = getExpirationDateFromToken(token);
        return expirationDate.before(new Date());
    }

    /**
     * 验证 Token 是否合法有效
     *
     * @param token 加密 Token
     * @param username 期望的用户名
     * @return 校验通过返回 true，否则 false
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = getUsernameFromToken(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
}
