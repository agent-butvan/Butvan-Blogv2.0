package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.pojo.entity.Category;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.vo.category.CategorySimpleVO;
import com.butvan.blog.service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 分类业务 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)
     *
     * @return 统一格式 Result 包装 of 极简分类列表
     */
    @TrackApi("【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)")
    @GetMapping("/categories/simple")
    public Result<List<CategorySimpleVO>> listSimpleCategories() {
        log.info("获取极简可见分类列表 API 请求");
        List<CategorySimpleVO> list = categoryService.listSimpleCategories();
        return Result.success(list);
    }

    /**
     * 【管理端】获取全部的分类实体列表（包含不可见的，且按 sort_order 排序）
     *
     * @return 统一格式 Result 包装的分类实体列表
     */
    @TrackApi("【管理端】获取全部的分类实体列表（包含不可见的，且按 sort_order 排序）")
    @GetMapping("/categories")
    public Result<List<Category>> listAllCategories() {
        log.info("获取后台全部分类实体列表 API 请求");
        List<Category> list = categoryService.listAllCategories();
        return Result.success(list);
    }

    /**
     * 【管理端】新建分类
     *
     * @param category 分类实体数据
     * @return 统一格式 Result 包装的新增实体数据
     */
    @TrackApi("【管理端】新建分类")
    @PostMapping("/categories")
    public Result<Category> createCategory(@RequestBody Category category) {
        log.info("新建分类 API 请求: {}", category.getName());
        Category saved = categoryService.saveCategory(category);
        return Result.success(saved);
    }

    /**
     * 【管理端】更新分类
     *
     * @param id 分类主键 ID
     * @param category 分类实体数据
     * @return 统一格式 Result 包装的修改后实体数据
     */
    @TrackApi("【管理端】更新分类")
    @PutMapping("/categories/{id}")
    public Result<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        log.info("更新分类 API 请求: id={}, name={}", id, category.getName());
        category.setId(id);
        Category updated = categoryService.saveCategory(category);
        return Result.success(updated);
    }

    /**
     * 【管理端】根据 ID 删除分类
     *
     * @param id 待删除分类主键 ID
     * @return 统一格式 Result 包装的空返回
     */
    @TrackApi("【管理端】根据 ID 删除分类")
    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        log.info("删除分类 API 请求: id={}", id);
        categoryService.deleteCategory(id);
        return Result.success();
    }
}
