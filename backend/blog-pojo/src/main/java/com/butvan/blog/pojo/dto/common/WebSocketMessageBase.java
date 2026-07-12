package com.butvan.blog.pojo.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * websocket 消息推送的基类
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketMessageBase {

    /**
     * 状态吗
     */
    private int code;

    /**
     * 场景
     * login：登录场景
     * weixin：微信操作相关场景
     */
    private String event;

    /**
     * 客户端展示信息
     */
    private String message;
}
