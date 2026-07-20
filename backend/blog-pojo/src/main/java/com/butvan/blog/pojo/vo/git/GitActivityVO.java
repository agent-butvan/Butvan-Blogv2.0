package com.butvan.blog.pojo.vo.git;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Git 本月代码活跃度数据点 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitActivityVO {

    /**
     * 日期字符串 (yyyy-MM-dd)
     */
    private String date;

    /**
     * 该日提交总数
     */
    private Integer count;
}
