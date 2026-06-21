    package com.butvan.blog.service.controller;

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
import com.butvan.blog.service.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;   
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
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
     *
     * @param loginDTO 登录数据表单，入参接受 JSR303 格式验证
     * @return 统一格式响应体 Result，携带 LoginVO 载荷
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        log.info("接收到用户登录 API 请求，用户名: {}", loginDTO.getUsername());
        LoginVO loginVO = authService.login(loginDTO);
        return Result.success(loginVO);
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
}
