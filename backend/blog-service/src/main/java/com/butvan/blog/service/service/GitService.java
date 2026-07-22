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
     * @param branch 指定分支名称，若为空则默认 HEAD
     * @return Git 详细信息 VO
     */
    GitInfoVO getGitInfo(String branch);

    /**
     * 获取指定月份的代码提交活跃度统计数据
     *
     * @param branch 指定分支名称，若为空则默认 HEAD
     * @param month  指定月份（格式：yyyy-MM），若为空则默认当月
     * @return 每日代码提交次数列表
     */
    List<GitActivityVO> getGitActivity(String branch, String month);
}
