package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 绑定 GitHub 账号请求 DTO
 */
@Data
public class GithubBindDTO {

    @NotBlank(message = "GitHub 账号 ID 不能为空")
    private String githubId; // GitHub 账号 ID

    @NotBlank(message = "GitHub 用户名 不能为空")
    private String githubUsername; // GitHub 用户名
}
