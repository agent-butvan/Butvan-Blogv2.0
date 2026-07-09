package com.butvan.blog.pojo.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理员重置用户密码表单 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminResetPasswordDTO {

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度必须在 6 到 50 个字符之间")
    private String newPassword; // 重置后的新密码
}
