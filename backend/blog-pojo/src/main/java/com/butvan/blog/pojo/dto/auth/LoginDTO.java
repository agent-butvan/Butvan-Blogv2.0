package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 账号登录信息数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {

    @NotBlank(message = "登录用户名不能为空")
    private String username; // 用户名

    private String password; // 密码

    private String twoFactorCode; // 2FA 验证码（如果已开启双重验证，则必填）
}
