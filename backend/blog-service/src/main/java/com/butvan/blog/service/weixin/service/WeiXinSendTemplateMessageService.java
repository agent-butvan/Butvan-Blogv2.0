package com.butvan.blog.service.weixin.service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 发送微信模版消息
 */
public interface WeiXinSendTemplateMessageService {

    /**
     * 博客文章更新，发送模版消息
     * @param openIds 本站中所有关注微信公众号用户的 openId，也就是 blog_wechat_user 中所有openId
     * @param articleTitle 更新的文章标题
     * @param articleCategory 更新文章的分类
     * @param articleTime 文章更新的时间
     * @param articleSummary 更新文章的摘要
     * @param openUrl 更新文章可打开的 url 链接（用户之后点击，就会打开此链接）
     * @return
     */
    String sendArticleUpdateMessage(List<String> openIds, String articleTitle,
                                    String articleCategory, LocalDateTime articleTime,
                                    String articleSummary, String openUrl);

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
