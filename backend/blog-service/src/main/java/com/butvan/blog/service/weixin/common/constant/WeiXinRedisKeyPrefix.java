package com.butvan.blog.service.weixin.common.constant;

public interface WeiXinRedisKeyPrefix {

    /**
     * 微信的 access_token 存储在 redis 中的key
     */
    String REDIS_ACCESS_TOKEN_KEY = "weixin:access_token";

    /**
     * 微信的 ticket 存储在 redis 中的key
     */
    String REDIS_QRCODE_TICKET_KEY = "weixin:qrocde:ticket";
}
