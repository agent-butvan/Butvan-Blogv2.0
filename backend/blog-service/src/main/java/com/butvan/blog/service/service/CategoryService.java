package com.butvan.blog.service.service;

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
}
