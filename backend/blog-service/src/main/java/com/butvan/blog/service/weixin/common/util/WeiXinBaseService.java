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

    /**
     * 获取 ticket
     * @param accessToken
     * @return {
     *      "ticket": "",
     * 	    "expire_seconds": 120,
     * 	    "url": "http://weixin.qq.com/q/02P7_xUI15aJ-1iV-7xG1s"
     * }
     */
    String getQrCodeTicket(String accessToken);

    /**
     * 通过 ticket 换取二维码图片
     *
     * @param ticket 二维码 ticket（需 URL Encode）
     * @return 二维码图片的字节数组
     */
    byte[] getQrCodeImage(String ticket);

}

