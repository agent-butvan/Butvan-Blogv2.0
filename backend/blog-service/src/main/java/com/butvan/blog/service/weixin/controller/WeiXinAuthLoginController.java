package com.butvan.blog.service.weixin.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.weixin.AuthLoginDto;
import com.butvan.blog.service.weixin.service.WeiXinAuthLoginService;
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

    private final WeiXinAuthLoginService weiXinAuthLoginService;


    @TrackApi("wei Xin Login")
    @PostMapping("/login")
    public Result<AuthLoginDto> weiXinLogin() {
        AuthLoginDto res = weiXinAuthLoginService.qrcodeLogin();

        return Result.success(res);
    }
}
