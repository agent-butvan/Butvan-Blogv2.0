package com.butvan.blog.common.utils;

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
}
