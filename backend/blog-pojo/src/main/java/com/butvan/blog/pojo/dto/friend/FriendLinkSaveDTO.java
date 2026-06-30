package com.butvan.blog.pojo.dto.friend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 友链保存 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendLinkSaveDTO {

    @NotBlank(message = "博客名称不能为空")
    @Size(max = 100, message = "博客名称不能超过100字符")
    private String name;

    @NotBlank(message = "博客地址不能为空")
    @Size(max = 500, message = "博客地址不能超过500字符")
    private String url;

    @Size(max = 500, message = "头像URL不能超过500字符")
    private String avatarUrl;

    @Size(max = 255, message = "简介不能超过255字符")
    private String description;

    @NotBlank(message = "分类不能为空")
    private String category;

    @Size(max = 100, message = "邮箱不能超过100字符")
    private String email;

    private Integer sortOrder;
}