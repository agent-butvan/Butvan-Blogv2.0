package com.butvan.blog.pojo.vo.dbsync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 数据库表数据比对概览元数据 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDataOverviewVO {

    /**
     * 表名，如 'blog_article'
     */
    private String tableName;

    /**
     * 该表是否存在于线上生产库中
     */
    private Boolean existsInOnline;

    /**
     * 本地库中的数据总行数
     */
    private Integer localCount;

    /**
     * 线上库中的数据总行数
     */
    private Integer onlineCount;

    /**
     * 待同步导入到线上的记录行数 (本地有，线上无)
     */
    private Integer toInsertCount;

    /**
     * 待同步更新到线上的记录行数 (本地版本较新)
     */
    private Integer toUpdateCount;

    /**
     * 仅存在于线上库的记录行数 (线上特有)
     */
    private Integer remoteOnlyCount;
}
