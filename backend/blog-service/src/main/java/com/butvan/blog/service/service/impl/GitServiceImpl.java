package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.vo.git.GitActivityVO;
import com.butvan.blog.pojo.vo.git.GitCommitVO;
import com.butvan.blog.pojo.vo.git.GitInfoVO;
import com.butvan.blog.service.service.GitService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
 * 具备【本地物理 .git 毫秒级提取】与【线上 GitHub API 带 2 秒硬超时保护】的双重纯净机制
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

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GitServiceImpl() {
        // 配置 2 秒连接与读取硬超时，防止外网 GitHub 连接卡死拖垮整体接口
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(2000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public GitInfoVO getGitInfo(String branch) {
        // 1. 本地探查：若处于本地开发环境（存在物理 .git 目录），优先执行本地 git 命令（0.01 秒极速完成，零网络开销）
        if (isGitAvailable()) {
            return getLiveGitInfo(branch);
        }

        // 2. 线上探查：线上部署环境（无 .git 目录），调用 GitHub REST API（带 2 秒超时保护）
        GitInfoVO gitHubGitInfo = getGitInfoFromGitHub(branch);
        if (gitHubGitInfo != null) {
            log.info("【Git服务】成功从 GitHub API 实时装载仓库最新提交历史 (owner={}, repo={})", githubOwner, githubRepo);
            return gitHubGitInfo;
        }

        // 3. 若均无法获取，返回干净的安全空结构（无任何硬编码 Mock 数据）
        log.warn("【Git服务】无法从 GitHub API 或本地 .git 仓库获取版本信息");
        String current = (branch != null && !branch.trim().isEmpty() && !"HEAD".equalsIgnoreCase(branch)) ? branch : "main";
        List<String> branches = new ArrayList<>();
        branches.add(current);
        return GitInfoVO.builder()
                .currentBranch(current)
                .branches(branches)
                .commits(new ArrayList<>())
                .isOffline(true)
                .build();
    }

    @Override
    public List<GitActivityVO> getGitActivity(String branch) {
        // 1. 本地探查：若处于本地开发环境（存在物理 .git 目录），优先本地计算
        if (isGitAvailable()) {
            return getLiveGitActivity(branch);
        }

        // 2. 线上探查：线上部署环境，调用 GitHub REST API 计算当月提交活跃度
        List<GitActivityVO> gitHubActivity = getGitActivityFromGitHub(branch);
        if (gitHubActivity != null) {
            return gitHubActivity;
        }

        // 3. 若均无法获取，返回空计数的当月日期列表
        LocalDate now = LocalDate.now();
        List<GitActivityVO> activities = new ArrayList<>();
        int lengthOfCurrentMonth = now.lengthOfMonth();
        for (int i = 1; i <= lengthOfCurrentMonth; i++) {
            LocalDate date = now.withDayOfMonth(i);
            activities.add(GitActivityVO.builder()
                    .date(date.toString())
                    .count(0)
                    .build());
        }
        return activities;
    }

    /**
     * 实时从 GitHub REST API 获取最新提交与分支列表
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

            // 2. 循环翻页请求 GitHub 仓库指定分支的 Commit 列表 (最多拉取 10 页 1000 条记录)
            List<GitCommitVO> commits = new ArrayList<>();
            for (int page = 1; page <= 10; page++) {
                String commitUrl = String.format("https://api.github.com/repos/%s/%s/commits?sha=%s&per_page=100&page=%d", githubOwner, githubRepo, targetBranch, page);
                String commitJson = executeGitHubRequest(commitUrl);
                if (commitJson == null) {
                    break;
                }
                List<GitCommitVO> pageCommits = parseGitHubCommits(commitJson);
                if (pageCommits.isEmpty()) {
                    break;
                }
                commits.addAll(pageCommits);
                if (pageCommits.size() < 100) {
                    break;
                }
            }

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
            log.warn("调用 GitHub REST API 获取 Git 信息失败或超时: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 实时从 GitHub REST API 获取当月提交活跃度
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
     * 执行底层 GitHub HTTP GET 请求（带 2 秒超时拦截）
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
            log.debug("GitHub API 请求连接失败或超时 [{}]: {}", url, e.getMessage());
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
        cmd.add("2000");
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

