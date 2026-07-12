package com.butvan.blog.pojo.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * websocket 消息推送的基类
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketMessageBase {

    /**
     * 状态码
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

    /**
     * 扩展数据（可选）
     * <p>用于下发业务附加数据，如 exchangeCode、用户信息等</p>
     */
    private Map<String, Object> data;
}
