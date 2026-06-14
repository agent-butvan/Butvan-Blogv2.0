package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.service.NavigationService;
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
     * 根据导航位置获取树级展现的导航菜单列表
     *
     * @param position 菜单配置展示位置，默认获取 HEADER (前台顶部导航)
     * @return 统一格式 Result，携带 NavigationVO 树形根列表
     */
    @GetMapping("/navigations")
    public Result<List<NavigationVO>> getNavigations(
            @RequestParam(value = "position", required = false, defaultValue = "HEADER") String position) {
        log.info("接收到获取导航菜单列表 API 请求，展示位置为: {}", position);
        List<NavigationVO> tree = navigationService.getNavigationTree(position);
        return Result.success(tree);
    }
}
