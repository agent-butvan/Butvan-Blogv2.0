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
     * 用户首次注册成功，发送模版消息
     *
     * @param openId 用户 openId
     * @param email  注册邮箱
     * @return 发送结果
     */
    String sendRegisterSuccessMessage(String openId, String email);

    /**
     * 当用户的账号和微信绑定后，发送模版消息
     * @param openId
     * @param email
     * @return
     */
    String sendWechatBindNotification(String openId, String email);

    /**
     * 提醒用户发送邮箱文本信息
     * @param openId
     * @return
     */
    String sendEmailNoticeMessage(String openId);
}
