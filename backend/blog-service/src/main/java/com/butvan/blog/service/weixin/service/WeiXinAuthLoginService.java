package com.butvan.blog.service.weixin.service;

import com.butvan.blog.pojo.weixin.AuthLoginDto;

public interface WeiXinAuthLoginService {

    /**
     * 微信扫码等会，返回二维码图片 url
     * @return img url
     */
    AuthLoginDto qrcodeLogin();
}
