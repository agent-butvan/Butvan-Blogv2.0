package com.butvan.blog.pojo.vo.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 当前登录账号个人中心视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserVO implements Serializable {

    private Long id; // 用户唯一 ID
    private String username; // 登录用户名
    private String nickname; // 用户展示昵称
    private String email; // 绑定邮箱
    private String avatarUrl; // 头像 URL
    private String bio; // 个人简介
    private String githubUsername; // 绑定的 GitHub 用户名
    private Boolean twoFactorEnabled; // 是否开启了双重验证
    private String role; // 用户角色
    private String status; // 账号状态
    private LocalDateTime lastLoginAt; // 最近登录时间
    private LocalDateTime createdAt; // 注册时间
    private LocalDateTime updatedAt; // 最近更新时间
}
