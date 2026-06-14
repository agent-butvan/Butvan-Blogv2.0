    package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.vo.auth.LoginVO;
import com.butvan.blog.service.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;   
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
}
