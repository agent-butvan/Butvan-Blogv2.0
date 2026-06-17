package com.butvan.blog.pojo.vo.tag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 极简标签展示 VO（供下拉多选环境等轻量环境使用）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagSimpleVO {

    private Long id; // 标签主键 ID

    private String name; // 标签展示名称

    private String slug; // 标签 URL 友好标识符
}
