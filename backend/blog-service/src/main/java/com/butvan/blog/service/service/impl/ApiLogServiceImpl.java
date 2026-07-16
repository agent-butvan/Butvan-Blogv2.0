package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.service.repository.ApiLogRepository;
import com.butvan.blog.service.service.ApiLogService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 接口测速日志服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApiLogServiceImpl implements ApiLogService {

    private final ApiLogRepository apiLogRepository;

    @Override
    public PageResult pageLogs(ApiLogQueryDTO queryDTO) {
        log.info("分页检索API日志, 参数: {}", queryDTO);

        // 1. 解析分页参数 (1-based to 0-based)
        int pageIndex = queryDTO.getPage() != null && queryDTO.getPage() > 0 ? queryDTO.getPage() - 1 : 0;
        int pageSize = queryDTO.getSize() != null && queryDTO.getSize() > 0 ? queryDTO.getSize() : 10;

        // 2. 默认按照创建时间倒序
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        // 3. 构建动态 Specification 查询
        Specification<ApiLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(queryDTO.getKeyword())) {
                String likeKeyword = "%" + queryDTO.getKeyword().trim() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("apiName"), likeKeyword),
                        cb.like(root.get("uri"), likeKeyword),
                        cb.like(root.get("method"), likeKeyword),
                        cb.like(root.get("ip"), likeKeyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ApiLog> pageResult = apiLogRepository.findAll(spec, pageable);

        return PageResult.builder()
                .total(pageResult.getTotalElements())
                .page(pageIndex + 1)
                .size(pageSize)
                .records(pageResult.getContent())
                .build();
    }

    @Override
    @Transactional
    public void clearAllLogs() {
        log.warn("执行清空所有接口日志操作");
        apiLogRepository.deleteAllInBatch();
    }
}
