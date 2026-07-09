package com.butvan.blog.service.controller;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.auth.CurrentUserUpdateDTO;
import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.PasswordChangeDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorEnableDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorDisableDTO;
import com.butvan.blog.pojo.dto.auth.GithubBindDTO;
import com.butvan.blog.pojo.vo.auth.CurrentUserVO;
import com.butvan.blog.pojo.vo.auth.LoginVO;
import com.butvan.blog.service.security.LoginRateLimiter;
import com.butvan.blog.service.service.AuthService;
import com.butvan.blog.service.service.TokenService;
import com.butvan.blog.service.service.TokenService.TokenPair;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.Map;

/**
 * 账号认证与安全控制层 RESTful 接口控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final LoginRateLimiter loginRateLimiter;
    private final TokenService tokenService;

    /**
     * 管理后台账号注册接口
     *
     * @param registerDTO 注册数据表单，入参接受 JSR303 格式验证
     * @return 统一格式响应体 Result
     */
    @PostMapping("/register")
    public Result<Void> register(@Validated @RequestBody RegisterDTO registerDTO) {
        log.info("接收到用户注册 API 请求，用户名: {}", registerDTO.getUsername());
        authService.register(registerDTO);
        return Result.success();
    }

    /**
     * 管理后台账号登录接口
     * <p>内置 Redis 频率限制：同一用户名/IP 5分钟内最多 5 次失败尝试</p>
     *
     * @param loginDTO 登录数据表单，入参接受 JSR303 格式验证
     * @param request  HTTP 请求对象（用于提取客户端 IP）
     * @return 统一格式响应体 Result，携带 LoginVO 载荷
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Validated @RequestBody LoginDTO loginDTO,
                                  HttpServletRequest request,
                                  HttpServletResponse response) {
        log.info("接收到用户登录 API 请求，用户名: {}", loginDTO.getUsername());

        String clientIp = extractClientIp(request);

        // 1. 频率限制前置校验
        loginRateLimiter.checkRateLimit(loginDTO.getUsername(), clientIp);

        try {
            // 2. 执行登录业务逻辑（含密码/2FA校验，admin端仍从此处获取token）
            LoginVO loginVO = authService.login(loginDTO);

            // 3. 登录成功，清除失败计数
            loginRateLimiter.clearFailCount(loginDTO.getUsername(), clientIp);

            // 4. 签发双 Token 并通过 httpOnly Cookie 下发（前台用户端使用）
            if (loginVO.getUser() != null) {
                TokenPair tokens = tokenService.issueTokens(
                        loginVO.getUser().getId(),
                        loginVO.getUser().getUsername(),
                        loginVO.getUser().getRole());
                addCookie(response, "access_token", tokens.accessToken(), 900, "/api");
                addCookie(response, "refresh_token", tokens.refreshToken(), 604800, "/api/auth/refresh");
            }

            return Result.success(loginVO);
        } catch (BusinessException e) {
            // 登录失败，记录失败次数（429 限流异常不记录）
            if (e.getCode() != 429) {
                loginRateLimiter.recordFailure(loginDTO.getUsername(), clientIp);
            }
            throw e;
        }
    }

    /**
     * 刷新 Access Token（静默续期）
     * <p>前端 http-client 在收到 401 时自动调用此接口，用 refresh_token Cookie 换取新 access_token Cookie</p>
     *
     * @param request  HTTP 请求（读取 refresh_token Cookie）
     * @param response HTTP 响应（写入新 access_token Cookie）
     * @return 统一成功响应
     */
    @PostMapping("/refresh")
    public Result<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValue(request, "refresh_token");
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        String newAccessToken = tokenService.refreshAccessToken(refreshToken);
        addCookie(response, "access_token", newAccessToken, 900, "/api");
        return Result.success();
    }

    /**
     * 退出登录
     * <p>吊销 Refresh Token（从 Redis 白名单移除）并清除所有 Cookie</p>
     *
     * @param request  HTTP 请求（读取 refresh_token Cookie）
     * @param response HTTP 响应（清除 Cookie）
     * @return 统一成功响应
     */
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValue(request, "refresh_token");
        if (refreshToken != null && !refreshToken.isEmpty()) {
            tokenService.revokeRefreshToken(refreshToken);
        }
        clearCookie(response, "access_token", "/api");
        clearCookie(response, "refresh_token", "/api/auth/refresh");
        return Result.success();
    }

    /**
     * 会话有效性检查
     * <p>前端页面加载时，若 localStorage 中无用户信息但 refresh_token Cookie 仍存在，
     * 可调用此接口验证会话有效性并恢复用户信息，避免因清除 localStorage 导致登录态丢失</p>
     *
     * @param request HTTP 请求（读取 refresh_token Cookie）
     * @return 当前登录用户资料，会话无效时返回 401
     */
    @GetMapping("/check")
    public Result<CurrentUserVO> checkSession(HttpServletRequest request) {
        String refreshToken = getCookieValue(request, "refresh_token");
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new BusinessException(401, "未登录");
        }
        if (!tokenService.isRefreshTokenActive(refreshToken)) {
            throw new BusinessException(401, "登录已过期");
        }
        String username = tokenService.getUsernameFromRefreshToken(refreshToken);
        if (username == null) {
            throw new BusinessException(401, "无效的会话");
        }
        CurrentUserVO currentUser = authService.getCurrentUser(username);
        return Result.success(currentUser);
    }

    /**
     * 获取当前登录账号个人中心资料
     *
     * @param principal 当前登录安全凭证
     * @return 当前登录账号资料
     */
    @GetMapping("/me")
    public Result<CurrentUserVO> getCurrentUser(Principal principal) {
        CurrentUserVO currentUser = authService.getCurrentUser(principal.getName());
        return Result.success(currentUser);
    }

    /**
     * 更新当前登录账号基础资料
     *
     * @param dto       账号基础资料表单
     * @param principal 当前登录安全凭证
     * @return 更新后的账号资料
     */
    @PutMapping("/me/profile")
    public Result<CurrentUserVO> updateCurrentUser(
            @Validated @RequestBody CurrentUserUpdateDTO dto,
            Principal principal
    ) {
        CurrentUserVO currentUser = authService.updateCurrentUser(principal.getName(), dto);
        return Result.success(currentUser);
    }

    /**
     * 修改当前登录账号密码
     *
     * @param dto       密码修改表单
     * @param principal 当前登录安全凭证
     * @return 统一成功响应
     */
    @PutMapping("/me/password")
    public Result<Void> changePassword(
            @Validated @RequestBody PasswordChangeDTO dto,
            Principal principal
    ) {
        authService.changePassword(principal.getName(), dto);
        return Result.success();
    }

    /**
     * 初始化双重认证 (2FA)，下发密钥和扫码 URI
     */
    @GetMapping("/me/2fa/init")
    public Result<Map<String, String>> initTwoFactor(Principal principal) {
        log.info("用户 [{}] 请求初始化双重验证 2FA", principal.getName());
        Map<String, String> data = authService.initTwoFactor(principal.getName());
        return Result.success(data);
    }

    /**
     * 验证并启用双重认证 (2FA)
     */
    @PostMapping("/me/2fa/enable")
    public Result<Void> enableTwoFactor(
            @Validated @RequestBody TwoFactorEnableDTO dto,
            Principal principal
    ) {
        log.info("用户 [{}] 验证并启用双重验证 2FA", principal.getName());
        authService.enableTwoFactor(principal.getName(), dto);
        return Result.success();
    }

    /**
     * 校验并关闭双重认证 (2FA)
     */
    @PostMapping("/me/2fa/disable")
    public Result<Void> disableTwoFactor(
            @Validated @RequestBody TwoFactorDisableDTO dto,
            Principal principal
    ) {
        log.info("用户 [{}] 请求停用双重验证 2FA", principal.getName());
        authService.disableTwoFactor(principal.getName(), dto);
        return Result.success();
    }

    /**
     * 绑定 GitHub 账号
     */
    @PostMapping("/me/github/bind")
    public Result<Void> bindGithub(
            @Validated @RequestBody GithubBindDTO dto,
            Principal principal
    ) {
        log.info("用户 [{}] 绑定 GitHub 账号: {}", principal.getName(), dto.getGithubUsername());
        authService.bindGithub(principal.getName(), dto);
        return Result.success();
    }

    /**
     * 解绑 GitHub 账号
     */
    @PostMapping("/me/github/unbind")
    public Result<Void> unbindGithub(Principal principal) {
        log.info("用户 [{}] 解绑 GitHub 账号", principal.getName());
        authService.unbindGithub(principal.getName());
        return Result.success();
    }

    /**
     * 上传当前登录用户的头像
     *
     * @param file      上传的头像文件
     * @param principal 当前登录安全凭证
     * @return 更新后的当前账号资料视图对象
     */
    @PostMapping("/me/avatar")
    public Result<CurrentUserVO> uploadAvatar(
            @RequestParam("avatar") MultipartFile file,
            Principal principal
    ) {
        log.info("用户 [{}] 请求上传头像", principal.getName());
        CurrentUserVO updatedUser = authService.uploadAvatar(principal.getName(), file);
        return Result.success(updatedUser);
    }

    /**
     * 提取客户端真实 IP（兼容 Nginx 反向代理 X-Forwarded-For）
     */
    private String extractClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // 多级代理时取第一个
            int commaIdx = ip.indexOf(',');
            return commaIdx > 0 ? ip.substring(0, commaIdx).trim() : ip.trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.trim();
        }
        return request.getRemoteAddr();
    }

    // ---- Cookie 工具方法 --------------------------------------------------

    /**
     * 设置 httpOnly Cookie（安全属性：Secure + SameSite=Lax）
     *
     * @param response HTTP 响应
     * @param name     Cookie 名称
     * @param value    Cookie 值
     * @param maxAge   有效期（秒）
     * @param path     Cookie 路径
     */
    private void addCookie(HttpServletResponse response, String name, String value, int maxAge, String path) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * 清除指定 Cookie（设置 maxAge=0 让浏览器立即删除）
     *
     * @param response HTTP 响应
     * @param name     Cookie 名称
     * @param path     Cookie 路径
     */
    private void clearCookie(HttpServletResponse response, String name, String path) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(path)
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * 从请求中提取指定名称的 Cookie 值
     *
     * @param request HTTP 请求
     * @param name    Cookie 名称
     * @return Cookie 值，不存在返回 null
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
