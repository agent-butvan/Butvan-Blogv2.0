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
     * @return Git 详细信息 VO
     */
    @GetMapping("/git/info")
    @TrackApi("获取项目Git信息")
    public Result<GitInfoVO> getGitInfo() {
        log.info("获取项目 Git 信息 API 请求");
        GitInfoVO info = gitService.getGitInfo();
        return Result.success(info);
    }

    /**
     * 获取 Git 本月代码活跃度
     *
     * @return 每日代码提交次数列表 VO
     */
    @GetMapping("/git/activity")
    @TrackApi("获取Git本月提交活跃度")
    public Result<List<GitActivityVO>> getGitActivity() {
        log.info("获取 Git 本月代码活跃度 API 请求");
        List<GitActivityVO> activity = gitService.getGitActivity();
        return Result.success(activity);
    }
}
