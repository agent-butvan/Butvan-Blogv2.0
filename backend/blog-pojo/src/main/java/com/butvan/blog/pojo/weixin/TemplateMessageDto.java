package com.butvan.blog.pojo.weixin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 微信模板消息请求体 DTO
 * <p>
 * 对应微信模板消息 API 的 JSON 结构：
 * <pre>{@code
 * {
 *   "touser": "OPENID",
 *   "template_id": "TEMPLATE_ID",
 *   "url": "http://...",
 *   "data": {
 *     "first": { "value": "你好", "color": "#173177" },
 *     "time":  { "value": "2026-07-12", "color": "#FA8B16" }
 *   }
 * }
 * }</pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateMessageDto {

    /** 接收消息的用户 openId */
    private String touser;

    /** 模板消息 ID（在公众号后台配置获取） */
    private String template_id;

    /** 点击模板消息跳转的链接（可选） */
    private String url;

    /** 模板数据，key 为模板变量名，value 为 { value, color } */
    private Map<String, TemplateData> data;

    /**
     * 模板数据项（单个变量的值和颜色）
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateData {
        /** 模板变量值 */
        private String value;
        /** 文字颜色（十六进制，如 #173177） */
        private String color;

        /**
         * 快捷构建 TemplateData（仅设置值，使用默认颜色）
         *
         * @param value 变量值
         * @return TemplateData
         */
        public static TemplateData of(String value) {
            return TemplateData.builder().value(value).build();
        }

        /**
         * 快捷构建 TemplateData（设置值和颜色）
         *
         * @param value 变量值
         * @param color 文字颜色
         * @return TemplateData
         */
        public static TemplateData of(String value, String color) {
            return TemplateData.builder().value(value).color(color).build();
        }
    }
}
