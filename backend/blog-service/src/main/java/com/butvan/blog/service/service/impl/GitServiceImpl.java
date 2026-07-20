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
 * 具备线上环境自适应及离线 Mock 降级保护机制，确保生产环境 100% 稳定运行
 */
@Service
@Slf4j
public class GitServiceImpl implements GitService {

    @Override
    public GitInfoVO getGitInfo(String branch) {
        // 自适应环境检查：如果不具备 git 环境，切入离线降级模式
        if (!isGitAvailable()) {
            log.warn("当前运行环境未侦测到 .git 仓库或 git 命令行不可用，已自动切换为【离线包阅模式】");
            return getOfflineGitInfo(branch);
        }

        // 1. 获取当前活动分支 (如果是查询特定分支，就返回该分支作为活动分支，否则查询 HEAD)
        String targetBranch = branch;
        if (targetBranch == null || targetBranch.trim().isEmpty() || "HEAD".equalsIgnoreCase(targetBranch)) {
            List<String> currentBranchOut = executeCommand(new String[]{"git", "rev-parse", "--abbrev-ref", "HEAD"});
            targetBranch = currentBranchOut.isEmpty() ? "unknown" : currentBranchOut.get(0).trim();
        }

        // 2. 获取所有本地分支
        List<String> branchesOut = executeCommand(new String[]{"git", "branch", "--format=%(refname:short)"});
        List<String> branches = new ArrayList<>();
        for (String b : branchesOut) {
            if (b != null && !b.trim().isEmpty()) {
                branches.add(b.trim());
            }
        }
        if (branches.isEmpty()) {
            branches.add(targetBranch);
        }

        // 3. 获取最近 100 条提交记录 (指定分支)
        List<String> cmd = new ArrayList<>();
        cmd.add("git");
        cmd.add("log");
        if (branch != null && !branch.trim().isEmpty() && !"HEAD".equalsIgnoreCase(branch)) {
            cmd.add(branch);
        }
        cmd.add("-n");
        cmd.add("100");
        cmd.add("--pretty=format:%h###%an###%ad###%s");
        cmd.add("--date=format:%Y-%m-%d %H:%M:%S");

        List<String> commitsOut = executeCommand(cmd.toArray(new String[0]));
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
                .currentBranch(targetBranch)
                .branches(branches)
                .commits(commits)
                .isOffline(false)
                .build();
    }

    @Override
    public List<GitActivityVO> getGitActivity(String branch) {
        LocalDate now = LocalDate.now();
        String firstDayOfMonth = now.withDayOfMonth(1).toString(); // yyyy-MM-01

        if (!isGitAvailable()) {
            return getOfflineGitActivity(branch);
        }

        // 查询本月第一天到现在的提交时间 (指定分支)
        List<String> cmd = new ArrayList<>();
        cmd.add("git");
        cmd.add("log");
        if (branch != null && !branch.trim().isEmpty() && !"HEAD".equalsIgnoreCase(branch)) {
            cmd.add(branch);
        }
        cmd.add("--since=" + firstDayOfMonth);
        cmd.add("--pretty=format:%ad");
        cmd.add("--date=format:%Y-%m-%d");

        List<String> datesOut = executeCommand(cmd.toArray(new String[0]));

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
     * 优雅探测当前运行环境是否支持 Git 操作
     */
    private boolean isGitAvailable() {
        File gitRoot = findGitRoot();
        File gitDir = new File(gitRoot, ".git");
        if (!gitDir.exists() || !gitDir.isDirectory()) {
            return false;
        }
        try {
            // 精准检查本地系统是否装有并能够调用 git 命令
            Process process = new ProcessBuilder("git", "--version").directory(gitRoot).start();
            process.waitFor();
            return process.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 获取离线 Mock 的 Git 信息
     */
    private GitInfoVO getOfflineGitInfo(String branch) {
        String current = (branch != null && !branch.trim().isEmpty()) ? branch : "main";
        
        List<String> branches = new ArrayList<>();
        branches.add("main");
        branches.add("release");
        branches.add("feat/git-dashboard");
        branches.add("fix/timeout-issue");

        List<GitCommitVO> commits = new ArrayList<>();
        
        // 模拟丰富的、带有我们本次开发特征的真实版本足迹
        commits.add(new GitCommitVO("c88ffbf", "antigravity", "2026-07-20 15:34:11", "feat(git): 支持顶部栏查看git信息与工作台代码活跃度热力图"));
        commits.add(new GitCommitVO("b911a33", "antigravity", "2026-07-20 15:18:31", "feat(ui): 工作台支持5秒轮询实现指标数据实时更新并移除快捷键配置"));
        commits.add(new GitCommitVO("54bc005", "antigravity", "2026-07-20 15:10:34", "fix(api): 采用异步有界线程池推送控制台日志防止线程卡死"));
        
        if (!"fix/timeout-issue".equals(branch)) {
            commits.add(new GitCommitVO("fbc1278", "butvan", "2026-07-17 10:42:00", "feat(db): 新增系统日志菜单及权限结构"));
            commits.add(new GitCommitVO("d3b4512", "butvan", "2026-07-16 21:10:05", "style(ui): 紧凑工作台首屏布局消除多余留白"));
            commits.add(new GitCommitVO("a11204b", "butvan", "2026-07-16 19:00:00", "init(project): VB个人博客2.0基础框架搭建就绪"));
        }

        // 如果切换了特定分支，我们可以过滤或模拟对应分支的提交
        if ("fix/timeout-issue".equals(branch)) {
            commits.remove(0); // 移除 feat(git)
            commits.remove(0); // 移除 feat(ui)
        } else if ("feat/git-dashboard".equals(branch)) {
            commits.remove(2); // 移除 fix(api)
        }

        return GitInfoVO.builder()
                .currentBranch(current)
                .branches(branches)
                .commits(commits)
                .isOffline(true)
                .build();
    }

    /**
     * 获取离线 Mock 的代码提交活跃度
     */
    private List<GitActivityVO> getOfflineGitActivity(String branch) {
        LocalDate now = LocalDate.now();
        List<GitActivityVO> activities = new ArrayList<>();
        int lengthOfCurrentMonth = now.lengthOfMonth();

        // 离线状态下模拟的提交高亮发生日期：
        // 20号(今天): 3次提交，17号: 1次提交，16号: 2次提交
        int activeDay20 = 3;
        int activeDay17 = 1;
        int activeDay16 = 2;

        if ("fix/timeout-issue".equals(branch)) {
            activeDay20 = 1; // 仅有修 timeout
            activeDay17 = 0;
        } else if ("feat/git-dashboard".equals(branch)) {
            activeDay20 = 2;
            activeDay16 = 0;
        }

        for (int i = 1; i <= lengthOfCurrentMonth; i++) {
            LocalDate date = now.withDayOfMonth(i);
            String dayStr = date.toString();
            int count = 0;
            if (i == 20) count = activeDay20;
            else if (i == 17) count = activeDay17;
            else if (i == 16) count = activeDay16;

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
