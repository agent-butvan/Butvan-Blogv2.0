package com.butvan.blog.pojo.vo.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 极简分类展示 VO（供下拉框关联等轻量展示环境使用）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySimpleVO {

    private Long id; // 分类主键 ID

    private String name; // 分类名称

    private String slug; // 分类 URL 友好标识符
}
