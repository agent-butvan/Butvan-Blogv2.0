package com.butvan.blog.service.weixin.controller;

import cn.hutool.crypto.SecureUtil;
import com.butvan.blog.service.weixin.service.WeiXinEventService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/api/weixin/event")
@RequiredArgsConstructor
public class WeiXinEventController {

    private final WeiXinEventService weiXinEventService;

    /**
     * 处理微信的POST事件的请求
     * @param request
     * @return
     */
    @GetMapping("/callback")
    public String verifyWeixinServer(HttpServletRequest request) {

        log.info("微信验证消息");

        // 1.获取微信传入的参数
        String signature = request.getParameter("signature");// 微信加密签名
        String timestamp = request.getParameter("timestamp");// 时间戳
        String nonce = request.getParameter("nonce");// 随机数
        String echostr = request.getParameter("echostr");// 随机字符串（验证通过需要返回）

        // 2.按照微信规则验证签名：将token、timestamp、nonce按字典序排序拼接，SHA1加密，与signature对比
        String[] arr = {"Q7pL2xR9kF4sT8mZ", timestamp, nonce};
        Arrays.sort(arr);// 字典排序
        String sortedStr = arr[0] + arr[1] + arr[2];
        String encrytedStr = SecureUtil.sha1(sortedStr);

        if (encrytedStr.equals(signature)) {
            return echostr;
        }

        return "";

    }

    /**
     * 处理微信的POST请求事件推送
     * 注意：微信推送的POST请求体是XML格式，需要用@RequestBody接受原始数据
     * @param xmlData
     * @return
     */
    @PostMapping("/callback")
    public String handleWeixinEvent(@RequestBody String xmlData) {
        log.info("接收到微信的事件推送");
        return weiXinEventService.weiXinServerPost(xmlData);
    }
}
