package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.navigation.NavigationSaveDTO;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.service.NavigationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 导航菜单管理与展示控制层 RESTful 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NavigationController {

    private final NavigationService navigationService;

    /**
     * 【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）
     *
     * @param position 菜单配置展示位置，默认获取 HEADER (前台顶部导航)
     * @return 统一格式 Result，携带 NavigationVO 树形根列表
     */
    @TrackApi("【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）")
    @GetMapping("/navigations")
    public Result<List<NavigationVO>> getNavigations(
            @RequestParam(value = "position", required = false, defaultValue = "HEADER") String position) {
        log.info("接收到获取导航菜单列表 API 请求，展示位置为: {}", position);
        List<NavigationVO> tree = navigationService.getNavigationTree(position);
        return Result.success(tree);
    }

    /**
     * 【管理后台】获取指定位置的全部导航菜单（含隐藏项）
     *
     * @param position 菜单位置
     * @return 全部菜单的树形列表
     */
    @TrackApi("【管理后台】获取指定位置的全部导航菜单（含隐藏项）")
    @GetMapping("/admin/navigations")
    public Result<List<NavigationVO>> getAdminNavigations(
            @RequestParam(value = "position", required = false, defaultValue = "HEADER") String position) {
        log.info("管理后台获取导航菜单，位置: {}", position);
        List<NavigationVO> tree = navigationService.getNavigationTreeForAdmin(position);
        return Result.success(tree);
    }

    /**
     * 【管理后台】创建新导航菜单项
     *
     * @param dto 创建请求
     * @return 创建后的 VO
     */
    @TrackApi("【管理后台】创建新导航菜单项")
    @PostMapping("/admin/navigations")
    public Result<NavigationVO> createNavigation(@Valid @RequestBody NavigationSaveDTO dto) {
        log.info("创建新导航菜单: title={}, position={}", dto.getTitle(), dto.getPosition());
        NavigationVO vo = navigationService.createNavigation(dto);
        return Result.success(vo);
    }

    /**
     * 【管理后台】更新指定导航菜单项
     *
     * @param id 菜单ID
     * @param dto 更新请求
     * @return 更新后的 VO
     */
    @TrackApi("【管理后台】更新指定导航菜单项")
    @PutMapping("/admin/navigations/{id}")
    public Result<NavigationVO> updateNavigation(
            @PathVariable Long id, @Valid @RequestBody NavigationSaveDTO dto) {
        log.info("更新导航菜单: id={}, title={}", id, dto.getTitle());
        NavigationVO vo = navigationService.updateNavigation(id, dto);
        return Result.success(vo);
    }

    /**
     * 【管理后台】删除指定导航菜单项及其所有子孙节点
     *
     * @param id 菜单ID
     * @return 操作结果
     */
    @TrackApi("【管理后台】删除指定导航菜单项及其所有子孙节点")
    @DeleteMapping("/admin/navigations/{id}")
    public Result<Void> deleteNavigation(@PathVariable Long id) {
        log.info("删除导航菜单: id={}", id);
        navigationService.deleteNavigation(id);
        return Result.success();
    }
}
