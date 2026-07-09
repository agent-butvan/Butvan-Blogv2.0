package com.butvan.blog.pojo.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理员创建用户表单 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateUserDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在 3 到 50 个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    private String username; // 登录用户名

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度必须在 6 到 50 个字符之间")
    private String password; // 初始密码

    @NotBlank(message = "昵称不能为空")
    @Size(min = 2, max = 50, message = "昵称长度必须在 2 到 50 个字符之间")
    private String nickname; // 展示昵称

    @Size(max = 100, message = "邮箱长度不能超过 100 个字符")
    private String email; // 绑定邮箱（可选）

    @NotBlank(message = "角色不能为空")
    private String role; // 角色：ADMIN | AUTHOR
}
