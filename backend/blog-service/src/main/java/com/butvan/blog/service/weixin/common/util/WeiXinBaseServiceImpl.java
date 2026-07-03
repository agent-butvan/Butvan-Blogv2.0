package com.butvan.blog.service.weixin.common.util;


import cn.hutool.core.util.StrUtil;
import com.butvan.blog.common.utils.HttpUtils;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.common.utils.domain.HttpDto;
import com.butvan.blog.common.utils.domain.HttpVo;
import com.butvan.blog.service.weixin.common.constant.WeiXinApiBaseUrl;
import com.butvan.blog.service.weixin.common.constant.WeiXinRedisKeyPrefix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeiXinBaseServiceImpl implements WeiXinBaseService{

    private final RedisUtils redisUtils;


    @Override
    public String getAccessToken(String appId, String secret) {

        // 拼接 redis key， 用于access_token 是通用的，所以 key 无需动态
        String redis_key = WeiXinRedisKeyPrefix.REDIS_ACCESS_TOKEN_KEY;

        // 从 redis 获取 access_token
        String redis_access_token_value = redisUtils.get(redis_key);

        // 判断 access_token 是否存在
        if (StrUtil.isNotBlank(redis_access_token_value) && redis_access_token_value != null) {
            // 说明 redis 中已经存在了 access_token，直接返回即可
            return redis_access_token_value;
        }

        // 不存在，则
        // 获取api请求的 base url
        String getAccessTokenBaseUrl = WeiXinApiBaseUrl.GET_ACCESS_TOKEN_BASE_URL;
        // 创建请求参数
        Map<String,Object> params = new HashMap<>();
        params.put("appid",appId);
        params.put("secret",secret);
        params.put("grant_type","client_credential");

        HttpDto http_dto = HttpDto.builder()
                .url(getAccessTokenBaseUrl)
                .params(params)
                .build();
        HttpVo httpVo = HttpUtils.get(http_dto);
        // 提取出 access_token（微信返回的是字符串）
        String access_token = String.valueOf(httpVo.getMap().get("access_token"));

        // 提取出 access_token 的过期时间（微信返回的是数值，如 7200，Hutool 解析为 Integer）
        Object expiresInObj = httpVo.getMap().get("expires_in");
        long expiresInSeconds = 7200L; // 默认 2 小时
        if (expiresInObj instanceof Number) {
            expiresInSeconds = ((Number) expiresInObj).longValue();
        } else if (expiresInObj instanceof String) {
            try {
                expiresInSeconds = Long.parseLong((String) expiresInObj);
            } catch (NumberFormatException e) {
                log.warn("解析 expires_in 失败，使用默认值 7200 秒，原始值: {}", expiresInObj);
            }
        }

        // 存入 redis，并设置过期时间（比微信返回的提前 60 秒过期，留缓冲）
        long redisTtl = Math.max(expiresInSeconds - 60, 60);
        redisUtils.set(redis_key, access_token, redisTtl, TimeUnit.SECONDS);

        return access_token;
    }
}
