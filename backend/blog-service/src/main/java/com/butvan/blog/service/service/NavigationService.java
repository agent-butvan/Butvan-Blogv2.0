package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.navigation.NavigationSaveDTO;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import java.util.List;

/**
 * 导航菜单业务逻辑层接口
 */
public interface NavigationService {

    /**
     * 根据菜单位置获取树状层次结构的导航菜单列表（仅可见菜单，前台用）
     *
     * @param position 菜单显示位置
     * @return 树状层次结构的视图对象 (VO) 列表
     */
    List<NavigationVO> getNavigationTree(String position);

    /**
     * 根据菜单位置获取树状层次结构的导航菜单列表（含隐藏项，管理后台用）
     *
     * @param position 菜单显示位置
     * @return 所有菜单的树状 VO 列表
     */
    List<NavigationVO> getNavigationTreeForAdmin(String position);

    /**
     * 创建新的导航菜单项
     *
     * @param dto 创建请求数据
     * @return 创建后的 VO
     */
    NavigationVO createNavigation(NavigationSaveDTO dto);

    /**
     * 更新指定导航菜单项
     *
     * @param id 菜单ID
     * @param dto 更新请求数据
     * @return 更新后的 VO
     */
    NavigationVO updateNavigation(Long id, NavigationSaveDTO dto);

    /**
     * 删除指定导航菜单项
     * 注意：若该项含有子菜单，则一并级联删除其所有子孙节点
     *
     * @param id 菜单ID
     */
    void deleteNavigation(Long id);
}
