package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.service.aspect.ApiLogAspect;
import com.butvan.blog.service.service.ApiLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
}
