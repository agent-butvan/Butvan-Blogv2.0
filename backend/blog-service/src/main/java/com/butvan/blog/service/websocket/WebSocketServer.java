package com.butvan.blog.service.websocket;


import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@ServerEndpoint("/ws/{id}")
@RequiredArgsConstructor
public class WebSocketServer {


    /**
     * 存放 session 对象 map集合
     */
    private final static Map<String, Session> sessionMap = new ConcurrentHashMap<>();


    /**
     * 连接建立成功
     * @param session
     * @param id
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("id") String id) {
        log.info("客户端id:[{}]连接建立成功",id);
        sessionMap.put(id,session);
    }

    /**
     * 收到客户端消息
     * <p>支持指令：</p>
     * <ul>
     *   <li>"close" — 客户端主动请求关闭会话（如登录完成后）</li>
     * </ul>
     * @param message 客户端发送的消息文本
     * @param id      客户端连接标识
     */
    @OnMessage
    public void onMessage(String message, @PathParam("id") String id) {
        log.info("收到来自客户端: [{}]的消息: [{}]", id, message);

        if ("close".equalsIgnoreCase(message)) {
            log.info("客户端: [{}] 请求关闭会话，原因: 登录流程完成", id);
            closeSession(id, "登录流程完成，客户端主动关闭");
        }
    }

    @OnClose
    public void onClose(@PathParam("id") String id) {
        sessionMap.remove(id);
        log.info("客户端: [{}] 连接关闭，当前连接数: [{}]", id, sessionMap.size());
    }

    /**
     * 向所有后台大屏控制台客户端广播 API 日志消息
     * @param message 广播消息文本
     */
    public void broadcastApiLog(String message) {
        sessionMap.forEach((id, session) -> {
            // 过滤：只有 id 包含 admin- 或是 dashboard 相关的管理大屏连接，才进行广播，防止干扰普通微信登录的前台会话
            if (id != null && (id.startsWith("admin-") || id.contains("dashboard"))) {
                if (session != null && session.isOpen()) {
                    try {
                        synchronized (session) {
                            session.getBasicRemote().sendText(message);
                        }
                    } catch (IOException e) {
                        log.error("广播发送 ws 大屏日志消息失败，客户端 id: [{}], 报错信息: [{}]", id, e.getMessage());
                    }
                }
            }
        });
    }

    /**
     * 向指定客户端发送消息
     * @param id
     * @param message
     */
    public void sendMessage(String id, String message) {
        Session session = sessionMap.get(id);

        if (session != null) {
            // 头昏脑补发送消息
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                log.error("同步发送 ws 消息失败，报错信息: [{}]",e.getMessage());
                throw new RuntimeException(e);
            }
        }
    }

    /**
     * 关闭指定会话
     * @param id
     * @param reason
     */
    public void closeSession(String id, String reason) {
        Session session = sessionMap.get(id);
        if (session != null && session.isOpen()) {
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, reason));
                log.info("当前客户端连接数:[ {} ]", sessionMap.size());
            } catch (IOException e) {
                log.error("客户端: [{}] ws 连接关闭失败，报错信息: [{}]", id, e.getMessage());
                throw new RuntimeException(e);
            }
        }

        sessionMap.remove(id);
    }
}
