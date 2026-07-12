package com.butvan.blog.service.weixin.service;

/**
 * 发送微信模版消息
 */
public interface WeiXinSendTemplateMessageService {

    /**
     * 用户登录成功，发送模版消息
     * @param openId
     * @return
     */
    String sendLoginSuccessMessage(String openId);

    /**
     * 提醒用户发送邮箱文本信息
     * @param openId
     * @return
     */
    String sendEmailNoticeMessage(String openId);
}
