package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
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
@CrossOrigin(origins = "*") // 支持前端联调跨域
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
}
