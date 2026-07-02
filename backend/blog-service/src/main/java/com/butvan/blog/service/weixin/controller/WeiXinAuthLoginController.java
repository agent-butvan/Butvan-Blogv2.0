package com.butvan.blog.service.weixin.controller;

import com.butvan.blog.common.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/weixin")
public class WeiXinAuthLoginController {


    @PostMapping("/login")
    public Result weiXinLogin() {
        return null;
    }
}
