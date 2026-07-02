package com.butvan.blog.service.service;

import lombok.Data;

/**
 * 网站元数据抓取服务接口
 */
public interface WebMetaService {

    /**
     * 从 URL 中抓取网站元数据（标题、描述、favicon）
     *
     * @param url 目标网站地址
     * @return 网站元数据
     */
    WebMetaDTO fetchWebMeta(String url);

    /**
     * 网站元数据传输对象
     */
    @Data
    class WebMetaDTO {
        /** 网站标题（从 <title> 或 og:title 提取） */
        private String title;

        /** 网站描述（从 meta description 或 og:description 提取） */
        private String description;

        /** favicon 图标 URL */
        private String faviconUrl;

        /** 域名（用于展示） */
        private String domain;

        /** 是否成功抓取 */
        private boolean success;

        /** 错误信息 */
        private String errorMsg;
    }
}
