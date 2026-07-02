package com.butvan.blog.service.weixin.common.util;


import com.butvan.blog.common.utils.HttpUtils;
import com.butvan.blog.common.utils.domain.HttpDto;
import com.butvan.blog.common.utils.domain.HttpVo;
import com.butvan.blog.service.weixin.common.constant.WeiXinApiBaseUrl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WeiXinBaseServiceImpl implements WeiXinBaseService{


    @Override
    public String getAccessToken(String appId, String secret) {

        String getAccessTokenBaseUrl = WeiXinApiBaseUrl.GET_ACCESS_TOKEN_BASE_URL;
        Map<String,Object> params = new HashMap<>();
        params.put("appid",appId);
        params.put("secret",secret);
        params.put("grant_type","client_credential");

        HttpDto http_dto = HttpDto.builder()
                .url(getAccessTokenBaseUrl)
                .params(params)
                .build();
        HttpVo httpVo = HttpUtils.get(http_dto);


        return httpVo.getMap().get("access_token");
    }
}
