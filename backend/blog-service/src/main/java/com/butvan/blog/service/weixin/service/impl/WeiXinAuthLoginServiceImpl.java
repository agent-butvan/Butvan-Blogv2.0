package com.butvan.blog.service.weixin.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.pojo.entity.WechatUser;
import com.butvan.blog.pojo.weixin.AuthLoginDto;
import com.butvan.blog.service.repository.WechatUserRepository;
import com.butvan.blog.service.weixin.common.constant.WeiXinRedisKeyPrefix;
import com.butvan.blog.service.weixin.common.util.WeiXinBaseService;
import com.butvan.blog.service.weixin.service.WeiXinAuthLoginService;
import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.common.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeiXinAuthLoginServiceImpl implements WeiXinAuthLoginService {

    private final WeiXinBaseService weiXinBaseService;
    private final WechatUserRepository wechatUserRepository;

    private final WeiXinProperties weiXinProperties;
    private final FileStorageService fileStorageService;
    private final RedisUtils redisUtils;

    @Override
    public AuthLoginDto qrcodeLogin() {

        // 前置条件：微信登录限定名额：20名
        long activeCount = wechatUserRepository.countByStatus(WechatUser.STATUS_FOLLOWED);
        if (activeCount >= 20) {
            throw new BusinessException("微信用户关注名额已满（上限 20 人）");
        }

        // 1. 前置条件获取 access token
        String accessToken = weiXinBaseService.getAccessToken(weiXinProperties.getAppid(), weiXinProperties.getAppsecret());

        // 2. 获取 ticket
        String qrCodeTicket = weiXinBaseService.getQrCodeTicket(accessToken);

        // 3. 获取二维码图片字节
        byte[] qrCodeImage = weiXinBaseService.getQrCodeImage(qrCodeTicket);

        // 4. 上传二维码图片到文件存储（自动适配本地 / MinIO）
        String objectName = "qrcode/" + UUID.randomUUID() + ".jpg";
        try (InputStream inputStream = new ByteArrayInputStream(qrCodeImage)) {
            String accessUrl = fileStorageService.upload(inputStream, objectName, "image/jpg", qrCodeImage.length);
            log.info("微信二维码图片已上传，访问地址: {}", accessUrl);

            // 5. 构造一个之后与服务端 ws 连接的id
            String ws_id = UUID.randomUUID().toString();

            // 6. 将 ws_id 缓存进入 redis， key：ticket、value: ws_id 过期时间设置为与ticket过期时间一致，120s
            String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + qrCodeTicket;
            redisUtils.set(redis_key, ws_id, 120, TimeUnit.SECONDS);

            AuthLoginDto dto = AuthLoginDto.builder()
                    .qrUrl(accessUrl)
                    .wsId(ws_id)
                    .build();

            return dto;
        } catch (IOException e) {
            log.error("上传微信二维码图片失败", e);
            throw new BusinessException(500, "获取微信二维码图片失败");
        }
    }
}
