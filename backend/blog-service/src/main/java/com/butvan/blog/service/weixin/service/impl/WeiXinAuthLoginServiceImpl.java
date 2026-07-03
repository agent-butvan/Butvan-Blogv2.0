package com.butvan.blog.service.weixin.service.impl;

import com.butvan.blog.common.exception.BusinessException;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class WeiXinAuthLoginServiceImpl implements WeiXinAuthLoginService {

    private final WeiXinBaseService weiXinBaseService;
    private final WeiXinProperties weiXinProperties;
    private final FileStorageService fileStorageService;

    @Override
    public String qrcodeLogin() {

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
            return accessUrl;
        } catch (IOException e) {
            log.error("上传微信二维码图片失败", e);
            throw new BusinessException(500, "获取微信二维码图片失败");
        }
    }
}
