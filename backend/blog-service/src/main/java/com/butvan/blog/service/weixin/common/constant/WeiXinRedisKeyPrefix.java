package com.butvan.blog.service.weixin.common.constant;

public interface WeiXinRedisKeyPrefix {

    /**
     * 微信的 access_token 存储在 redis 中的key
     */
    String REDIS_ACCESS_TOKEN_KEY = "weixin:access_token";

    /**
     * 微信的 ticket 存储在 redis 中的key
     *
     * ticket 不能重复使用
     */
    //String REDIS_QRCODE_TICKET_KEY = "weixin:qrocde:ticket";

    String REDIS_QRCODE_TICKET_WS_ID_KEY = "ws:ticket-ws_id:";

    String REDIS_FIRST_REGISTER_OPEN_ID_BING_TICKET = "ws:open_id-ticket:";

    /** 微信登录 Token Exchange 交换码 Key 前缀（Value=userId，TTL 60s，一次性使用） */
    String REDIS_WECHAT_EXCHANGE_CODE = "wechat:exchange:";
}
