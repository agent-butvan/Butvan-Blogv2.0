package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.vo.git.GitActivityVO;
import com.butvan.blog.pojo.vo.git.GitCommitVO;
import com.butvan.blog.pojo.vo.git.GitInfoVO;
import com.butvan.blog.service.service.GitService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Git 详细信息服务实现类
 * 具备【本地动态 .git】->【GitHub REST API 实时】->【打包期 Classpath 固化】->【离线 Mock 演示】四重降级防御机制
 */
@Service
@Slf4j
public class GitServiceImpl implements GitService {

    @Value("${blog.github.enabled:true}")
    private boolean githubEnabled;

    @Value("${blog.github.owner:18755120710}")
    private String githubOwner;

    @Value("${blog.github.repo:Butvan-Blogv2.0}")
    private String githubRepo;

    @Value("${blog.github.token:}")
    private String githubToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public GitInfoVO getGitInfo(String branch) {
        // 1. 本地动态探查：如果本地具有 .git 目录且 system git 可用（本地开发环境）
        if (isGitAvailable()) {
            return getLiveGitInfo(branch);
        }

        // 2. GitHub REST API 探查：在线模式下尝试从 GitHub 远程拉取最新提交与分支
        GitInfoVO gitHubGitInfo = getGitInfoFromGitHub(branch);
        if (gitHubGitInfo != null) {
            log.info("成功从 GitHub REST API 实时装载仓库最新提交历史 (owner={}, repo={})", githubOwner, githubRepo);
            return gitHubGitInfo;
        }

        // 3. 线上固化探查：尝试从 Jar 包 classpath 读取打包期固化的 git-history.txt
        GitInfoVO classpathGitInfo = getGitInfoFromClasspath(branch);
        if (classpathGitInfo != null) {
            log.info("侦测到线上编译固化的 Git 提交日志 (classpath:git-history.txt)，已装载线上固化历史信息");
            return classpathGitInfo;
        }

        // 4. 兜底离线模式：既无 .git 环境、也无法访问 GitHub API，且无 classpath 资源文件，切入 Mock 降级
        log.warn("当前运行环境未侦测到 .git 仓库、GitHub API 或 Classpath 资源，已自动切换为【离线 Mock 模式】");
        return getOfflineGitInfo(branch);
    }

    @Override
    public List<GitActivityVO> getGitActivity(String branch) {
        if (isGitAvailable()) {
            return getLiveGitActivity(branch);
        }

        List<GitActivityVO> gitHubActivity = getGitActivityFromGitHub(branch);
        if (gitHubActivity != null) {
            return gitHubActivity;
        }

        List<GitActivityVO> classpathActivity = getGitActivityFromClasspath();
        if (classpathActivity != null) {
            return classpathActivity;
        }

        return getOfflineGitActivity(branch);
    }

    /**
     * 实时从 GitHub REST API 获取最新提交与分支列表（线上在线模式）
     */
    private GitInfoVO getGitInfoFromGitHub(String branch) {
        if (!githubEnabled || githubOwner == null || githubOwner.trim().isEmpty() || githubRepo == null || githubRepo.trim().isEmpty()) {
            return null;
        }

        try {
            // 1. 请求 GitHub 仓库分支列表
            String branchUrl = String.format("https://api.github.com/repos/%s/%s/branches", githubOwner, githubRepo);
            String branchJson = executeGitHubRequest(branchUrl);
            List<String> branches = new ArrayList<>();
            if (branchJson != null) {
                JsonNode branchArray = objectMapper.readTree(branchJson);
                if (branchArray.isArray()) {
                    for (JsonNode node : branchArray) {
                        if (node.has("name")) {
                            branches.add(node.get("name").asText());
                        }
                    }
                }
            }
            if (branches.isEmpty()) {
                branches.add("main");
            }

            String targetBranch = branch;
            if (targetBranch == null || targetBranch.trim().isEmpty() || "HEAD".equalsIgnoreCase(targetBranch)) {
                targetBranch = branches.contains("main") ? "main" : branches.get(0);
            }

            // 2. 请求 GitHub 仓库指定分支的 Commit 列表
            String commitUrl = String.format("https://api.github.com/repos/%s/%s/commits?sha=%s&per_page=100", githubOwner, githubRepo, targetBranch);
            String commitJson = executeGitHubRequest(commitUrl);
            if (commitJson == null) {
                return null;
            }

            List<GitCommitVO> commits = parseGitHubCommits(commitJson);
            if (commits.isEmpty()) {
                return null;
            }

            return GitInfoVO.builder()
                    .currentBranch(targetBranch)
                    .branches(branches)
                    .commits(commits)
                    .isOffline(false)
                    .build();

        } catch (Exception e) {
            log.warn("调用 GitHub REST API 获取 Git 信息失败或受限: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 实时从 GitHub REST API 获取当月提交活跃度（线上在线模式）
     */
    private List<GitActivityVO> getGitActivityFromGitHub(String branch) {
        GitInfoVO gitInfo = getGitInfoFromGitHub(branch);
        if (gitInfo == null || gitInfo.getCommits() == null) {
            return null;
        }

        LocalDate now = LocalDate.now();
        String currentMonthPrefix = String.format("%04d-%02d-", now.getYear(), now.getMonthValue());

        List<String> dates = new ArrayList<>();
        for (GitCommitVO commit : gitInfo.getCommits()) {
            if (commit.getDate() != null && commit.getDate().length() >= 10) {
                String dayStr = commit.getDate().substring(0, 10);
                if (dayStr.startsWith(currentMonthPrefix)) {
                    dates.add(dayStr);
                }
            }
        }

        return buildActivityListFromDates(dates, now);
    }

    /**
     * 执行底层 GitHub HTTP GET 请求
     */
    private String executeGitHubRequest(String url) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Butvan-Blog-App");
            headers.set("Accept", "application/vnd.github.v3+json");
            if (githubToken != null && !githubToken.trim().isEmpty()) {
                headers.set("Authorization", "token " + githubToken.trim());
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.debug("GitHub API 请求失败 [{}]: {}", url, e.getMessage());
        }
        return null;
    }

    /**
     * 解析 GitHub API 返回的 JSON 提交数组
     */
    private List<GitCommitVO> parseGitHubCommits(String json) {
        List<GitCommitVO> commits = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                for (JsonNode item : root) {
                    String fullSha = item.path("sha").asText("");
                    String shortHash = fullSha.length() >= 7 ? fullSha.substring(0, 7) : fullSha;
                    
                    JsonNode commitNode = item.path("commit");
                    String message = commitNode.path("message").asText("").split("\n")[0];
                    
                    JsonNode authorNode = commitNode.path("author");
                    String author = authorNode.path("name").asText("unknown");
                    String rawDate = authorNode.path("date").asText("");
                    
                    String formattedDate = rawDate;
                    if (rawDate.contains("T")) {
                        formattedDate = rawDate.replace("T", " ").replace("Z", "");
                        if (formattedDate.length() > 19) {
                            formattedDate = formattedDate.substring(0, 19);
                        }
                    }

                    if (!shortHash.isEmpty()) {
                        commits.add(GitCommitVO.builder()
                                .hash(shortHash)
                                .author(author)
                                .date(formattedDate)
                                .message(message)
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("解析 GitHub Commit JSON 失败: {}", e.getMessage());
        }
        return commits;
    }

    /**
     * 实时获取 Git 信息（本地开发环境）
     */
    private GitInfoVO getLiveGitInfo(String branch) {
        String targetBranch = branch;
        if (targetBranch == null || targetBranch.trim().isEmpty() || "HEAD".equalsIgnoreCase(targetBranch)) {
            List<String> currentBranchOut = executeCommand(new String[]{"git", "rev-parse", "--abbrev-ref", "HEAD"});
            targetBranch = currentBranchOut.isEmpty() ? "unknown" : currentBranchOut.get(0).trim();
        }

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
        List<GitCommitVO> commits = parseCommitsFromLines(commitsOut);

        return GitInfoVO.builder()
                .currentBranch(targetBranch)
                .branches(branches)
                .commits(commits)
                .isOffline(false)
                .build();
    }

    /**
     * 实时获取 Git 提交活跃度（本地开发环境）
     */
    private List<GitActivityVO> getLiveGitActivity(String branch) {
        LocalDate now = LocalDate.now();
        String firstDayOfMonth = now.withDayOfMonth(1).toString();

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

        return buildActivityListFromDates(datesOut, now);
    }

    /**
     * 从 Classpath 资源读取打包期固化的真实 Git 提交信息（线上运行环境）
     */
    private GitInfoVO getGitInfoFromClasspath(String branch) {
        List<String> lines = readLinesFromClasspath("git-history.txt");
        if (lines.isEmpty()) {
            return null;
        }

        String targetBranch = branch;
        if (targetBranch == null || targetBranch.trim().isEmpty() || "HEAD".equalsIgnoreCase(targetBranch)) {
            List<String> branchLines = readLinesFromClasspath("git-branch.txt");
            targetBranch = branchLines.isEmpty() ? "main" : branchLines.get(0).trim();
        }

        List<GitCommitVO> commits = parseCommitsFromLines(lines);
        List<String> branches = new ArrayList<>();
        branches.add(targetBranch);

        return GitInfoVO.builder()
                .currentBranch(targetBranch)
                .branches(branches)
                .commits(commits)
                .isOffline(false)
                .build();
    }

    /**
     * 从 Classpath 资源计算打包期固化的当月提交活跃度（线上运行环境）
     */
    private List<GitActivityVO> getGitActivityFromClasspath() {
        List<String> lines = readLinesFromClasspath("git-history.txt");
        if (lines.isEmpty()) {
            return null;
        }

        LocalDate now = LocalDate.now();
        String currentMonthPrefix = String.format("%04d-%02d-", now.getYear(), now.getMonthValue());

        List<String> dates = new ArrayList<>();
        for (String line : lines) {
            String[] parts = line.split("###", 4);
            if (parts.length >= 3) {
                String dateStr = parts[2].trim();
                if (dateStr.length() >= 10) {
                    String dayStr = dateStr.substring(0, 10);
                    if (dayStr.startsWith(currentMonthPrefix)) {
                        dates.add(dayStr);
                    }
                }
            }
        }

        return buildActivityListFromDates(dates, now);
    }

    /**
     * 通用：将带有 ### 分隔符的行列表解析为 GitCommitVO 列表
     */
    private List<GitCommitVO> parseCommitsFromLines(List<String> lines) {
        List<GitCommitVO> commits = new ArrayList<>();
        for (String line : lines) {
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
        return commits;
    }

    /**
     * 通用：根据日期列表生成当月的 30/31 天提交频次序列
     */
    private List<GitActivityVO> buildActivityListFromDates(List<String> dates, LocalDate now) {
        Map<String, Integer> commitCounts = new HashMap<>();
        for (String d : dates) {
            if (d == null || d.trim().isEmpty()) {
                continue;
            }
            String day = d.trim();
            commitCounts.put(day, commitCounts.getOrDefault(day, 0) + 1);
        }

        List<GitActivityVO> activities = new ArrayList<>();
        int lengthOfCurrentMonth = now.lengthOfMonth();
        for (int i = 1; i <= lengthOfCurrentMonth; i++) {
            LocalDate date = now.withDayOfMonth(i);
            String dayStr = date.toString();
            Integer count = commitCounts.getOrDefault(dayStr, 0);
            activities.add(GitActivityVO.builder()
                    .date(dayStr)
                    .count(count)
                    .build());
        }
        return activities;
    }

    /**
     * 安全地读取 Classpath 资源文本行
     */
    private List<String> readLinesFromClasspath(String resourceName) {
        List<String> lines = new ArrayList<>();
        try {
            ClassPathResource resource = new ClassPathResource(resourceName);
            if (!resource.exists()) {
                return lines;
            }
            try (InputStream is = resource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().isEmpty()) {
                        lines.add(line.trim());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("读取 Classpath 资源 {} 失败: {}", resourceName, e.getMessage());
        }
        return lines;
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
            Process process = new ProcessBuilder("git", "--version").directory(gitRoot).start();
            process.waitFor();
            return process.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 获取离线 Mock 的 Git 信息（保底方案）
     */
    private GitInfoVO getOfflineGitInfo(String branch) {
        String current = (branch != null && !branch.trim().isEmpty()) ? branch : "main";
        
        List<String> branches = new ArrayList<>();
        branches.add("main");
        branches.add("release");
        branches.add("feat/git-dashboard");
        branches.add("fix/timeout-issue");

        List<GitCommitVO> commits = new ArrayList<>();
        commits.add(new GitCommitVO("c88ffbf", "antigravity", "2026-07-20 15:34:11", "feat(git): 支持顶部栏查看git信息与工作台代码活跃度热力图"));
        commits.add(new GitCommitVO("b911a33", "antigravity", "2026-07-20 15:18:31", "feat(ui): 工作台支持5秒轮询实现指标数据实时更新并移除快捷键配置"));
        commits.add(new GitCommitVO("54bc005", "antigravity", "2026-07-20 15:10:34", "fix(api): 采用异步有界线程池推送控制台日志防止线程卡死"));
        
        if (!"fix/timeout-issue".equals(branch)) {
            commits.add(new GitCommitVO("fbc1278", "butvan", "2026-07-17 10:42:00", "feat(db): 新增系统日志菜单及权限结构"));
            commits.add(new GitCommitVO("d3b4512", "butvan", "2026-07-16 21:10:05", "style(ui): 紧凑工作台首屏布局消除多余留白"));
            commits.add(new GitCommitVO("a11204b", "butvan", "2026-07-16 19:00:00", "init(project): VB个人博客2.0基础框架搭建就绪"));
        }

        if ("fix/timeout-issue".equals(branch)) {
            commits.remove(0);
            commits.remove(0);
        } else if ("feat/git-dashboard".equals(branch)) {
            commits.remove(2);
        }

        return GitInfoVO.builder()
                .currentBranch(current)
                .branches(branches)
                .commits(commits)
                .isOffline(true)
                .build();
    }

    /**
     * 获取离线 Mock 的代码提交活跃度（保底方案）
     */
    private List<GitActivityVO> getOfflineGitActivity(String branch) {
        LocalDate now = LocalDate.now();
        List<GitActivityVO> activities = new ArrayList<>();
        int lengthOfCurrentMonth = now.lengthOfMonth();

        int activeDay20 = 3;
        int activeDay17 = 1;
        int activeDay16 = 2;

        if ("fix/timeout-issue".equals(branch)) {
            activeDay20 = 1;
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

