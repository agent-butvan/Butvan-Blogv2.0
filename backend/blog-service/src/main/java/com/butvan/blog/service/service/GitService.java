package com.butvan.blog.service.service;

import com.butvan.blog.pojo.vo.git.GitActivityVO;
import com.butvan.blog.pojo.vo.git.GitInfoVO;
import java.util.List;

/**
 * 本地 Git 仓库状态信息服务
 */
public interface GitService {

    /**
     * 获取当前 Git 项目信息 (当前分支、所有分支、最近 100 条 Commit)
     *
     * @return Git 详细信息 VO
     */
    GitInfoVO getGitInfo();

    /**
     * 获取本月份的代码提交活跃度统计数据
     *
     * @return 每日代码提交次数列表
     */
    List<GitActivityVO> getGitActivity();
}
