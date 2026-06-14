package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.dto.scene.HotspotSaveDTO;
import com.butvan.blog.pojo.dto.scene.SceneSaveDTO;
import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.home.HomeSceneVO;
import com.butvan.blog.pojo.vo.home.HotspotVO;
import com.butvan.blog.service.repository.HotspotRepository;
import com.butvan.blog.service.repository.SceneRepository;
import com.butvan.blog.service.service.SceneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 首页场景与可交互热区业务逻辑层实现类
 */
@Service
public class SceneServiceImpl implements SceneService {

    @Autowired
    private SceneRepository sceneRepository;

    @Autowired
    private HotspotRepository hotspotRepository;

    @Override
    public HomeSceneVO getActiveScene() {
        // 1. 获取激活的场景，若无激活场景则取列表的第一个，或直接抛异常
        Scene scene = sceneRepository.findActiveScene()
                .orElseThrow(() -> new BusinessException("没有处于激活状态的首页房间场景，请先在管理后台配置启用"));

        // 2. 查询此场景下前台可见的所有热区物品 (isVisible = true)
        List<Hotspot> hotspots = hotspotRepository.findVisibleHotspots(scene.getId());

        // 3. 组装 VO 视图对象
        return buildHomeSceneVO(scene, hotspots);
    }

    @Override
    public List<Scene> listScenes() {
        return sceneRepository.findAll();
    }

    @Override
    public HomeSceneVO getSceneDetail(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new BusinessException("首页房间场景不存在，ID: " + sceneId));
        
        // 管理员能看到该场景下的所有热区 (包括隐藏项)
        List<Hotspot> hotspots = hotspotRepository.findBySceneIdOrderBySortOrderAsc(sceneId);
        
        return buildHomeSceneVO(scene, hotspots);
    }

    @Override
    @Transactional
    public Scene saveScene(SceneSaveDTO sceneSaveDTO) {
        boolean willBeActive = sceneSaveDTO.getIsActive() != null && sceneSaveDTO.getIsActive();

        // 1. 如果新设定为启用场景，先将其他所有激活场景标记为不启用并保存，以防 uk_scene_active 约束报错
        if (willBeActive) {
            Long excludeId = sceneSaveDTO.getId() != null ? sceneSaveDTO.getId() : -1L;
            handleSingleActiveScene(excludeId);
        }

        Scene scene;
        if (sceneSaveDTO.getId() != null) {
            scene = sceneRepository.findById(sceneSaveDTO.getId())
                    .orElseThrow(() -> new BusinessException("要更新的房间场景不存在"));
            scene.setTitle(sceneSaveDTO.getTitle());
            scene.setImageUrl(sceneSaveDTO.getImageUrl());
            scene.setIsActive(willBeActive);
        } else {
            scene = Scene.builder()
                    .title(sceneSaveDTO.getTitle())
                    .imageUrl(sceneSaveDTO.getImageUrl())
                    .isActive(willBeActive)
                    .build();
        }

        return sceneRepository.save(scene);
    }

    @Override
    @Transactional
    public void activateScene(Long sceneId) {
        // 1. 先将其他激活场景全部标记为不激活并保存，以保证数据库中仅存单激活状态，避开 uk_scene_active 唯一冲突
        handleSingleActiveScene(sceneId);

        // 2. 再更新当前目标场景为激活状态并保存
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new BusinessException("要启用的场景不存在"));
        
        scene.setIsActive(true);
        sceneRepository.save(scene);
    }

    @Override
    @Transactional
    public Hotspot saveHotspot(HotspotSaveDTO hotspotSaveDTO) {
        // 验证场景是否存在
        sceneRepository.findById(hotspotSaveDTO.getSceneId())
                .orElseThrow(() -> new BusinessException("关联的房间场景不存在，sceneId: " + hotspotSaveDTO.getSceneId()));

        Hotspot hotspot;
        if (hotspotSaveDTO.getId() != null) {
            hotspot = hotspotRepository.findById(hotspotSaveDTO.getId())
                    .orElseThrow(() -> new BusinessException("要保存的热区物品不存在"));
        } else {
            hotspot = new Hotspot();
        }

        // 映射属性
        hotspot.setSceneId(hotspotSaveDTO.getSceneId());
        hotspot.setItemName(hotspotSaveDTO.getItemName());
        hotspot.setItemImageUrl(hotspotSaveDTO.getItemImageUrl());
        hotspot.setXPercent(hotspotSaveDTO.getXPercent());
        hotspot.setYPercent(hotspotSaveDTO.getYPercent());
        hotspot.setWidthPercent(hotspotSaveDTO.getWidthPercent());
        hotspot.setHeightPercent(hotspotSaveDTO.getHeightPercent());
        hotspot.setGeometryExt(hotspotSaveDTO.getGeometryExt());
        hotspot.setHoverTips(hotspotSaveDTO.getHoverTips());
        hotspot.setRedirectType(hotspotSaveDTO.getRedirectType());
        hotspot.setRedirectPath(hotspotSaveDTO.getRedirectPath());
        hotspot.setRedirectTargetId(hotspotSaveDTO.getRedirectTargetId());
        hotspot.setZoomScale(hotspotSaveDTO.getZoomScale());
        hotspot.setSortOrder(hotspotSaveDTO.getSortOrder());
        hotspot.setIsVisible(hotspotSaveDTO.getIsVisible());

        return hotspotRepository.save(hotspot);
    }

    @Override
    @Transactional
    public void deleteHotspot(Long hotspotId) {
        if (!hotspotRepository.existsById(hotspotId)) {
            throw new BusinessException("该热区物品不存在，删除失败");
        }
        hotspotRepository.deleteById(hotspotId);
    }

    @Override
    @Transactional
    public void deleteScene(Long sceneId) {
        // 校验场景存在
        sceneRepository.findById(sceneId)
                .orElseThrow(() -> new BusinessException("要删除的场景不存在"));

        // 级联删除该场景下的全部热区物品
        hotspotRepository.deleteBySceneId(sceneId);

        // 删除场景本身
        sceneRepository.deleteById(sceneId);
    }

    /**
     * 将其他所有场景置为未激活，以维持 uk_scene_active 唯一性约束
     *
     * @param activeSceneId 应当保持激活的场景 ID
     */
    private void handleSingleActiveScene(Long activeSceneId) {
        List<Scene> scenes = sceneRepository.findAll();
        for (Scene s : scenes) {
            if (!s.getId().equals(activeSceneId) && s.getIsActive()) {
                s.setIsActive(false);
                sceneRepository.save(s);
            }
        }
    }

    /**
     * 构建 HomeSceneVO 封装对象
     */
    private HomeSceneVO buildHomeSceneVO(Scene scene, List<Hotspot> hotspots) {
        List<HotspotVO> hotspotVOs = hotspots.stream().map(h -> HotspotVO.builder()
                .id(h.getId())
                .itemName(h.getItemName())
                .itemImageUrl(h.getItemImageUrl())
                .xPercent(h.getXPercent())
                .yPercent(h.getYPercent())
                .widthPercent(h.getWidthPercent())
                .heightPercent(h.getHeightPercent())
                .geometryExt(h.getGeometryExt())
                .hoverTips(h.getHoverTips())
                .redirectType(h.getRedirectType())
                .redirectPath(h.getRedirectPath())
                .redirectTargetId(h.getRedirectTargetId())
                .zoomScale(h.getZoomScale())
                .sortOrder(h.getSortOrder())
                .isVisible(h.getIsVisible())
                .build()
        ).collect(Collectors.toList());

        return HomeSceneVO.builder()
                .id(scene.getId())
                .title(scene.getTitle())
                .imageUrl(scene.getImageUrl())
                .isActive(scene.getIsActive())
                .hotspots(hotspotVOs)
                .build();
    }
}
