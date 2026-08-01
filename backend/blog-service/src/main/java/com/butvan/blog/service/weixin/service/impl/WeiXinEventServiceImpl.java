package com.butvan.blog.service.weixin.service.impl;

import cn.hutool.json.JSONUtil;
import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.utils.EmailUtils;
import com.butvan.blog.common.utils.FieldPrinterUtil;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.pojo.dto.common.WebSocketMessageBase;
import com.butvan.blog.pojo.dto.common.WsNotice;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.entity.WechatUser;
import com.butvan.blog.pojo.weixin.EventXmlData;
import com.butvan.blog.pojo.weixin.QrLoginResult;
import com.butvan.blog.pojo.weixin.WechatEvent;
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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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

        // 1. 将 xml 解析为具体的 WechatEvent 对象
        WechatEvent wechatEvent = parseXmlToWechatEvent(xmlData);

        // 2. 无须处理或未定义的微信事件，直接返回 success 告知微信服务器
        if (wechatEvent == null) {
            return "success";
        }

        // 3. 模式匹配
        handleEvent(wechatEvent);

        return "success";
    }

    private WechatEvent parseXmlToWechatEvent(String xmlData) {
        EventXmlData raw = FieldPrinterUtil.xmlToBean(xmlData, EventXmlData.class);
        if ("event".equals(raw.getMsgType())) {
            if ("subscribe".equals(raw.getEvent())) {
                return new WechatEvent.Subscribe(raw.getFromUserName(), raw.getToUserName(), raw.getCreateTime(),
                        raw.getTicket(), raw.getEventKey());
            } else if ("SCAN".equals(raw.getEvent())) {
                return new WechatEvent.Scan(raw.getFromUserName(), raw.getToUserName(), raw.getCreateTime(),
                        raw.getTicket(), raw.getEventKey());
            } else if ("unsubscribe".equals(raw.getEvent())) {
                return new WechatEvent.Unsubscribe(raw.getFromUserName(), raw.getToUserName(), raw.getCreateTime());
            } else if ("TEMPLATESENDJOBFINISH".equals(raw.getEvent())) {
                // 忽略模板消息发送结果送达事件
                log.info("接收到微信模板消息送达结果通知, msgId={}", raw.getMsgId());
                return null;
            }
        } else if ("text".equals(raw.getMsgType())) {
            return new WechatEvent.TextMessage(raw.getFromUserName(), raw.getToUserName(), raw.getCreateTime(),
                    raw.getContent(), raw.getMsgId());
        }
        log.warn("收到未定义的微信推送消息, msgType={}, event={}", raw.getMsgType(), raw.getEvent());
        return null;
    }

    private void handleEvent(WechatEvent wechatEvent) {
        switch (wechatEvent) {
            case WechatEvent.Subscribe subscribe -> userFirstRegister(subscribe);
            case WechatEvent.Scan scan -> userLogin(scan);
            case WechatEvent.TextMessage textMessage -> userText(textMessage);
            case WechatEvent.Unsubscribe unsubscribe -> userUnSubscribe(unsubscribe);
        }
    }

    /**
     * 用户取消关注
     */
    private void userUnSubscribe(WechatEvent.Unsubscribe unsubscribe) {
        String open_id = unsubscribe.fromUserName();
        // 将 微信用户表中的状态字段设置为 0 即可
        WechatUser wechatUser = wechatUserRepository.findByOpenId(open_id).orElse(null);
        if (wechatUser != null && wechatUser.getStatus() == 1) {
            wechatUser.setStatus(0);
            wechatUserRepository.save(wechatUser);
        }
    }

    /**
     * 用户发送文本消息
     * <p>
     * 从文本中提取邮箱地址，完成用户创建/绑定流程：
     * </p>
     * <ol>
     * <li>正则提取邮箱并校验</li>
     * <li>查找或创建 WechatUser 记录</li>
     * <li>查找或创建 User 记录（仅用 email）</li>
     * <li>关联 WechatUser.userId → User.id</li>
     * </ol>
     */
    private void userText(WechatEvent.TextMessage textMessage) {
        // 获取用户发送的文本信息内容
        String content = textMessage.content();
        String openId = textMessage.fromUserName();
        log.info("用户文本消息, openId={}, content={}", openId, content);

        // 1. 从文本中提取邮箱并校验格式
        String email = EmailUtils.extractEmail(content);
        if (email == null || !EmailUtils.isValidEmail(email)) {
            log.info("用户 [{}] 发送的文本未包含有效邮箱: {}", openId, content);
            // TODO: 回复用户提示重新发送正确格式的邮箱
            return;
        }
        log.info("提取到有效邮箱: {}, openId={}", email, openId);

        // 2. 查找或创建 WechatUser 记录
        WechatUser wechatUser = wechatUserRepository.findByOpenId(openId).orElse(null);
        if (wechatUser == null) {
            // 只有不存在的时候，才创建新用户
            wechatUser = WechatUser.builder()
                    .openId(openId)
                    .build();
            wechatUser = wechatUserRepository.save(wechatUser);
            log.info("创建 WechatUser 记录, openId={}, id={}", openId, wechatUser.getId());

            String redis_key = WeiXinRedisKeyPrefix.REDIS_FIRST_REGISTER_OPEN_ID_BING_TICKET + openId;
            String ticket = redisUtils.get(redis_key);
            String redis_key2 = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + ticket;
            String ws_id = redisUtils.get(redis_key2);

            // 3. 查找或创建 User 记录
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                // 说明 user 表中也没有改用户信息
                user = User.builder()
                        .email(email)
                        .role("USER")
                        .status("ACTIVE")
                        .lastLoginAt(LocalDateTime.now())
                        .build();
                // 首次创建
                user = userRepository.save(user);
                log.info("创建 User 记录, userId={}, email={}", user.getId(), email);

                // 4. 关联 WechatUser → User
                wechatUser.setUserId(user.getId());
                wechatUserRepository.save(wechatUser);
                log.info("绑定完成, openId={}, userId={}, email={}", openId, user.getId(), email);

                // 注册成功，发送模版消息通知用户
                weiXinSendTemplateMessageService.sendRegisterSuccessMessage(openId, email);
                // 获取 ws_id
                if (ws_id != null) {
                    String exchangeCode = generateExchangeCode(user.getId());
                    userFirstRegisterSuccess(ws_id, exchangeCode);
                }
            } else if (wechatUser.getUserId() == null) {
                /**
                 * 当用户表中存在数据，但是微信用户表没有数据
                 * 说明该用户可能是先使用邮箱注册的，之后又使用微信绑定
                 * 需要发送模版消息提示该用户绑定成功
                 */
                User user_info = userRepository.findByEmail(email).orElse(null);
                if (user_info != null) {
                    wechatUser.setUserId(user_info.getId());
                    wechatUserRepository.save(wechatUser);
                    weiXinSendTemplateMessageService.sendWechatBindNotification(openId, email);

                    if (ticket != null) {
                        // 只有是 二维码扫描的情况下才向客户端发送登录成功
                        // 生成交换码，通知客户端登录成功
                        String exchangeCode = generateExchangeCode(user_info.getId());
                        userLoginSuccess(ws_id, exchangeCode);
                    }
                }
            } else {
                // 更新最后登录时间
                user.setLastLoginAt(LocalDateTime.now());
                user = userRepository.save(user);
                log.info("更新 User 登录时间, userId={}, email={}", user.getId(), email);
            }
        } else {
            // 如果存在，则说明不是首次注册
            // 3. 若 WechatUser 已关联 User，直接返回（已绑定）
            if (wechatUser.getUserId() != null) {
                User existingUser = userRepository.findById(wechatUser.getUserId()).orElse(null);
                if (existingUser != null && email.equals(existingUser.getEmail())) {
                    log.info("用户账号已绑定，不得重复绑定, openId={}, userId={}, email={}", openId, existingUser.getId(), email);
                    // TODO: 回复用户告知已绑定
                    return;
                }
            }

        }
    }

    /**
     * 用户首次注册
     */
    private void userFirstRegister(WechatEvent.Subscribe subscribe) {
        /**
         * 此时需要判断，用户是通过二维码扫码关注的，还是微信搜索关注的
         * 根据ticket来判断
         * ticket存在则说明是通过扫码关注的
         * 不存在，则不是，也不需要进行任何通知的操作
         */
        String ticket = subscribe.ticket();
        String open_id = subscribe.fromUserName();

        // 微信用户限定名额：20名
        long activeCount = wechatUserRepository.countByStatus(WechatUser.STATUS_FOLLOWED);
        if (activeCount >= 20) {
            log.warn("微信用户关注名额已满（上限 20 人），当前已关注人数：{}，拒绝 openId={} 的关注注册", activeCount, open_id);
            return;
        }

        String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + ticket;
        String ws_id = redisUtils.get(redis_key);
        if (ticket != null && open_id != null) {
            // 1. 通知客户端，用户扫码成功
            if (ws_id != null) {
                scanQrCode(ws_id);
            }

            // 使用用户的 open_id 和二维码 ticket 做绑定
            String redis_key2 = WeiXinRedisKeyPrefix.REDIS_FIRST_REGISTER_OPEN_ID_BING_TICKET + open_id;
            // 过期时间和 ticket 保持一致
            redisUtils.set(redis_key2, ticket, 120, TimeUnit.SECONDS);
        }

        // 查询 微信用户表是否存在记录，也就是判断用户是否是二次关注
        WechatUser wechatUser = wechatUserRepository.findByOpenId(open_id).orElse(null);
        if (wechatUser != null && wechatUser.getStatus() == 0 && wechatUser.getUserId() != null) {
            // 说明是二次关注
            // 直接更新 状态字段即可
            wechatUser.setStatus(1);
            wechatUserRepository.save(wechatUser);

            weiXinSendTemplateMessageService.sendLoginSuccessMessage(open_id);

            // 生成交换码，通知客户端登录成功
            String exchangeCode = generateExchangeCode(wechatUser.getUserId());
            userLoginSuccess(ws_id, exchangeCode);
            return;
        }

        // 2. 发送模版消息
        if (open_id != null) {
            String msg = weiXinSendTemplateMessageService.sendEmailNoticeMessage(open_id);
        }
    }

    /**
     * 用户扫码登录
     */
    private void userLogin(WechatEvent.Scan scan) {
        // 1. 通知前端，用户已经扫码
        // 获取对应二维码的 ticket
        String qr_ticket = scan.ticket();
        String open_id = scan.fromUserName();
        // 构建 redis key 获取 ws 建立的id
        String redis_key = WeiXinRedisKeyPrefix.REDIS_QRCODE_TICKET_WS_ID_KEY + qr_ticket;
        String ws_id = redisUtils.get(redis_key);
        if (ws_id != null) {
            // 通知前端
            scanQrCode(ws_id);
        }

        // 2. 校验并获取登录处理结果
        QrLoginResult result = calculateLoginResult(open_id);

        // 3. 使用 Java 21 switch 模式匹配分发后续动作
        switch (result) {
            case QrLoginResult.Success(Long userId, String code) -> {
                userLoginSuccess(ws_id, code);
                weiXinSendTemplateMessageService.sendLoginSuccessMessage(open_id);
            }
            case QrLoginResult.EmailMissing(String id) -> {
                userEmailException(ws_id);
            }
            case QrLoginResult.UserNotFound(String id) -> {
                throw new BusinessException("微信扫码登录失败，请尝试重新注册");
            }
            default -> log.warn("微信扫码未预期的结果, openId={}", open_id);
        }
    }

    private QrLoginResult calculateLoginResult(String openId) {
        WechatUser wechatUser = wechatUserRepository.findByOpenId(openId).orElse(null);
        if (wechatUser == null || wechatUser.getUserId() == null) {
            return new QrLoginResult.UserNotFound(openId);
        }

        User blogUser = userRepository.findById(wechatUser.getUserId()).orElse(null);
        if (blogUser == null || blogUser.getEmail() == null) {
            return new QrLoginResult.EmailMissing(openId);

        }

        blogUser.setLastLoginAt(LocalDateTime.now());
        userRepository.save(blogUser);

        String exchangeCode = generateExchangeCode(blogUser.getId());
        return new QrLoginResult.Success(blogUser.getId(), exchangeCode);
    }

    /**
     * 统一发送 WsNotice 消息方法
     * 
     * @param wsId
     * @param notice
     */
    private void sendWsNotice(String wsId, WsNotice notice) {
        System.out.println("##### notice:" + JSONUtil.toJsonStr(notice) + "#####");
        if (wsId != null) {
            webSocketServer.sendMessage(wsId, JSONUtil.toJsonStr(notice));
        }
    }

    /**
     * 用户首次注册账号成功，通知客户端
     *
     * @param wsId         WebSocket 连接 ID
     * @param exchangeCode Token 交换码
     */
    private void userFirstRegisterSuccess(String wsId, String exchangeCode) {
        sendWsNotice(wsId, WsNotice.LoginSuccess.of("注册成功！欢迎加入可梵博客！", exchangeCode));
    }

    /**
     * 用户登录成功，通知客户端
     *
     * @param wsId         WebSocket 连接 ID
     * @param exchangeCode Token 交换码
     */
    private void userLoginSuccess(String wsId, String exchangeCode) {
        sendWsNotice(wsId, WsNotice.LoginSuccess.of("登录成功！", exchangeCode));
    }

    /**
     * 用户邮箱信息 异常的时候发送通知
     * 
     * @param wsId
     */
    private void userEmailException(String wsId) {
        sendWsNotice(wsId, new WsNotice.EmailException());
    }

    /**
     * 向客户端发送二维码已经被扫描的通知
     *
     * @param wsId WebSocket 连接 ID
     */
    private void scanQrCode(String wsId) {
        sendWsNotice(wsId, new WsNotice.QrScanned());
    }

    /**
     * 生成微信登录交换码并存入 Redis
     * <p>
     * 前端通过 WS 收到此码后，调用 HTTP 接口换取 httpOnly Cookie
     * </p>
     *
     * @param userId 用户 ID
     * @return 一次性交换码（UUID，60 秒过期）
     */
    private String generateExchangeCode(Long userId) {
        String code = UUID.randomUUID().toString().replace("-", "");
        String key = WeiXinRedisKeyPrefix.REDIS_WECHAT_EXCHANGE_CODE + code;
        redisUtils.set(key, String.valueOf(userId), 60, TimeUnit.SECONDS);
        log.info("生成微信登录交换码, userId={}, code={}", userId, code);
        return code;
    }
}
