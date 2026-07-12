package com.butvan.blog.service.service;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Token 生命周期管理服务
 * <p>
 * 核心职责：
 * - 签发 Access + Refresh 双 Token
 * - Redis 白名单追踪活跃会话（登录写入 / 刷新校验 / 登出删除）
 * - 校验 Refresh Token 并换取新 Access Token
 * - 吊销 Refresh Token（登出时从白名单移除）
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final JwtUtil jwtUtil;
    private final RedisUtils redisUtils;
    private final UserRepository userRepository;

    /** Redis 活跃会话白名单 Key 前缀（Value 存储 userId） */
    private static final String WHITELIST_PREFIX = "token:active:";

    /**
     * Access + Refresh 双 Token 对
     *
     * @param accessToken  短期访问令牌（15 分钟）
     * @param refreshToken 长期刷新令牌（7 天）
     */
    public record TokenPair(String accessToken, String refreshToken) {}

    /**
     * 签发 Access Token 和 Refresh Token
     *
     * @param userId   用户唯一 ID
     * @param username 登录用户名
     * @param role     用户角色（ADMIN / AUTHOR）
     * @return TokenPair 双令牌对
     */
    public TokenPair issueTokens(Long userId, String username, String role) {
        String accessToken = jwtUtil.generateAccessToken(userId, username, role);
        String refreshToken = jwtUtil.generateRefreshToken(userId, username);

        // 将 Refresh Token 的 jti 写入 Redis 白名单（TTL = Token 有效期）
        String jti = jwtUtil.getJtiFromToken(refreshToken);
        if (jti != null) {
            long ttlSeconds = calculateRemainingTtl(refreshToken);
            if (ttlSeconds > 0) {
                redisUtils.set(WHITELIST_PREFIX + jti, String.valueOf(userId), ttlSeconds, TimeUnit.SECONDS);
            }
        }

        log.info("签发双 Token 完成，用户: {}, jti: {}", username, jti);
        return new TokenPair(accessToken, refreshToken);
    }

    /**
     * 使用 Refresh Token 换取新的 Access Token
     * <p>
     * 校验流程：
     * 1. 签名合法性与过期校验
     * 2. Token 类型校验（必须是 refresh 类型）
     * 3. Redis 白名单校验（jti 必须在活跃会话列表中）
     * 4. 查询数据库获取用户最新角色（角色可能在刷新期间变更）
     * </p>
     *
     * @param refreshToken Refresh Token 字符串
     * @return 新的 Access Token
     * @throws BusinessException Token 无效或已被吊销时抛出 401
     */
    public String refreshAccessToken(String refreshToken) {
        // 1. 签名与过期校验
        if (!Boolean.TRUE.equals(jwtUtil.validateToken(refreshToken))) {
            throw new BusinessException(401, "登录已过期，请重新登录");
        }

        // 2. Token 类型校验（确保不是 Access Token 被当作 Refresh Token 使用）
        String type = jwtUtil.getClaimFromToken(refreshToken, claims -> claims.get("type", String.class));
        if (!"refresh".equals(type)) {
            throw new BusinessException(401, "无效的刷新令牌");
        }

        // 3. Redis 白名单校验（jti 必须存在于活跃会话中）
        String jti = jwtUtil.getJtiFromToken(refreshToken);
        if (jti == null || !redisUtils.hasKey(WHITELIST_PREFIX + jti)) {
            log.warn("Refresh Token 不在白名单中（已登出或已过期）, jti: {}", jti);
            throw new BusinessException(401, "登录已失效，请重新登录");
        }

        // 4. 提取用户信息，查询数据库获取最新角色
        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        String username = jwtUtil.getUsernameFromToken(refreshToken);
        if (userId == null || username == null) {
            throw new BusinessException(401, "无效的刷新令牌");
        }

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new BusinessException(401, "用户不存在"));

        // 5. 签发新 Access Token（携带最新角色）
        String newAccessToken = jwtUtil.generateAccessToken(userId, username, user.getRole());
        log.info("Access Token 刷新成功，用户: {}", username);
        return newAccessToken;
    }

    /**
     * 校验 Refresh Token 是否在 Redis 白名单中（用于会话有效性检查）
     *
     * @param refreshToken Refresh Token 字符串
     * @return 白名单中存在返回 true
     */
    public boolean isRefreshTokenActive(String refreshToken) {
        try {
            if (!Boolean.TRUE.equals(jwtUtil.validateToken(refreshToken))) {
                return false;
            }
            String jti = jwtUtil.getJtiFromToken(refreshToken);
            return jti != null && redisUtils.hasKey(WHITELIST_PREFIX + jti);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 吊销 Refresh Token（从 Redis 白名单移除）
     *
     * @param refreshToken 待吊销的 Refresh Token
     */
    public void revokeRefreshToken(String refreshToken) {
        try {
            String jti = jwtUtil.getJtiFromToken(refreshToken);
            if (jti != null) {
                redisUtils.delete(WHITELIST_PREFIX + jti);
                log.info("Refresh Token 已从白名单移除, jti: {}", jti);
            }
        } catch (Exception e) {
            log.warn("吊销 Refresh Token 失败: {}", e.getMessage());
        }
    }

    /**
     * 从 Refresh Token 中提取用户名
     *
     * @param refreshToken Refresh Token 字符串
     * @return 用户名，解析失败返回 null
     */
    public String getUsernameFromRefreshToken(String refreshToken) {
        try {
            return jwtUtil.getUsernameFromToken(refreshToken);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 计算 Token 的剩余有效时间（秒）
     *
     * @param token JWT Token
     * @return 剩余秒数，已过期返回 0
     */
    private long calculateRemainingTtl(String token) {
        try {
            long expirationTime = jwtUtil.getExpirationDateFromToken(token).getTime();
            long remainingMs = expirationTime - System.currentTimeMillis();
            return remainingMs > 0 ? remainingMs / 1000 : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}
