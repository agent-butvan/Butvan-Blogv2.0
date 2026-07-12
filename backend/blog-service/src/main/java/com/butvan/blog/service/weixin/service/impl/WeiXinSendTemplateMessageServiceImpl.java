package com.butvan.blog.service.weixin.service.impl;

import cn.hutool.json.JSONUtil;
import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.common.utils.HttpUtils;
import com.butvan.blog.common.utils.domain.HttpDto;
import com.butvan.blog.common.utils.domain.HttpVo;
import com.butvan.blog.pojo.weixin.TemplateMessageDto;
import com.butvan.blog.pojo.weixin.TemplateMessageDto.TemplateData;
import com.butvan.blog.service.weixin.common.util.WeiXinBaseService;
import com.butvan.blog.service.weixin.service.WeiXinSendTemplateMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeiXinSendTemplateMessageServiceImpl implements WeiXinSendTemplateMessageService {

    private final WeiXinBaseService weiXinBaseService;
    private final WeiXinProperties weiXinProperties;

    /** 微信模板消息发送 API 基础 URL */
    private static final String TEMPLATE_SEND_URL = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=";

    /** 邮箱绑定提醒模板 ID */
    private static final String EMAIL_NOTICE_TEMPLATE_ID = "Lootde8JTbXjQQx2QC1Q88OqaKMgN7kwzIxMoTBkL0E";

    /** 登录成功通知模板 ID */
    private static final String LOGIN_SUCCESS_TEMPLATE_ID = "dNa5fJyhq6G2XrsfDckv0tpjhBiK51cFagX8x2OyRgU";

    /** 首次注册成功通知模版 ID */
    private static final String FIRST_REGISTER_TEMPLATE_ID = "2NEDWumdv03gRN48SRMnsvD-uWxS8iAthpH_Cg9j-fI";

    /**
     * 用户扫码登录成功后，发送模板消息通知
     *
     * @param openId 用户 openId
     * @return 微信 API 响应结果
     */
    @Override
    public String sendLoginSuccessMessage(String openId) {
        HashMap<String, TemplateData> data = new HashMap<>();
        data.put("time", TemplateData.of(LocalTime.now().toString(), "#000000"));
        return sendTemplateMessage(openId, "", LOGIN_SUCCESS_TEMPLATE_ID, data);
    }

    @Override
    public String sendRegisterSuccessMessage(String openId, String email) {
        HashMap<String, TemplateData> data = new HashMap<>();
        data.put("account", TemplateData.of(email, "#000000"));
        data.put("time", TemplateData.of(LocalDateTime.now().toString(), "#000000"));
        return sendTemplateMessage(openId,"",FIRST_REGISTER_TEMPLATE_ID,data);
    }

    /**
     * 提醒用户发送邮箱信息以完成账号绑定
     *
     * @param openId 用户 openId
     * @return 微信 API 响应结果
     */
    @Override
    public String sendEmailNoticeMessage(String openId) {
        Map<String, TemplateData> data = new HashMap<>();
        return sendTemplateMessage(openId, "", EMAIL_NOTICE_TEMPLATE_ID, data);
    }


    /**
     * 通用模板消息发送方法
     * <p>封装 access_token 获取、JSON 序列化、HTTP 请求等公共逻辑，
     * 上层业务方法只需关注模板 ID 和数据变量的组装。</p>
     *
     * @param openId     接收用户的 openId
     * @param templateId 模板消息 ID
     * @param data       模板变量数据（key 为变量名，value 为 { value, color }）
     * @return 微信 API 原始响应 JSON 字符串
     */
    private String sendTemplateMessage(String openId, String template_url, String templateId, Map<String, TemplateData> data) {
        // 1. 获取 access_token
        String accessToken = weiXinBaseService.getAccessToken(weiXinProperties.getAppid(), weiXinProperties.getAppsecret());
        String url = TEMPLATE_SEND_URL + accessToken;

        // 2. 构建请求体
        TemplateMessageDto message = TemplateMessageDto.builder()
                .touser(openId)
                .url(template_url)
                .template_id(templateId)
                .data(data)
                .build();
        String jsonBody = JSONUtil.toJsonStr(message);

        log.info("[微信模板消息] 发送给 openId={}, templateId={}", openId, templateId);

        log.info("jsonbody:{}", jsonBody);

        // 3. 发送请求
        HttpDto httpDto = HttpDto.builder()
                .url(url)
                .body(jsonBody)
                .build();
        HttpVo result = HttpUtils.post(httpDto);

        log.info("[微信模板消息] 响应: {}", result.getMap());

        String errmsg = result.getMap().get("errmsg").toString();

        if (errmsg != null && errmsg.equals("ok")) {
            return "success";
        } else {
            return "error";
        }
    }
}
