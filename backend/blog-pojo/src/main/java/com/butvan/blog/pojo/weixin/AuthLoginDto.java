package com.butvan.blog.pojo.weixin;

/**
 * 客户端获取二维码 DTO
 */
public record AuthLoginDto(
        String qrUrl,
        String wsId
) {}

