package com.butvan.blog.service.weixin.service;

import cn.hutool.core.util.XmlUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class WeiXinEventServiceImpl implements WeiXinEventService{
    @Override
    public String weiXinServerPost(String xmlData) {
        // 1. 解析xml文件转换为map
        Map<String, Object> xml_map = XmlUtil.xmlToMap(xmlData);
        log.info("xml_map:{}",xml_map);

        // 2. 提取核心字段
        String toUserName =(String) xml_map.get("ToUserName");//公众号id
        String fromUserName =(String) xml_map.get("FromUserName");// 用户openID
        String event = (String) xml_map.get("Event");// 事件类型：subscribe（关注）
        String eventKey = (String) xml_map.get("EventKey");// 场景值
        String ticket = (String) xml_map.get("Ticket");// 二维码ticket
        String latitude = (String) xml_map.get("Latitude");// 维度
        String longitude = (String) xml_map.get("Longitude");// 经度

        log.info("公众号id：{}，用户openid：{}，事件类型：{}，场景值：{}，二维码ticket：{}，纬度：{}，经度：{}",
                toUserName,fromUserName,event,eventKey,ticket,latitude,longitude
                );



        return "success";
    }
}
