package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.entity.Category;
import com.butvan.blog.pojo.vo.category.CategorySimpleVO;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CategoryRepository;
import com.butvan.blog.service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 分类业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;

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

    @Override
    public List<Category> listAllCategories() {
        log.info("查询全部分类列表(包含不可见)按排序字段升序");
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder"));
    }

    @Override
    public Category saveCategory(Category category) {
        log.info("新增或编辑保存分类: {}", category.getName());
        
        // 1. 检验 slug 是否唯一
        Optional<Category> optBySlug = categoryRepository.findBySlug(category.getSlug());
        if (category.getId() == null) {
            // 新增
            if (optBySlug.isPresent()) {
                throw new BusinessException("分类标识(slug)已存在，请重新输入");
            }
        } else {
            // 编辑
            if (optBySlug.isPresent() && !optBySlug.get().getId().equals(category.getId())) {
                throw new BusinessException("分类标识(slug)已存在，请重新输入");
            }
            // 校验父分类是否等于自身 ID (防止自嵌套)
            if (category.getParentId() != null && category.getParentId().equals(category.getId())) {
                throw new BusinessException("父分类不能是分类自身");
            }
        }

        // 2. 校验父分类是否存在
        if (category.getParentId() != null) {
            categoryRepository.findById(category.getParentId())
                    .orElseThrow(() -> new BusinessException("所选父级分类不存在"));
        }

        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        log.info("根据 ID 删除分类: {}", id);
        
        // 1. 校验分类是否存在
        categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("分类不存在"));

        // 2. 校验是否含子分类
        if (categoryRepository.existsByParentId(id)) {
            throw new BusinessException("该分类下含有子级分类，无法直接删除");
        }

        // 3. 校验是否有文章关联
        if (articleRepository.existsByCategoryId(id)) {
            throw new BusinessException("该分类下尚有关联的文章，无法删除");
        }

        categoryRepository.deleteById(id);
    }
}
