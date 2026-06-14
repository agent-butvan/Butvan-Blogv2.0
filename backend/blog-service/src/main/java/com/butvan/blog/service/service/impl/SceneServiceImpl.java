package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BaseException;
import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.SceneDetailVO;
import com.butvan.blog.service.repository.HotspotRepository;
import com.butvan.blog.service.repository.SceneRepository;
import com.butvan.blog.service.service.SceneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SceneServiceImpl implements SceneService {

    private final SceneRepository sceneRepository;
    private final HotspotRepository hotspotRepository;

    @Override
    public SceneDetailVO getActiveSceneDetail() {
        Optional<Scene> activeSceneOpt = sceneRepository.findByIsActiveTrue();
        if (activeSceneOpt.isEmpty()) {
            return SceneDetailVO.builder()
                    .scene(null)
                    .hotspots(new ArrayList<>())
                    .build();
        }
        Scene scene = activeSceneOpt.get();
        List<Hotspot> hotspots = hotspotRepository.findBySceneIdOrderBySortOrderAsc(scene.getId());
        return SceneDetailVO.builder()
                .scene(scene)
                .hotspots(hotspots)
                .build();
    }

    @Override
    public List<Scene> getAllScenes() {
        return sceneRepository.findAll();
    }

    @Override
    public Scene getSceneById(Long id) {
        return sceneRepository.findById(id)
                .orElseThrow(() -> new BaseException("Scene not found with id: " + id));
    }

    @Override
    @Transactional
    public Scene saveScene(Scene scene) {
        if (scene.getIsActive() != null && scene.getIsActive()) {
            // Deactivate all other scenes
            sceneRepository.findAll().forEach(s -> {
                if (!s.getId().equals(scene.getId())) {
                    s.setIsActive(false);
                    sceneRepository.save(s);
                }
            });
        }
        return sceneRepository.save(scene);
    }

    @Override
    @Transactional
    public void deleteScene(Long id) {
        sceneRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void setActiveScene(Long id) {
        Scene scene = getSceneById(id);
        // Deactivate all
        sceneRepository.findAll().forEach(s -> {
            s.setIsActive(false);
            sceneRepository.save(s);
        });
        scene.setIsActive(true);
        sceneRepository.save(scene);
    }

    @Override
    public List<Hotspot> getHotspotsBySceneId(Long sceneId) {
        return hotspotRepository.findBySceneIdOrderBySortOrderAsc(sceneId);
    }

    @Override
    @Transactional
    public Hotspot saveHotspot(Hotspot hotspot) {
        // Verify scene exists
        if (!sceneRepository.existsById(hotspot.getSceneId())) {
            throw new BaseException("Cannot save hotspot, scene does not exist with id: " + hotspot.getSceneId());
        }
        return hotspotRepository.save(hotspot);
    }

    @Override
    @Transactional
    public void deleteHotspot(Long id) {
        hotspotRepository.deleteById(id);
    }
}
