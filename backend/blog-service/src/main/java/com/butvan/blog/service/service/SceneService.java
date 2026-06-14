package com.butvan.blog.service.service;

import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.SceneDetailVO;

import java.util.List;

public interface SceneService {
    SceneDetailVO getActiveSceneDetail();
    
    List<Scene> getAllScenes();
    
    Scene getSceneById(Long id);
    
    Scene saveScene(Scene scene);
    
    void deleteScene(Long id);
    
    void setActiveScene(Long id);
    
    List<Hotspot> getHotspotsBySceneId(Long sceneId);
    
    Hotspot saveHotspot(Hotspot hotspot);
    
    void deleteHotspot(Long id);
}
