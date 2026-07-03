package com.butvan.blog.service.weixin.common.util;


import cn.hutool.core.util.StrUtil;
import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.utils.HttpUtils;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.common.utils.domain.HttpDto;
import com.butvan.blog.common.utils.domain.HttpVo;
import com.butvan.blog.service.weixin.common.constant.WeiXinApiBaseUrl;
import com.butvan.blog.service.weixin.common.constant.WeiXinRedisKeyPrefix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@Component
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
        if (StrUtil.isNotBlank(redis_access_token_value)) {
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

    @Override
    public String getQrCodeTicket(String accessToken) {

        // 获取 redis 存储 key
        String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_KEY;

        // 从redis中获取值
        String redis_ticket_value = redisUtils.get(redis_key);

        // 判断从 redis 中获取的值是否为空，不为空则直接返回
        if (StrUtil.isNotBlank(redis_ticket_value)) {
            return redis_ticket_value;
        }

        // 为空，则
        // 获取 api 请求 base url（access_token 必须拼在 URL 上，POST 的 form 会被 body 覆盖）
        String getQrcodeTicketBaseUrl = WeiXinApiBaseUrl.GET_QRCODE_TICKET_BASE_URL
                + "?access_token=" + accessToken;
        String json_body = """
                {
                    "expire_seconds": 120,
                    "action_name": "QR_STR_SCENE",
                    "action_info": {
                        "scene": {
                            "scene_str": "login"
                        }
                    }
                }
                """;

        HttpDto httpDto = HttpDto.builder()
                .url(getQrcodeTicketBaseUrl)
                .body(json_body)
                .build();
        HttpVo httpVo = HttpUtils.post(httpDto);

        // 提取 ticket
        Object ticketObj = httpVo.getMap().get("ticket");
        if (ticketObj == null) {
            log.error("获取微信二维码 ticket 失败，响应: {}", httpVo.getMap());
            throw new BusinessException(400,"获取微信二维码 ticket 失败, 响应值为 null");
        }
        String ticket = ticketObj.toString();
        // 提取 过期时间
        Object expire_seconds_in_obj = httpVo.getMap().get("expire_seconds");
        // 默认二维码过期时间：120s
        long expire_seconds = 120L;
        if (expire_seconds_in_obj instanceof Number) {
            expire_seconds = ((Number) expire_seconds_in_obj).longValue();
        } else if (expire_seconds_in_obj instanceof String) {
            try {
                expire_seconds = Long.parseLong((String) expire_seconds_in_obj);
            } catch (NumberFormatException e) {
                log.warn("解析 expire_seconds 失败，使用默认值 120 秒，原始值: {}", expire_seconds_in_obj);
            }
        }

        // 将 ticket 存入 redis，并设置过期时间（提前 10 秒过期留缓冲）
        long redisTtl = Math.max(expire_seconds - 10, 10);
        redisUtils.set(redis_key, ticket, redisTtl, TimeUnit.SECONDS);

        return ticket;
    }

    @Override
    public byte[] getQrCodeImage(String ticket) {

        // 通过 ticket 换取二维码图片（ticket 通过 form 自动 URL Encode）
        String url = WeiXinApiBaseUrl.SHOW_QRCODE_BASE_URL;
        Map<String, Object> params = new HashMap<>();
        params.put("ticket", ticket);

        HttpDto httpDto = HttpDto.builder()
                .url(url)
                .params(params)
                .build();

        byte[] imageBytes = HttpUtils.getBytes(httpDto);
        if (imageBytes == null || imageBytes.length == 0) {
            log.error("通过 ticket [{}] 获取二维码图片失败，响应为空", ticket);
            throw new BusinessException(400, "获取微信二维码图片失败");
        }
        return imageBytes;
    }
}
