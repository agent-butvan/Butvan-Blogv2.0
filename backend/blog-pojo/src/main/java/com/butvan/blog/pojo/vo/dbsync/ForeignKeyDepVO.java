package com.butvan.blog.pojo.vo.dbsync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 外键依赖预览 VO —— 描述同步操作所需的父表缺失记录
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForeignKeyDepVO {

    /** 当前表的外键列名 */
    private String columnName;

    /** 被引用的父表名 */
    private String referencedTable;

    /** 被引用表的关联列名 */
    private String referencedColumn;

    /** 外键关联值 */
    private String referencedValue;

    /** 可读描述，如 "blog_category.id = 4" */
    private String displayText;
}
