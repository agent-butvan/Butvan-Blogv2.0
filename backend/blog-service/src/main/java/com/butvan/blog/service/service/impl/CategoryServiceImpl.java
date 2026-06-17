package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.Category;
import com.butvan.blog.pojo.vo.category.CategorySimpleVO;
import com.butvan.blog.service.repository.CategoryRepository;
import com.butvan.blog.service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 分类业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategorySimpleVO> listSimpleCategories() {
        log.info("查询全部可见的极简分类列表");
        List<Category> list = categoryRepository.findByIsVisibleOrderBySortOrderAsc(true);
        return list.stream()
                .map(category -> CategorySimpleVO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .slug(category.getSlug())
                        .build())
                .collect(Collectors.toList());
    }
}
