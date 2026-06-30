package com.butvan.blog.pojo.dto.friend;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 友链申请 DTO（前台申请）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendLinkApplyDTO {

    @NotBlank(message = "博客名称不能为空")
    @Size(max = 100, message = "博客名称不能超过100字符")
    private String name;

    @NotBlank(message = "博客地址不能为空")
    @Size(max = 500, message = "博客地址不能超过500字符")
    private String url;

    @Size(max = 500, message = "头像URL不能超过500字符")
    private String avatarUrl;

    @NotBlank(message = "简介不能为空")
    @Size(max = 255, message = "简介不能超过255字符")
    private String description;

    @NotNull(message = "分类不能为空")
    private String category;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱不能超过100字符")
    private String email;

    @Size(max = 500, message = "备注不能超过500字符")
    private String remark;
}