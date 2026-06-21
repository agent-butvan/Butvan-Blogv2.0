package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 停用双重验证请求 DTO
 */
@Data
public class TwoFactorDisableDTO {

    @NotBlank(message = "2FA 验证码 不能为空")
    private String code; // 6位 TOTP 校验码
}
