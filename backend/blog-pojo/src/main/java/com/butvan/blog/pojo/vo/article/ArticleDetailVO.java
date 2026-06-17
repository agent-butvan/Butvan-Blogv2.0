package com.butvan.blog.pojo.vo.article;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 后台编辑页面或前台阅读加载文章完整详情的 VO 载荷
 */
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDetailVO extends ArticleItemVO {

    private String content; // Markdown 源文本内容

    private String contentHtml; // 解析缓存后的 HTML 格式富文本

    private Long categoryId; // 所属分类 ID

    private List<Long> tagIds; // 关联的标签 ID 集合

    private List<String> tagNames; // 关联的标签展示名称集合

    private String password; // 访问校验密码

    private Boolean isAllowComment; // 是否允许评论

    private Long likeCount; // 被点赞赞许总数

    private Integer wordCount; // 源文本字数估计

    private Integer readingTime; // 预估阅读所需耗时分钟数

    private String seoTitle; // SEO 检索标题

    private String seoDescription; // SEO 摘要

    private String seoKeywords; // SEO 关键字

    private String template; // 前台渲染使用的特色自定义模板名

    private Map<String, Object> extra; // 扩展附加 JSON 数据

    private LocalDateTime deletedAt; // 软删除时间戳（不为空说明已入回收站）
}
