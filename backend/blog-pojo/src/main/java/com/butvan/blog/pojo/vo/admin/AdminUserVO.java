package com.butvan.blog.pojo.vo.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 后台用户管理列表视图对象
 * <p>含冗余的点赞数/评论数统计，方便前端直接展示，无需额外请求</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserVO implements Serializable {

    private Long id;           // 用户唯一 ID
    private String username;   // 登录用户名
    private String nickname;   // 展示昵称
    private String email;      // 绑定邮箱
    private String avatarUrl;  // 头像 URL
    private String bio;        // 个人简介
    private String role;       // 角色：ADMIN | USER
    private String status;     // 状态：ACTIVE | DISABLED
    private Boolean twoFactorEnabled; // 是否开启双重验证
    private String githubUsername;    // 绑定的 GitHub 用户名
    private LocalDateTime lastLoginAt; // 最后登录时间
    private LocalDateTime createdAt;   // 注册时间
    private LocalDateTime updatedAt;   // 更新时间

    /** 冗余统计：该用户发表的点赞总数（包括文章点赞 + 手记点赞） */
    private Long likeCount;

    /** 冗余统计：该用户发表的评论总数 */
    private Long commentCount;
}
