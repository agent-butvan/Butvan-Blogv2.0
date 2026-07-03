package com.butvan.blog.service.weixin.common.constant;

/**
 * weixin 接口请求的一些 base url
 */
public interface WeiXinApiBaseUrl {

    /**
     *  获取 access token
     */
    String GET_ACCESS_TOKEN_BASE_URL = "https://api.weixin.qq.com/cgi-bin/token";

    /**
     * 获取 二维码 ticket
     */
    String GET_QRCODE_TICKET_BASE_URL = "https://api.weixin.qq.com/cgi-bin/qrcode/create";

    /**
     * 通过 ticket 换取二维码图片
     */
    String SHOW_QRCODE_BASE_URL = "https://mp.weixin.qq.com/cgi-bin/showqrcode";
}
