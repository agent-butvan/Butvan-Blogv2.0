package com.butvan.blog.pojo.dto.site;

import lombok.Data;

/**
 * 站点配置更新数据传输对象
 *
 * 用于管理端更新单个站点配置项的值。
 */
@Data
public class SiteConfigUpdateDTO {

    /** 配置值（字符串），为空时表示清除该配置项的值 */
    private String configValue;
}
