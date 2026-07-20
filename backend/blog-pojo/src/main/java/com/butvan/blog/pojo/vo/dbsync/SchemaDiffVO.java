package com.butvan.blog.pojo.vo.dbsync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 数据库结构差异 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaDiffVO {

    /**
     * 表名，如 'article'
     */
    private String tableName;

    /**
     * 差异类型：'MISSING_IN_ONLINE' (线上缺少该表) / 'FIELD_MISMATCH' (字段不一致) / 'CONSISTENT' (完全一致)
     */
    private String diffType;

    /**
     * 差异描述
     */
    private String description;

    /**
     * 具体的字段差异列表
     */
    private List<FieldDiff> fieldDiffs;

    /**
     * 建议执行的同步 SQL
     */
    private String sqlSync;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldDiff {
        private String columnName;
        private String diffType; // 'MISSING_IN_ONLINE' / 'TYPE_MISMATCH' / 'NULLABLE_MISMATCH' / 'DEFAULT_MISMATCH'
        private String localValue; // 本地特征，如 'character varying(100)'
        private String onlineValue; // 线上特征，如 'character varying(50)' 或 'null' (表示缺失)
    }
}
