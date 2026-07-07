package com.butvan.blog.pojo.dto.note;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建/更新手记提交的表单数据 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteSaveDTO {

    private String title; // 手记标题

    private String slug; // URL 友好短链接路径

    private String summary; // 摘要简介说明

    private String content; // Markdown 原文内容

    private String coverImageUrl; // 配图地址（单图兼容）

    private java.util.List<String> coverImageUrls; // 多张配图 URL 数组（最多3张）

    private String mood; // 心情标记：开心/思考中/忙碌/放松/感动/平静

    private String weather; // 天气标记：晴/多云/阴/雨/雪/风

    private String location; // 位置描述

    private String status; // 发布状态：DRAFT | PUBLISHED

    private Boolean isPinned; // 是否置顶
}
