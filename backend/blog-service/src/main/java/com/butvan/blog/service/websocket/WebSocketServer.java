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
     * @param message
     * @param id
     */
    @OnMessage
    public void onMessage(String message, @PathParam("id") String id) {
        log.info("收到来自客户端: [{}]的消息: [{}]",id,message);
        // TODO
    }

    @OnClose
    public void onClose(@PathParam("id") String id) {
        sessionMap.remove(id);
        log.info("客户端: [{}] 连接关闭，当前连接数: [{}]", id, sessionMap.size());
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
        if (session == null || session.isOpen()) {
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, reason));
            } catch (IOException e) {
                log.error("客户端: [{}] ws 连接关闭失败，报错信息: [{}]", id, e.getMessage());
                throw new RuntimeException(e);
            }
        }

        sessionMap.remove(id);
    }
}
