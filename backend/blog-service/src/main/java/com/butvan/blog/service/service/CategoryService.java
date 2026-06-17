package com.butvan.blog.service.service;

import com.butvan.blog.pojo.entity.Category;
import com.butvan.blog.pojo.vo.category.CategorySimpleVO;
import java.util.List;

/**
 * 分类业务逻辑处理服务层接口
 */
public interface CategoryService {

    /**
     * 获取全部可见分类的极简信息列表，供关联配置或下拉菜单选择
     *
     * @return 分类极简 VO 列表
     */
    List<CategorySimpleVO> listSimpleCategories();

    /**
     * 获取全部分类的列表，用于后台分类管理列表展示
     *
     * @return 分类实体列表
     */
    List<Category> listAllCategories();

    /**
     * 新增或编辑保存分类
     *
     * @param category 分类实体数据
     * @return 保存持久化后的分类实体
     */
    Category saveCategory(Category category);

    /**
     * 根据主键 ID 删除分类
     *
     * @param id 分类主键 ID
     */
    void deleteCategory(Long id);
}
