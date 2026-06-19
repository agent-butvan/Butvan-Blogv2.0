package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 当前登录账号修改密码请求 DTO
 */
@Data
public class PasswordChangeDTO {

    @NotBlank(message = "当前密码不能为空")
    private String currentPassword; // 当前登录密码

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 30, message = "新密码长度必须在 6 到 30 个字符之间")
    private String newPassword; // 待更新的新密码
}
