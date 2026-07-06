package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.site.SiteConfigUpdateDTO;
import com.butvan.blog.pojo.vo.site.SiteConfigVO;
import com.butvan.blog.service.service.SiteConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 站点配置 API 控制器
 *
 * 提供站点级全局配置项的管理端读写接口和客户端公开查询接口。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SiteConfigController {

    private final SiteConfigService siteConfigService;

    /**
     * 【公开】客户端查询指定站点配置项
     *
     * @param configKey 配置键，如 background_image_url
     * @return 配置 VO
     */
    @GetMapping("/site-config/public/{configKey}")
    public Result<SiteConfigVO> getPublicConfig(@PathVariable String configKey) {
        log.info("公开查询站点配置：configKey={}", configKey);
        SiteConfigVO vo = siteConfigService.getConfig(configKey);
        return Result.success(vo);
    }

    /**
     * 【管理端】查询指定站点配置项（需认证）
     *
     * @param configKey 配置键
     * @return 配置 VO
     */
    @GetMapping("/admin/site-config/{configKey}")
    public Result<SiteConfigVO> getAdminConfig(@PathVariable String configKey) {
        log.info("管理端查询站点配置：configKey={}", configKey);
        SiteConfigVO vo = siteConfigService.getConfig(configKey);
        return Result.success(vo);
    }

    /**
     * 【管理端】更新指定站点配置项（需认证）
     *
     * @param configKey 配置键
     * @param dto       更新 DTO
     * @return 操作结果
     */
    @PutMapping("/admin/site-config/{configKey}")
    public Result<Void> updateConfig(@PathVariable String configKey,
                                      @RequestBody SiteConfigUpdateDTO dto) {
        log.info("管理端更新站点配置：configKey={}, configValue={}", configKey, dto.getConfigValue());
        siteConfigService.setConfig(configKey, dto.getConfigValue());
        return Result.success();
    }
}
