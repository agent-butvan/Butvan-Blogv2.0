package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.SceneDetailVO;
import com.butvan.blog.service.service.SceneService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cross origin for easy local frontend development
public class SceneController {

    private final SceneService sceneService;

    // --- Scene Endpoints ---

    @GetMapping("/scenes/active")
    public Result<SceneDetailVO> getActiveSceneDetail() {
        return Result.success(sceneService.getActiveSceneDetail());
    }

    @GetMapping("/scenes")
    public Result<List<Scene>> getAllScenes() {
        return Result.success(sceneService.getAllScenes());
    }

    @GetMapping("/scenes/{id}")
    public Result<Scene> getSceneById(@PathVariable Long id) {
        return Result.success(sceneService.getSceneById(id));
    }

    @PostMapping("/scenes")
    public Result<Scene> saveScene(@Validated @RequestBody Scene scene) {
        return Result.success(sceneService.saveScene(scene));
    }

    @PostMapping("/scenes/{id}/active")
    public Result<Void> setActiveScene(@PathVariable Long id) {
        sceneService.setActiveScene(id);
        return Result.success();
    }

    @DeleteMapping("/scenes/{id}")
    public Result<Void> deleteScene(@PathVariable Long id) {
        sceneService.deleteScene(id);
        return Result.success();
    }

    // --- Hotspot Endpoints ---

    @GetMapping("/scenes/{sceneId}/hotspots")
    public Result<List<Hotspot>> getHotspotsBySceneId(@PathVariable Long sceneId) {
        return Result.success(sceneService.getHotspotsBySceneId(sceneId));
    }

    @PostMapping("/hotspots")
    public Result<Hotspot> saveHotspot(@Validated @RequestBody Hotspot hotspot) {
        return Result.success(sceneService.saveHotspot(hotspot));
    }

    @DeleteMapping("/hotspots/{id}")
    public Result<Void> deleteHotspot(@PathVariable Long id) {
        sceneService.deleteHotspot(id);
        return Result.success();
    }
}
