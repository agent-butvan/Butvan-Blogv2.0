package com.butvan.blog.pojo.vo.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 点赞记录视图展示对象，用于给管理后台返回渲染数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleLikeVO {

    private Long id; // 点赞流水唯一 ID

    private Long articleId; // 被点赞文章唯一关联 ID

    private String articleTitle; // 文章标题（方便管理端直接展示）

    private String articleSlug; // 文章 URL Slug 标识（方便点击直接跳转前台）

    private String ipAddress; // 点赞时游客客户端真实 IP 地址

    private String userAgent; // 设备与浏览器 User-Agent 详情

    private Long userId; // 绑定的登录用户唯一 ID（游客则为 NULL）

    private String userNickname; // 点赞者昵称（若为游客，则展示“游客”）

    private String userAvatar; // 点赞用户头像 URL

    private LocalDateTime createdAt; // 点赞时间
}
