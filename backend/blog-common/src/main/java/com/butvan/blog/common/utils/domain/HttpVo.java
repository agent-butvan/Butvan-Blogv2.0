package com.butvan.blog.common.utils.domain;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * 统一 http 请求返回对象
 */
@Data
@Builder
public class HttpVo {

    Map<String,String> map;
}
