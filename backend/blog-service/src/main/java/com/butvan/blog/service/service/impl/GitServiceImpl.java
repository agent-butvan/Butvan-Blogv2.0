package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.vo.git.GitActivityVO;
import com.butvan.blog.pojo.vo.git.GitCommitVO;
import com.butvan.blog.pojo.vo.git.GitInfoVO;
import com.butvan.blog.service.service.GitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Git 详细信息服务实现类
 */
@Service
@Slf4j
public class GitServiceImpl implements GitService {

    @Override
    public GitInfoVO getGitInfo() {
        // 1. 获取当前活动分支
        List<String> currentBranchOut = executeCommand(new String[]{"git", "rev-parse", "--abbrev-ref", "HEAD"});
        String currentBranch = currentBranchOut.isEmpty() ? "unknown" : currentBranchOut.get(0).trim();

        // 2. 获取所有本地分支
        List<String> branchesOut = executeCommand(new String[]{"git", "branch", "--format=%(refname:short)"});
        List<String> branches = new ArrayList<>();
        for (String b : branchesOut) {
            if (b != null && !b.trim().isEmpty()) {
                branches.add(b.trim());
            }
        }
        if (branches.isEmpty()) {
            branches.add(currentBranch);
        }

        // 3. 获取提交记录
        List<String> commitsOut = executeCommand(new String[]{
                "git", "log", "-n", "100", 
                "--pretty=format:%h###%an###%ad###%s", 
                "--date=format:%Y-%m-%d %H:%M:%S"
        });
        List<GitCommitVO> commits = new ArrayList<>();
        for (String line : commitsOut) {
            if (line == null || line.trim().isEmpty()) {
                continue;
            }
            String[] parts = line.split("###", 4);
            if (parts.length >= 4) {
                commits.add(GitCommitVO.builder()
                        .hash(parts[0].trim())
                        .author(parts[1].trim())
                        .date(parts[2].trim())
                        .message(parts[3].trim())
                        .build());
            }
        }

        return GitInfoVO.builder()
                .currentBranch(currentBranch)
                .branches(branches)
                .commits(commits)
                .build();
    }

    @Override
    public List<GitActivityVO> getGitActivity() {
        LocalDate now = LocalDate.now();
        String firstDayOfMonth = now.withDayOfMonth(1).toString(); // yyyy-MM-01

        // 查询本月第一天到现在的提交时间
        List<String> datesOut = executeCommand(new String[]{
                "git", "log", 
                "--since=" + firstDayOfMonth, 
                "--pretty=format:%ad", 
                "--date=format:%Y-%m-%d"
        });

        // 统计每天提交的频次
        Map<String, Integer> commitCounts = new HashMap<>();
        for (String d : datesOut) {
            if (d == null || d.trim().isEmpty()) {
                continue;
            }
            String day = d.trim();
            commitCounts.put(day, commitCounts.getOrDefault(day, 0) + 1);
        }

        // 构造本月的所有日期并填充数据
        List<GitActivityVO> activities = new ArrayList<>();
        int lengthOfCurrentMonth = now.lengthOfMonth();
        for (int i = 1; i <= lengthOfCurrentMonth; i++) {
            LocalDate date = now.withDayOfMonth(i);
            String dayStr = date.toString(); // yyyy-MM-dd
            Integer count = commitCounts.getOrDefault(dayStr, 0);
            activities.add(GitActivityVO.builder()
                    .date(dayStr)
                    .count(count)
                    .build());
        }

        return activities;
    }

    /**
     * 执行底层的 git 命令
     */
    private List<String> executeCommand(String[] command) {
        List<String> output = new ArrayList<>();
        File gitRoot = findGitRoot();
        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(gitRoot);
            builder.redirectErrorStream(true);
            Process process = builder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.add(line);
                }
            }
            process.waitFor();
        } catch (Exception e) {
            log.error("执行 Git 命令失败: {}", String.join(" ", command), e);
        }
        return output;
    }

    /**
     * 自适应向上寻找 .git 文件夹来确定 Git 项目根路径
     */
    private File findGitRoot() {
        File dir = new File(".").getAbsoluteFile();
        while (dir != null) {
            File gitDir = new File(dir, ".git");
            if (gitDir.exists() && gitDir.isDirectory()) {
                return dir;
            }
            dir = dir.getParentFile();
        }
        return new File(".").getAbsoluteFile();
    }
}
