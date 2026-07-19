package com.butvan.blog.service.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 集中管理系统通知相关的 Spring 业务事件总线
 */
public class NotificationEvents {

    /**
     * 新增评论事件
     */
    @Getter
    public static class CommentCreatedEvent extends ApplicationEvent {
        private final String senderName; // 评论发表人昵称
        private final Long articleId;    // 关联的文章 ID
        private final String articleTitle;// 关联的文章标题
        private final String commentExcerpt; // 评论摘要片段
        private final Long commentId;    // 评论 ID

        public CommentCreatedEvent(Object source, String senderName, Long articleId, String articleTitle, String commentExcerpt, Long commentId) {
            super(source);
            this.senderName = senderName;
            this.articleId = articleId;
            this.articleTitle = articleTitle;
            this.commentExcerpt = commentExcerpt;
            this.commentId = commentId;
        }
    }

    /**
     * 文章新增点赞事件
     */
    @Getter
    public static class LikeCreatedEvent extends ApplicationEvent {
        private final String senderName; // 点赞人昵称
        private final Long articleId;    // 关联的文章 ID
        private final String articleTitle; // 关联的文章标题

        public LikeCreatedEvent(Object source, String senderName, Long articleId, String articleTitle) {
            super(source);
            this.senderName = senderName;
            this.articleId = articleId;
            this.articleTitle = articleTitle;
        }
    }

    /**
     * 新用户注册事件
     */
    @Getter
    public static class UserRegisteredEvent extends ApplicationEvent {
        private final String username; // 注册账号
        private final Long userId;     // 用户 ID

        public UserRegisteredEvent(Object source, String username, Long userId) {
            super(source);
            this.username = username;
            this.userId = userId;
        }
    }

    /**
     * 友链申请事件
     */
    @Getter
    public static class FriendLinkAppliedEvent extends ApplicationEvent {
        private final String authorName; // 站长姓名
        private final String siteName;   // 网站名称
        private final String siteUrl;    // 网站链接
        private final Long linkId;       // 友情链接记录 ID

        public FriendLinkAppliedEvent(Object source, String authorName, String siteName, String siteUrl, Long linkId) {
            super(source);
            this.authorName = authorName;
            this.siteName = siteName;
            this.siteUrl = siteUrl;
            this.linkId = linkId;
        }
    }
}
