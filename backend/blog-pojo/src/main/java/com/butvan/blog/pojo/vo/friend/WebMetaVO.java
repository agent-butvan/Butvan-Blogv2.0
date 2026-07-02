package com.butvan.blog.pojo.vo.friend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 网站元数据响应 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebMetaVO {

    /** 网站标题 */
    private String title;

    /** 网站描述 */
    private String description;

    /** favicon URL */
    private String faviconUrl;

    /** 域名 */
    private String domain;

    /** 是否成功 */
    private Boolean success;

    /** 错误信息 */
    private String errorMsg;
}
