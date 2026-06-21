package com.butvan.blog.pojo.vo.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * 账号登录成功后返回给前端的视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginVO implements Serializable {

    private String token;     // 鉴权 Bearer Token 字符串
    private UserInfo user;    // 当前登录用户的基本信息

    /**
     * 静态内部类：封装前端认证所需的极简用户信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo implements Serializable {
        private Long id;          // 用户唯一ID
        private String username;  // 用户名
        private String nickname;  // 用户展示昵称
        private String email;     // 用户绑定邮箱
        private String avatarUrl; // 用户头像URL
        private String githubUsername; // 绑定的 GitHub 用户名
        private Boolean twoFactorEnabled; // 是否开启了双重验证
        private String role;      // 用户身份角色：ADMIN | AUTHOR
    }
}
