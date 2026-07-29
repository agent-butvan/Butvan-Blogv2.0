package com.butvan.blog.service.listener;

import com.butvan.blog.common.properties.WeiXinProperties;
import com.butvan.blog.service.event.NotificationEvents.ArticlePublishedEvent;
import com.butvan.blog.service.repository.WechatUserRepository;
import com.butvan.blog.service.weixin.service.WeiXinSendTemplateMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

/**
 * 微信推送通知事件监听处理器
 * <p>
 * 监听系统文章发布等核心事件，在底层事务成功提交（AFTER_COMMIT）后，
 * 异步查询全量关注公众账号的用户，并调用微信 API 发送模板消息通知。
 * </p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WechatNotificationListener {

    private final WeiXinSendTemplateMessageService weiXinSendTemplateMessageService;
    private final WechatUserRepository wechatUserRepository;
    private final WeiXinProperties weiXinProperties;

    /**
     * 异步监听文章发布事件，在事务提交后向所有已关注用户发送微信模板消息
     *
     * @param event 文章发布事件传输对象
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleArticlePublishedEvent(ArticlePublishedEvent event) {
        log.info("【微信通知监听】收到文章发布事件，文章标题: [{}], ID: [{}]", event.getArticleTitle(), event.getArticleId());

        // 1. 检索所有处于已关注状态（status = 1）的微信公众号 openId
        List<String> openIds = wechatUserRepository.findAllFollowedOpenIds();
        if (openIds == null || openIds.isEmpty()) {
            log.info("【微信通知监听】当前没有状态为已关注的微信用户，跳过模板消息发送");
            return;
        }

        // 2. 拼接博客前台文章详情页的可跳转链接 URL
        String baseUrl = weiXinProperties.getClientBaseUrl();
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            baseUrl = "http://localhost:3000";
        }
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        String targetIdentifier = (event.getSlug() != null && !event.getSlug().trim().isEmpty())
                ? event.getSlug()
                : String.valueOf(event.getArticleId());
        String openUrl = baseUrl + "/article/" + targetIdentifier;

        log.info("【微信通知监听】准备向 {} 个用户发送模板消息，卡片跳转链接: {}", openIds.size(), openUrl);

        // 3. 调用微信模板消息发送服务
        try {
            String result = weiXinSendTemplateMessageService.sendArticleUpdateMessage(
                    openIds,
                    event.getArticleTitle(),
                    event.getCategoryName(),
                    event.getArticleTime(),
                    event.getArticleSummary(),
                    openUrl
            );
            log.info("【微信通知监听】微信模板消息发送执行完毕，响应结果: {}", result);
        } catch (Exception ex) {
            log.error("【微信通知监听】发送微信模板消息时产生异常", ex);
        }
    }
}
