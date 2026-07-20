package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.vo.git.GitActivityVO;
import com.butvan.blog.pojo.vo.git.GitInfoVO;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.service.GitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 本地 Git 信息管理 Controller
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class GitController {

    private final GitService gitService;

    /**
     * 获取项目 Git 分支和提交记录信息
     *
     * @param branch 指定分支名称，若为空则默认 HEAD
     * @return Git 详细信息 VO
     */
    @GetMapping("/git/info")
    @TrackApi("获取项目Git信息")
    public Result<GitInfoVO> getGitInfo(@RequestParam(required = false) String branch) {
        log.info("获取项目 Git 信息 API 请求，分支: {}", branch);
        GitInfoVO info = gitService.getGitInfo(branch);
        return Result.success(info);
    }

    /**
     * 获取 Git 本月代码活跃度
     *
     * @param branch 指定分支名称，若为空则默认 HEAD
     * @return 每日代码提交次数列表 VO
     */
    @GetMapping("/git/activity")
    @TrackApi("获取Git本月提交活跃度")
    public Result<List<GitActivityVO>> getGitActivity(@RequestParam(required = false) String branch) {
        log.info("获取 Git 本月代码活跃度 API 请求，分支: {}", branch);
        List<GitActivityVO> activity = gitService.getGitActivity(branch);
        return Result.success(activity);
    }
}
