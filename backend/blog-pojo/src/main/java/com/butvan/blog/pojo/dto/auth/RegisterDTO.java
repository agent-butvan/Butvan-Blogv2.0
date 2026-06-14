package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 账号注册信息数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {

    @NotBlank(message = "登录用户名不能为空")
    @Size(min = 3, max = 30, message = "登录用户名长度必须在 3 到 30 个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "登录用户名只能包含字母、数字和下划线")
    private String username; // 用户名

    @NotBlank(message = "登录密码不能为空")
    @Size(min = 6, max = 30, message = "登录密码长度必须在 6 到 30 个字符之间")
    private String password; // 明文密码

    @NotBlank(message = "展示昵称不能为空")
    @Size(min = 2, max = 30, message = "展示昵称长度必须在 2 到 30 个字符之间")
    private String nickname; // 用户昵称

    @Email(message = "电子邮箱格式不正确")
    @Size(max = 100, message = "电子邮箱长度不能超过 100 个字符")
    private String email; // 绑定的电子邮箱
}
