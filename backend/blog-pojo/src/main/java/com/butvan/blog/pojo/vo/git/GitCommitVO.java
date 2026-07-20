package com.butvan.blog.pojo.vo.git;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Git 提交记录数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitCommitVO {

    /**
     * 提交 Hash (简短短哈希)
     */
    private String hash;

    /**
     * 作者名称
     */
    private String author;

    /**
     * 提交时间 (格式化文本)
     */
    private String date;

    /**
     * 提交消息
     */
    private String message;
}
