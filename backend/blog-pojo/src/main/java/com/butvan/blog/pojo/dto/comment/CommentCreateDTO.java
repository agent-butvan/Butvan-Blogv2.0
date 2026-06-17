package com.butvan.blog.pojo.dto.comment;

import lombok.Data;

/**
 * 前端发表评论提交的请求体载荷传输对象 (DTO)
 */
@Data
public class CommentCreateDTO {

    private Long parentId; // 回复的目标评论 ID（可选，发表一级独立评论时为 NULL）

    private String visitorName; // 评论访客填写的昵称名称（未登录发表时必填）

    private String visitorEmail; // 评论访客填写的邮箱地址（必填，用于系统通知及 Gravatar 头像哈希转换）

    private String visitorWebsite; // 评论访客的个人网站 URL 地址（可选）

    private String content; // 提交的评论文本正文内容（必填，最多允许一定长度限制）
}
