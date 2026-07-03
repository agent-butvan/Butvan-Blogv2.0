package com.butvan.blog.service.controller;

import com.butvan.blog.service.weixin.common.util.WeiXinBaseService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@Slf4j
@SpringBootTest
public class HttpTest {

    @Autowired
    private WeiXinBaseService weiXinBaseService;

    @Test
    void get() {
        String accessToken = weiXinBaseService.getAccessToken("wx8afe4fc4ce1af1eb", "b34313cf29225fae1c2c785839ae688e");
        log.info("access_token: {}",accessToken);
    }
}
