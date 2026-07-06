package com.butvan.blog.common.utils;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONUtil;
import com.butvan.blog.common.utils.domain.HttpDto;
import com.butvan.blog.common.utils.domain.HttpVo;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
public class HttpUtils {

    public static HttpVo get(HttpDto httpDto) {

        String base_url = httpDto.getUrl();
        HttpRequest request = HttpUtil.createGet(base_url);

        if (httpDto.getHeaders() != null) {
            request.addHeaders(httpDto.getHeaders());
        }

        if (httpDto.getParams() != null) {
            request.form(httpDto.getParams());
        }

        try (HttpResponse res = request.execute()){
            Map<String,Object> map = JSONUtil.toBean(res.body(), Map.class);

            return HttpVo.builder().map(map).build();
        }
    }

    /**
     * 发送 POST 请求
     * <p>
     * 支持携带请求头、URL 参数（form）和 JSON 请求体（body）。
     * body 和 params 可同时使用（params 作为查询参数追加到 URL），
     * 也可以单独使用 body 发送纯 JSON 请求。
     * </p>
     *
     * @param httpDto 请求参数封装（url / headers / params / body）
     * @return HttpVo 响应结果 Map
     */
    public static HttpVo post(HttpDto httpDto) {

        String base_url = httpDto.getUrl();
        HttpRequest request = HttpUtil.createPost(base_url);

        // 设置请求头
        if (httpDto.getHeaders() != null) {
            request.addHeaders(httpDto.getHeaders());
        }

        // 设置 URL 查询参数（form 表单方式）
        if (httpDto.getParams() != null) {
            request.form(httpDto.getParams());
        }

        // 设置 JSON 请求体（与 params 互不冲突，可共存）
        if (StrUtil.isNotBlank(httpDto.getBody())) {
            request.body(httpDto.getBody());
        }

        try (HttpResponse res = request.execute()){
            Map<String,Object> map = JSONUtil.toBean(res.body(), Map.class);

            return HttpVo.builder().map(map).build();
        }
    }

    /**
     * 发送 GET 请求，返回原始字节数组（适用于下载图片、文件等二进制响应）
     *
     * @param httpDto 请求参数封装（url / headers / params）
     * @return 响应内容的字节数组
     */
    public static byte[] getBytes(HttpDto httpDto) {

        String base_url = httpDto.getUrl();
        HttpRequest request = HttpUtil.createGet(base_url);

        if (httpDto.getHeaders() != null) {
            request.addHeaders(httpDto.getHeaders());
        }

        if (httpDto.getParams() != null) {
            request.form(httpDto.getParams());
        }

        try (HttpResponse res = request.execute()) {
            return res.bodyBytes();
        }
    }
}
