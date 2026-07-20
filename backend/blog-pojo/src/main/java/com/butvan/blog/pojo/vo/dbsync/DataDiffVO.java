package com.butvan.blog.pojo.vo.dbsync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * 数据内容差异 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataDiffVO {

    private String tableName;

    /**
     * 本地比线上多出的数据 (需要 INSERT 到线上)
     */
    private List<Map<String, Object>> toInsert;

    /**
     * 本地更新的数据 (需要 UPDATE 到线上)
     */
    private List<Map<String, Object>> toUpdate;

    /**
     * 线上多出的数据 (线上特有)
     */
    private List<Map<String, Object>> remoteOnly;
}
