package com.butvan.blog.common.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 微信相关配置属性映射
 * <p>
 * 绑定 application-weixin.yml 中 weixin 前缀下的配置项，
 * 替代 {@code @Value} 注入，提供类型安全的配置访问。
 * </p>
 */
@Data
@ConfigurationProperties(prefix = "weixin")
public class WeiXinProperties {

    /** 微信公众号 AppID */
    private String appid;

    /** 微信公众号 AppSecret */
    private String appsecret;
}
