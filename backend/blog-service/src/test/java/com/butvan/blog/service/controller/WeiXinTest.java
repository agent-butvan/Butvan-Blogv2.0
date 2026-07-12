package com.butvan.blog.service.controller;

import com.butvan.blog.service.weixin.service.WeiXinSendTemplateMessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WeiXinTest {

    @Autowired
    private WeiXinSendTemplateMessageService weiXinSendTemplateMessageService;

    @Test
    void main() {
        weiXinSendTemplateMessageService.sendEmailNoticeMessage("ogcWtvrXOtRDZ0Qu8pDpifGkntbs");
    }
}
