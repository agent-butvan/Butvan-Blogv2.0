package com.butvan.blog.service.service;

import com.butvan.blog.pojo.vo.site.SiteConfigVO;

/**
 * 站点配置服务接口
 *
 * 提供站点级全局配置项的读写能力，基于 blog_site_config 键值对表。
 */
public interface SiteConfigService {

    /**
     * 根据配置键获取配置值
     *
     * @param configKey 配置键，如 background_image_url
     * @return 配置 VO（包含键和值），即使配置不存在也返回 configValue 为空串的对象
     */
    SiteConfigVO getConfig(String configKey);

    /**
     * 更新（或创建）指定配置键的值
     *
     * @param configKey   配置键
     * @param configValue 配置值，为空串时表示清除配置
     */
    void setConfig(String configKey, String configValue);
}
