package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 首页可交互热区表 JPA 持久化仓储数据层接口
 */
@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {

    /**
     * 根据场景 ID 获取所有可交互物品并按照 sort_order 升序排序 (默认全部)
     *
     * @param sceneId 所属场景ID
     * @return 关联的热区物品实体列表
     */
    List<Hotspot> findBySceneIdOrderBySortOrderAsc(Long sceneId);

    /**
     * 根据场景 ID 获取所有在前台显示的可交互物品并按照 sort_order 升序排序
     *
     * @param sceneId 所属场景ID
     * @param isVisible 是否显示
     * @return 前台显示的热区物品实体列表
     */
    List<Hotspot> findBySceneIdAndIsVisibleOrderBySortOrderAsc(Long sceneId, Boolean isVisible);

    /**
     * 默认方便查询可见热区
     *
     * @param sceneId 场景ID
     * @return 可见热区实体列表
     */
    default List<Hotspot> findVisibleHotspots(Long sceneId) {
        return findBySceneIdAndIsVisibleOrderBySortOrderAsc(sceneId, true);
    }

    /**
     * 删除指定场景下的全部热区物品 (删除场景时级联清理)
     *
     * @param sceneId 所属场景ID
     */
    void deleteBySceneId(Long sceneId);
}
