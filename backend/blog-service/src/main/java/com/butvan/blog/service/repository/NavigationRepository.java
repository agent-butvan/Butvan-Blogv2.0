package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Navigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 导航菜单表 JPA 持久化仓储数据层接口
 */
@Repository
public interface NavigationRepository extends JpaRepository<Navigation, Long> {

    /**
     * 根据菜单展示位置查询所有启用显示的菜单记录并进行升序排序
     *
     * @param position 展示位置：HEADER | FOOTER | SIDEBAR | ADMIN_SIDEBAR
     * @param isVisible 是否可见
     * @return 过滤排序后的菜单实体列表
     */
    List<Navigation> findByPositionAndIsVisibleOrderBySortOrderAsc(String position, Boolean isVisible);

    /**
     * 根据菜单展示位置查询所有菜单记录（含隐藏项），按排序权重升序
     * 用于管理后台，管理员需要看到全部菜单（包括未启用的）
     *
     * @param position 展示位置
     * @return 全部菜单实体列表（不区分是否可见）
     */
    List<Navigation> findByPositionOrderBySortOrderAsc(String position);

    /**
     * 根据菜单展示位置查询所有启用显示的菜单记录并进行升序排序 (默认只查可见)
     *
     * @param position 展示位置
     * @return 菜单实体列表
     */
    default List<Navigation> findVisibleNavigations(String position) {
        return findByPositionAndIsVisibleOrderBySortOrderAsc(position, true);
    }
}
