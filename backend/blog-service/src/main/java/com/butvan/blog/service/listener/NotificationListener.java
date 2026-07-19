package com.butvan.blog.service.listener;

import com.butvan.blog.common.enums.NotificationType;
import com.butvan.blog.pojo.entity.Notification;
import com.butvan.blog.service.event.NotificationEvents.*;
import com.butvan.blog.service.repository.NotificationRepository;
import com.butvan.blog.service.websocket.WebSocketServer;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 系统通知事件异步监听处理器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationRepository notificationRepository;
    private final WebSocketServer webSocketServer;

    /**
     * 异步监听新评论发表事件，保存通知并实时推送
     */
    @Async
    @EventListener
    public void handleCommentCreatedEvent(CommentCreatedEvent event) {
        log.info("【系统通知监听】收到新评论事件，发送人: [{}]", event.getSenderName());
        
        Notification notification = Notification.builder()
                .type(NotificationType.NEW_COMMENT)
                .title("收到新评论")
                .content(String.format("访客「%s」在文章《%s》下发表了评论：%s", 
                        event.getSenderName(), event.getArticleTitle(), event.getCommentExcerpt()))
                .senderName(event.getSenderName())
                .targetId(event.getCommentId())
                .build();
                
        notificationRepository.save(notification);
        broadcastNotification(notification);
    }

    /**
     * 异步监听文章点赞事件，保存通知并实时推送
     */
    @Async
    @EventListener
    public void handleLikeCreatedEvent(LikeCreatedEvent event) {
        log.info("【系统通知监听】收到文章点赞事件，点赞人: [{}]", event.getSenderName());
        
        Notification notification = Notification.builder()
                .type(NotificationType.LIKE_ARTICLE)
                .title("文章收到点赞")
                .content(String.format("访客「%s」点赞了您的文章《%s》", 
                        event.getSenderName(), event.getArticleTitle()))
                .senderName(event.getSenderName())
                .targetId(event.getArticleId())
                .build();
                
        notificationRepository.save(notification);
        broadcastNotification(notification);
    }

    /**
     * 异步监听新用户注册事件，保存通知并实时推送
     */
    @Async
    @EventListener
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("【系统通知监听】收到新用户注册事件，用户账号: [{}]", event.getUsername());
        
        Notification notification = Notification.builder()
                .type(NotificationType.USER_REGISTER)
                .title("新用户注册提醒")
                .content(String.format("新用户「%s」已成功注册到系统", event.getUsername()))
                .senderName(event.getUsername())
                .targetId(event.getUserId())
                .build();
                
        notificationRepository.save(notification);
        broadcastNotification(notification);
    }

    /**
     * 异步监听友链申请事件，保存通知并实时推送
     */
    @Async
    @EventListener
    public void handleFriendLinkAppliedEvent(FriendLinkAppliedEvent event) {
        log.info("【系统通知监听】收到友情链接申请事件，申请人: [{}]", event.getAuthorName());
        
        Notification notification = Notification.builder()
                .type(NotificationType.FRIEND_LINK_APPLY)
                .title("收到新友链申请")
                .content(String.format("站长「%s」申请交换友情链接。站点名：%s，网址：%s", 
                        event.getAuthorName(), event.getSiteName(), event.getSiteUrl()))
                .senderName(event.getAuthorName())
                .targetId(event.getLinkId())
                .build();
                
        notificationRepository.save(notification);
        broadcastNotification(notification);
    }

    /**
     * 将通知消息推送到 WebSocket 管理端在线会话中
     */
    private void broadcastNotification(Notification notification) {
        try {
            JSONObject wsMsg = JSONUtil.createObj();
            wsMsg.set("type", "notification");
            wsMsg.set("data", notification);
            
            // 携带当前最新的未读数，避免前端收到通知后再发起一次未读数的查询请求
            long unreadCount = notificationRepository.countByIsReadFalse();
            wsMsg.set("unreadCount", unreadCount);
            
            webSocketServer.broadcastNotification(JSONUtil.toJsonStr(wsMsg));
            log.info("【系统通知监听】已将通知消息实时推送至管理端会话，当前未读通知数: {}", unreadCount);
        } catch (Exception ex) {
            log.warn("【系统通知监听】通过 WebSocket 广播系统通知消息异常: ", ex);
        }
    }
}
