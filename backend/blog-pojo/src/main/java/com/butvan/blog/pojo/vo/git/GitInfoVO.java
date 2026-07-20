package com.butvan.blog.pojo.vo.git;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Git 详细信息 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitInfoVO {

    /**
     * 当前活动分支名称
     */
    private String currentBranch;

    /**
     * 所有本地分支列表
     */
    private List<String> branches;

    /**
     * 最近的提交记录列表
     */
    private List<GitCommitVO> commits;

    /**
     * 是否是离线降级状态 (如生产环境不带 git 版本库时)
     */
    private Boolean isOffline;
}
