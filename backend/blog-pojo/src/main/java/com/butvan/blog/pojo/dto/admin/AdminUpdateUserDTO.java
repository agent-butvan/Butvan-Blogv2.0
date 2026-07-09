package com.butvan.blog.pojo.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理员编辑用户信息表单 DTO（不含密码，密码重置走独立接口）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserDTO {

    @NotBlank(message = "昵称不能为空")
    @Size(min = 2, max = 50, message = "昵称长度必须在 2 到 50 个字符之间")
    private String nickname; // 展示昵称

    @Size(max = 100, message = "邮箱长度不能超过 100 个字符")
    private String email; // 绑定邮箱

    @Size(max = 500, message = "头像 URL 不能超过 500 个字符")
    private String avatarUrl; // 头像地址

    @Size(max = 500, message = "个人简介不能超过 500 个字符")
    private String bio; // 个人简介

    @NotBlank(message = "角色不能为空")
    private String role; // 角色：ADMIN | AUTHOR
}
