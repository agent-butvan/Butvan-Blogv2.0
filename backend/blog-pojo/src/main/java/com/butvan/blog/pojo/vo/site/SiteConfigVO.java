package com.butvan.blog.pojo.vo.site;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 站点配置视图对象
 *
 * 供前端查询单个配置项的键值对，用于前台和管理端展示。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteConfigVO implements Serializable {

    /** 配置键，如 background_image_url */
    private String configKey;

    /** 配置值（字符串） */
    private String configValue;
}
