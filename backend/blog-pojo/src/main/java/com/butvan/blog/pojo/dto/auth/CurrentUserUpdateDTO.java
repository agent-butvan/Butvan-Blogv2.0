package com.butvan.blog.pojo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Map;

/**
 * 当前登录账号基础资料更新请求 DTO
 */
@Data
public class CurrentUserUpdateDTO {

    @NotBlank(message = "展示昵称不能为空")
    @Size(min = 2, max = 50, message = "展示昵称长度必须在 2 到 50 个字符之间")
    private String nickname; // 用户展示昵称

    @Email(message = "电子邮箱格式不正确")
    @Size(max = 100, message = "电子邮箱长度不能超过 100 个字符")
    private String email; // 用户绑定邮箱

    @Size(max = 500, message = "头像地址长度不能超过 500 个字符")
    private String avatarUrl; // 用户头像 URL

    @Size(max = 500, message = "个人简介长度不能超过 500 个字符")
    private String bio; // 用户个人简介

    @Size(max = 500, message = "赞赏收款码地址长度不能超过 500 个字符")
    private String rewardCodeUrl; // 赞赏/收款二维码图片 URL

    private Map<String, Object> socialLinks; // 社交网络链接扩展 map
}
