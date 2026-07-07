package com.butvan.blog.pojo.dto.note;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 手记分页条件筛选请求参数 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteQueryDTO {

    private Integer page; // 当前请求的页码 (1-based)

    private Integer size; // 每页返回的大小记录条数

    private String keyword; // 模糊搜索匹配的文本关键词 (标题/正文)

    private String status; // 过滤的状态：DRAFT | PUBLISHED

    private String mood; // 筛选的心情标签

    private String sortBy; // 排序字段

    private String sortDir; // 排序方向 (asc/desc)
}
