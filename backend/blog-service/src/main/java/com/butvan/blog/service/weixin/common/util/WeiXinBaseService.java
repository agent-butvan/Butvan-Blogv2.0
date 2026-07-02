package com.butvan.blog.service.weixin.common.util;

/**
 * 实现和 weixin api 之间交互的基础
 */
public interface WeiXinBaseService {

    /**
     * 获取 access_token
     * @param appId
     * @param secret
     * @return {
     *     "access_token": "",
     *     "expires_in": 7200
     * }
     */
    String getAccessToken(String appId, String secret);
}

