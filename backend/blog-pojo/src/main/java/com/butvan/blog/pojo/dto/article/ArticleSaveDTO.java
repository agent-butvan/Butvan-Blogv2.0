package com.butvan.blog.pojo.dto.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * 创建/更新文章提交的表单数据 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSaveDTO {

    private String title; // 文章标题

    private String slug; // URL 友好短链接路径

    private String summary; // 摘要简介说明

    private String content; // Markdown 原文内容

    private String coverImageUrl; // 封面图片地址

    private Long categoryId; // 分类主键 ID

    private List<Long> tagIds; // 关联的标签主键 ID 集合

    private String status; // 发布状态：DRAFT | PUBLISHED | PRIVATE | ARCHIVED

    private String visibility; // 访问可见性：PUBLIC | PRIVATE | PASSWORD_PROTECTED

    private String password; // 访问密码（若可见性为 PASSWORD_PROTECTED）

    private Boolean isPinned; // 是否置顶放置

    private Boolean isFeatured; // 是否首页精选推荐

    private Boolean isAllowComment; // 是否开放评论

    private String contentType; // 介质分类：ARTICLE | NOTE | GALLERY | PROJECT

    private String template; // 前台特殊渲染的自定义模板名

    private String seoTitle; // 自定义 SEO 检索标题

    private String seoDescription; // 自定义 SEO 摘要说明

    private String seoKeywords; // 自定义 SEO 关键字，用逗号分隔

    private Map<String, Object> extra; // 扩展参数 JSON 字典
}
