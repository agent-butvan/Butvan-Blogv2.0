package com.butvan.blog.pojo.vo.note;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 手记详情视图对象 VO — 继承列表 VO，扩展正文与统计字段
 */
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NoteDetailVO extends NoteItemVO {

    private String content; // Markdown 源文本内容

    private String contentHtml; // 解析缓存后的 HTML 格式富文本

    private Integer wordCount; // 源文本字数估计

    private Integer readingTime; // 预估阅读所需耗时分钟数
}
