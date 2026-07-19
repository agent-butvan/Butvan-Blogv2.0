package com.butvan.blog.common.enums;

import lombok.Getter;

/**
 * 系统通知事件类型枚举
 */
@Getter
public enum NotificationType {

    /** 友链申请 */
    FRIEND_LINK_APPLY("友链申请"),

    /** 新用户注册 */
    USER_REGISTER("新用户注册"),

    /** 新增点赞 */
    LIKE_ARTICLE("新增点赞"),

    /** 新增评论 */
    NEW_COMMENT("新增评论");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }
}
