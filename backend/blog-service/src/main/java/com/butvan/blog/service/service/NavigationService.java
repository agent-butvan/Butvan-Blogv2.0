package com.butvan.blog.service.service;

import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import java.util.List;

/**
 * 导航菜单业务逻辑层接口
 */
public interface NavigationService {

    /**
     * 根据菜单位置获取树状层次结构的导航菜单列表
     *
     * @param position 菜单显示位置，若为空则默认获取全部位置
     * @return 树状层次结构的视图对象 (VO) 列表
     */
    List<NavigationVO> getNavigationTree(String position);
}
