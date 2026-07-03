package com.butvan.blog.common.utils.domain;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * 统一 http 请求 接收的形参
 */
@Data
@Builder
public class HttpDto {

    String url;

    Map<String,String> headers;

    Map<String, Object> params;

    /** POST/PUT 请求体（JSON 字符串），与 params 二选一 */
    String body;
}
