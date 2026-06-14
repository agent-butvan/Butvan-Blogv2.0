package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.scene.HotspotSaveDTO;
import com.butvan.blog.pojo.dto.scene.SceneSaveDTO;
import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import com.butvan.blog.pojo.vo.home.HomeSceneVO;
import com.butvan.blog.service.service.SceneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 首页房间场景及热区可交互物品 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SceneController {

    private final SceneService sceneService;

    /**
     * 【用户端】获取当前激活启用的首页房间场景及所有前台可见热区 (isVisible = true)
     *
     * @return 统一格式 Result，携带场景及热区聚合数据
     */
    @GetMapping("/scenes/active")
    public Result<HomeSceneVO> getActiveScene() {
        log.info("用户端获取激活场景配置 API 请求");
        HomeSceneVO vo = sceneService.getActiveScene();
        return Result.success(vo);
    }

    /**
     * 【管理端】获取全部房间场景列表
     *
     * @return 统一格式 Result，携带全部场景列表
     */
    @GetMapping("/admin/scenes")
    public Result<List<Scene>> listScenes() {
        log.info("管理后台获取全部场景列表");
        List<Scene> list = sceneService.listScenes();
        return Result.success(list);
    }

    /**
     * 【管理端】根据场景 ID 获取其完整详情及全部热区配置列表 (含隐藏热区)
     *
     * @param id 场景 ID
     * @return 统一格式 Result，携带场景及关联所有热区列表
     */
    @GetMapping("/admin/scenes/{id}")
    public Result<HomeSceneVO> getSceneDetail(@PathVariable Long id) {
        log.info("管理后台获取场景详情，ID: {}", id);
        HomeSceneVO vo = sceneService.getSceneDetail(id);
        return Result.success(vo);
    }

    /**
     * 【管理端】保存或更新房间场景配置
     *
     * @param dto 场景保存/更新请求对象
     * @return 统一格式 Result，携带最新保存的场景实体
     */
    @PostMapping("/admin/scenes")
    public Result<Scene> saveScene(@RequestBody SceneSaveDTO dto) {
        log.info("管理后台保存场景，title: {}", dto.getTitle());
        Scene scene = sceneService.saveScene(dto);
        return Result.success(scene);
    }

    /**
     * 【管理端】激活启用指定房间场景
     *
     * @param id 场景 ID
     * @return 统一格式 Result，Void 成功标识
     */
    @PutMapping("/admin/scenes/{id}/active")
    public Result<Void> activateScene(@PathVariable Long id) {
        log.info("管理后台激活场景，ID: {}", id);
        sceneService.activateScene(id);
        return Result.success();
    }

    /**
     * 【管理端】新增或更新单个热区物品的摆放坐标及基本属性
     *
     * @param dto 热区物品信息 DTO
     * @return 统一格式 Result，携带保存后的热区物品实体
     */
    @PostMapping("/admin/scenes/hotspots")
    public Result<Hotspot> saveHotspot(@RequestBody HotspotSaveDTO dto) {
        log.info("管理后台保存/更新热区物品: {}, 归属场景: {}", dto.getItemName(), dto.getSceneId());
        Hotspot hotspot = sceneService.saveHotspot(dto);
        return Result.success(hotspot);
    }

    /**
     * 【管理端】删除指定的热区物品
     *
     * @param id 热区物品 ID
     * @return 统一格式 Result，Void 成功标识
     */
    @DeleteMapping("/admin/scenes/hotspots/{id}")
    public Result<Void> deleteHotspot(@PathVariable Long id) {
        log.info("管理后台删除热区物品，ID: {}", id);
        sceneService.deleteHotspot(id);
        return Result.success();
    }

    /**
     * 【管理端】删除指定场景及其关联的全部热区物品
     *
     * @param id 场景 ID
     * @return 统一格式 Result，Void 成功标识
     */
    @DeleteMapping("/admin/scenes/{id}")
    public Result<Void> deleteScene(@PathVariable Long id) {
        log.info("管理后台删除场景，ID: {}", id);
        sceneService.deleteScene(id);
        return Result.success();
    }
}
