package com.butvan.blog.pojo.dto.profile;

import lombok.Data;
import java.util.Map;

/**
 * 个人公开资料更新数据传输对象
 */
@Data
public class ProfileUpdateDTO {

    /** 昵称 */
    private String nickname;

    /** 头像 URL 地址 */
    private String avatarUrl;

    /** 简短个性签名 / 技术栈简介 */
    private String bio;

    /** 社交网络链接及自定义详细介绍属性（如 techStack, introLine1, introLine2, github, email, rss） */
    private Map<String, Object> socialLinks;
}
