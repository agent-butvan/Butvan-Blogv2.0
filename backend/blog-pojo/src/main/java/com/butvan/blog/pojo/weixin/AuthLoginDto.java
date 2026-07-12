package com.butvan.blog.pojo.weixin;

import lombok.Builder;
import lombok.Data;

/**
 * 客户端获取二维码
 */
@Data
@Builder
public class AuthLoginDto {

    private String qrUrl;

    private String wsId;

}
