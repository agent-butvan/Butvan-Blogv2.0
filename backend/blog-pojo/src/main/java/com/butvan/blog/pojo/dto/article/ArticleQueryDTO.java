package com.butvan.blog.pojo.dto.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 后台文章分页条件筛选请求参数 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleQueryDTO {

    private Integer page; // 当前请求的页码 (1-based)

    private Integer size; // 每页返回的大小记录条数

    private String keyword; // 模糊搜索匹配的文本关键词 (文章标题/正文)

    private String status; // 过滤的状态：DRAFT | PUBLISHED | PRIVATE | ARCHIVED

    private Long categoryId; // 筛选的所属分类主键 ID

    private Long tagId; // 筛选的标签主键 ID

    private String contentType; // 正文介质分类：ARTICLE | NOTE | GALLERY | PROJECT

    private String sortBy; // 排序字段

    private String sortDir; // 排序方向 (asc/desc)
}
