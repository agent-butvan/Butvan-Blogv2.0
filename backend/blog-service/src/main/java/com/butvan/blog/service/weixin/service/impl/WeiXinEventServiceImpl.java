package com.butvan.blog.service.weixin.service.impl;

import cn.hutool.json.JSONUtil;
import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.utils.FieldPrinterUtil;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.pojo.dto.common.WebSocketMessageBase;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.entity.WechatUser;
import com.butvan.blog.pojo.weixin.EventXmlData;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.repository.WechatUserRepository;
import com.butvan.blog.service.websocket.WebSocketServer;
import com.butvan.blog.service.weixin.common.constant.WeiXinRedisKeyPrefix;
import com.butvan.blog.service.weixin.service.WeiXinEventService;
import com.butvan.blog.service.weixin.service.WeiXinSendTemplateMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeiXinEventServiceImpl implements WeiXinEventService {

    private final WebSocketServer webSocketServer;
    private final RedisUtils redisUtils;

    private final WeiXinSendTemplateMessageService weiXinSendTemplateMessageService;

    private final WechatUserRepository wechatUserRepository;
    private final UserRepository userRepository;


    @Override
    public String weiXinServerPost(String xmlData) {
        log.info(xmlData);
        // 解析XML并自动打印所有带 @FieldLabel 注解的字段
        EventXmlData eventXmlData = FieldPrinterUtil.xmlToBean(xmlData, EventXmlData.class);

        /**
         * 根据 msgType event 进行决策
         * 1. 扫码后，未关注 + 关注后 + 发送邮箱信息 -> 登录成功
         * 2. 扫码后，已关注 + 判断邮箱信息是否存在 -> 不存在，发送信息
         *                                      -> 存在，登录成功
         *
         * 1. 第一种情况：
         * MsgType: event(事件)
         * event: subscribe(关注)
         * 发送邮箱信息
         * MsgType: text(文本)
         * event: null
         * content: 消息内容
         *
         * 2. 第二张情况
         * MsgType: event
         * Event: SCAN(用户已关注时事件推送)
         */
        handleEvent(eventXmlData);


        return "success";
    }

    private void handleEvent(EventXmlData eventXmlData) {
        if (eventXmlData.getMsgType().equals("event") && eventXmlData.getEvent().equals("subscribe")) {
            // 用户首次扫码，关注后
            // 1. 通知前端展示：已扫码关注
            // 2. 判断用户是否是第一次注册，依据是否存在历史的：用户openid
            // -> 1. 不存在：微信发送模版消息通知用户，发送邮箱信息 && 通知前端展示：发送邮箱信息给该公众号
            // -> 2. 存在：说明该用户之前关注过该公众号但是又取消关注了
            //      -> 1. 查询邮箱信息是否还存在，若存在：登录成功
            //      -> 2. 若邮箱信息不存在：重新通知该用户发送邮箱信息，登录成功
            userFirstRegister(eventXmlData);


        } else if (eventXmlData.getMsgType().equals("event") && eventXmlData.getEvent().equals("SCAN")) {
            // 用户已关注，扫码后
            // 1. 通知前端展示：已扫码
            // 2. 判断该用户邮箱信息是否存在
            // -> 1. 若不存在：通知前端展示：发送邮箱信息给该公众号 && 微信发送模版消息通知该用户，重新发送邮箱信息
            // -> 2. 若存在：登录成功
            userLogin(eventXmlData);
        }
    }

    /**
     * 用户首次注册
     * @param eventXmlData
     */
    private void userFirstRegister(EventXmlData eventXmlData) {
        /**
         * 此时需要判断，用户是通过二维码扫码关注的，还是微信搜索关注的
         * 根据ticket来判断
         * ticket存在则说明是通过扫码关注的
         * 不存在，则不是，也不需要进行任何通知的操作
         */
        String ticket = eventXmlData.getTicket();
        if (ticket != null) {
            // 1. 通知客户端，用户扫码成功
            String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + ticket;
            String ws_id = redisUtils.get(redis_key);
            if (ws_id != null) {
                scanQrCode(ws_id);
            }
        }

        String open_id = eventXmlData.getFromUserName();
        if (open_id != null) {
            String msg = weiXinSendTemplateMessageService.sendEmailNoticeMessage(open_id);
        }
    }

    /**
     * 用户扫码登录
     * @param eventXmlData
     */
    private void userLogin(EventXmlData eventXmlData) {
        // 1. 通知前端，用户已经扫码
        // 获取对应二维码的 ticket
        String qr_ticket = eventXmlData.getTicket();
        // 构建 redis key 获取 ws 建立的id
        String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + qr_ticket;
        String ws_id = redisUtils.get(redis_key);
        if (ws_id != null) {
            // 通知前端
            scanQrCode(ws_id);
        }

        // 2. 判断用户的邮箱信息是否存在
        // 获取用户的 open_id
        String open_id = eventXmlData.getFromUserName();
        WechatUser wechat_user_info = wechatUserRepository.findByOpenId(open_id).orElse(null);
        if (wechat_user_info == null || wechat_user_info.getUserId() == null) {
            throw new BusinessException("微信扫码登录失败，请尝试重新注册，请尝试重新注册");
        }
        User blog_user_info = userRepository.findById(wechat_user_info.getUserId()).orElse(null);
        String user_email = blog_user_info.getEmail();
        if (user_email == null) {
            // 用户邮箱信息不存在了，通知客户端
            userEmailException(ws_id);
        } else {
            // 3. 用户邮箱信息正常是，则正常登录
            // 更新用户的登录时间
            blog_user_info.setLastLoginAt(LocalDateTime.now());
            userRepository.save(blog_user_info);

            // 4. 通知前端登录成功
            userLoginSuccess(ws_id);
        }
    }

    /**
     * 用户登录成功
     * @param wsId
     */
    private void userLoginSuccess(String wsId) {
        WebSocketMessageBase webSocketMessageBase = WebSocketMessageBase.builder()
                .code(200)
                .event("weixin")
                .message("登录成功！")
                .build();

        String jsonStr = JSONUtil.toJsonStr(webSocketMessageBase);

        webSocketServer.sendMessage(wsId,jsonStr);
    }

    /**
     * 用户邮箱信息 异常的时候发送通知
     * @param wsId
     */
    private void userEmailException(String wsId) {
        WebSocketMessageBase webSocketMessageBase = WebSocketMessageBase.builder()
                .code(500)
                .event("login")
                .message("邮箱信息异常或已过期,请尝试重新发送邮箱信息至公众号")
                .build();

        String jsonStr = JSONUtil.toJsonStr(webSocketMessageBase);

        webSocketServer.sendMessage(wsId, jsonStr);
    }

    /**
     * 向客户端发送二维码已经被扫描的通知
     * @param wsId
     */
    private void scanQrCode(String wsId) {
        WebSocketMessageBase webSocketMessageBase = WebSocketMessageBase.builder()
                .code(200)
                .event("weixin")
                .message("二维码被扫描")
                .build();

        String jsonStr = JSONUtil.toJsonStr(webSocketMessageBase);

        webSocketServer.sendMessage(wsId,jsonStr);
    }
}
