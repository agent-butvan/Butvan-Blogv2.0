package com.butvan.blog.pojo.weixin;

import com.butvan.blog.common.annotation.FieldLabel;
import lombok.Data;

/**
 * 微信服务器推送的xml数据
 */
@Data
public class EventXmlData {

    /**
     * 开发者微信号
     */
    @FieldLabel("开发者微信号")
    private String toUserName;

    /**
     * 发送方账号（OpenID）
     */
    @FieldLabel("发送方账号（OpenID）")
    private String fromUserName;

    /**
     * 消息创建时间（整型）
     */
    @FieldLabel("消息创建时间")
    private int createTime;

    /**
     * 消息类型（text：文本，event：事件）
     */
    @FieldLabel("消息类型")
    private String msgType;

    /**
     * 事件类型（subscribe：订阅，unsubscribe：取消订阅）
     */
    @FieldLabel("事件类型")
    private String event;

    /**
     * 事件KEY值，qrscene_为前缀，后面为二维码的场景值ID
     */
    @FieldLabel("事件KEY值")
    private String eventKey;

    /**
     * 二维码的ticket，可用来换取二维码图片
     */
    @FieldLabel("二维码ticket")
    private String ticket;

    /**
     * 纬度
     */
    @FieldLabel("纬度")
    private String latitude;

    /**
     * 经度
     */
    @FieldLabel("经度")
    private String longitude;

    /**
     * 地理位置精度
     */
    @FieldLabel("地理位置精度")
    private String precision;

    /**
     * 文本消息内容
     */
    @FieldLabel("文本消息内容")
    private String content;

    /**
     * 消息id
     */
    @FieldLabel("消息id")
    private long msgId;

}
