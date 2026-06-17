package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.vo.category.CategorySimpleVO;
import com.butvan.blog.service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
     * @return 统一格式 Result 包装的极简分类列表
     */
    @GetMapping("/categories/simple")
    public Result<List<CategorySimpleVO>> listSimpleCategories() {
        log.info("获取极简可见分类列表 API 请求");
        List<CategorySimpleVO> list = categoryService.listSimpleCategories();
        return Result.success(list);
    }
}
