package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.scene.HotspotSaveDTO;
import com.butvan.blog.pojo.dto.scene.SceneSaveDTO;
import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.home.HomeSceneVO;
import java.util.List;

/**
 * 首页场景与可交互热区业务逻辑层接口
 */
public interface SceneService {

    /**
     * 获取当前处于激活状态的首页场景，包括场景下的所有展示热区
     *
     * @return 首页场景及热区 VO 封装
     */
    HomeSceneVO getActiveScene();

    /**
     * 查询全部场景列表 (管理后台使用)
     *
     * @return 场景列表
     */
    List<Scene> listScenes();

    /**
     * 获取指定场景的详细信息及热区列表 (管理后台使用)
     *
     * @param sceneId 场景ID
     * @return 首页场景及热区 VO 封装
     */
    HomeSceneVO getSceneDetail(Long sceneId);

    /**
     * 保存或更新场景 (管理后台使用)
     *
     * @param sceneSaveDTO 场景属性传输类
     * @return 保存后的场景实体
     */
    Scene saveScene(SceneSaveDTO sceneSaveDTO);

    /**
     * 激活并启用选中的场景（必须把先前激活的场景退服，保证全局唯一性）
     *
     * @param sceneId 目标场景ID
     */
    void activateScene(Long sceneId);

    /**
     * 新增或编辑场景下的热区物品 (管理后台使用)
     *
     * @param hotspotSaveDTO 热区属性传输类
     * @return 保存后的热区物品实体
     */
    Hotspot saveHotspot(HotspotSaveDTO hotspotSaveDTO);

    /**
     * 删除选中的热区物品 (管理后台使用)
     *
     * @param hotspotId 物品ID
     */
    void deleteHotspot(Long hotspotId);

    /**
     * 删除指定场景及其关联的全部热区物品 (管理后台使用)
     *
     * @param sceneId 场景ID
     */
    void deleteScene(Long sceneId);
}
