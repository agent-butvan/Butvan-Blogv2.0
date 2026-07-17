package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.pojo.vo.log.LogArchiveVO;
import com.butvan.blog.service.aspect.ApiLogAspect;
import com.butvan.blog.service.service.ApiLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.File;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 接口测速日志服务实现类（大厂标准：内存队列索引 + 本地日志物理归档）
 */
@Service
@Slf4j
public class ApiLogServiceImpl implements ApiLogService {

    @Override
    public PageResult pageLogs(ApiLogQueryDTO queryDTO) {
        log.info("从内存高频队列分页检索API日志, 参数: {}", queryDTO);

        // 1. 解析分页参数 (1-based to 0-based)
        int pageIndex = queryDTO.getPage() != null && queryDTO.getPage() > 0 ? queryDTO.getPage() - 1 : 0;
        int size = queryDTO.getSize() != null && queryDTO.getSize() > 0 ? queryDTO.getSize() : 10;

        // 2. 拷贝一份当前的内存日志并按时间倒序（队尾是最新的数据）
        List<ApiLog> allLogs = new ArrayList<>(ApiLogAspect.RECENT_LOGS);
        Collections.reverse(allLogs);

        // 3. 支持关键字条件过滤（IP、接口名、URI、方法）
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            String keyword = queryDTO.getKeyword().trim().toLowerCase();
            allLogs = allLogs.stream()
                    .filter(item ->
                            (item.getApiName() != null && item.getApiName().toLowerCase().contains(keyword)) ||
                            (item.getUri() != null && item.getUri().toLowerCase().contains(keyword)) ||
                            (item.getMethod() != null && item.getMethod().toLowerCase().contains(keyword)) ||
                            (item.getIp() != null && item.getIp().toLowerCase().contains(keyword))
                    )
                    .collect(Collectors.toList());
        }

        long total = allLogs.size();

        // 4. 进行内存滑动窗口截取分页
        int fromIndex = pageIndex * size;
        List<ApiLog> records = new ArrayList<>();
        if (fromIndex < allLogs.size()) {
            int toIndex = Math.min(fromIndex + size, allLogs.size());
            records = allLogs.subList(fromIndex, toIndex);
        }

        return PageResult.builder()
                .total(total)
                .page(pageIndex + 1)
                .size(size)
                .records(records)
                .build();
    }

    @Override
    public void clearAllLogs() {
        log.warn("执行清空内存请求日志操作");
        ApiLogAspect.RECENT_LOGS.clear();
    }

    @Override
    public List<LogArchiveVO> listArchives() {
        log.info("获取服务器日志归档压缩包列表");
        File archiveDir = new File("logs/archive");
        if (!archiveDir.exists() || !archiveDir.isDirectory()) {
            return Collections.emptyList();
        }
        File[] files = archiveDir.listFiles((dir, name) -> name.endsWith(".gz") || name.endsWith(".log"));
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }
        List<LogArchiveVO> list = new ArrayList<>();
        for (File f : files) {
            list.add(LogArchiveVO.builder()
                    .fileName(f.getName())
                    .fileSize(formatFileSize(f.length()))
                    .lastModified(LocalDateTime.ofInstant(Instant.ofEpochMilli(f.lastModified()), ZoneId.systemDefault()))
                    .build());
        }
        // 按修改时间降序排序最新的归档文件在最前
        list.sort((a, b) -> b.getLastModified().compareTo(a.getLastModified()));
        return list;
    }

    @Override
    public File getArchiveFile(String filename) {
        log.info("获取指定的归档日志文件: {}", filename);
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            throw new IllegalArgumentException("非法的归档包文件名，禁止目录穿越");
        }
        File file = new File("logs/archive", filename);
        if (!file.exists() || !file.isFile()) {
            throw new RuntimeException("指定的归档包文件不存在");
        }
        return file;
    }

    @Override
    public void deleteArchive(String filename) {
        log.warn("准备在服务器上物理删除归档包: {}", filename);
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            throw new IllegalArgumentException("非法的归档包文件名，禁止目录穿越");
        }
        File file = new File("logs/archive", filename);
        if (file.exists() && file.isFile()) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("归档日志文件物理删除成功: {}", filename);
            } else {
                throw new RuntimeException("物理删除归档文件失败，请检查文件系统读写权限");
            }
        } else {
            throw new RuntimeException("指定的归档包文件不存在");
        }
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(size / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }
}
