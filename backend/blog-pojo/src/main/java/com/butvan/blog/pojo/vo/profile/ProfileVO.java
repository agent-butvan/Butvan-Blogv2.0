package com.butvan.blog.pojo.vo.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Map;

/**
 * 公开用户资料视图对象
 *
 * 供博客前台首页展示个人信息（头像、简介、社交链接等），
 * 不包含密码、邮箱等敏感字段。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileVO implements Serializable {

    /** 用户展示昵称 */
    private String nickname;

    /** 用户头像图片的完整 URL 地址 */
    private String avatarUrl;

    /** 用户个性化简介/电子签名 */
    private String bio;

    /** 社交网络链接（如 github、twitter 等），键为平台名，值为链接 URL */
    private Map<String, Object> socialLinks;
}
