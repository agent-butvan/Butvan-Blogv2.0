package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.profile.ProfileUpdateDTO;
import com.butvan.blog.pojo.vo.profile.ProfileVO;
import com.butvan.blog.service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

/**
 * 公开用户资料 API 控制器
 *
 * 为博客前台首页提供个人信息查询接口，无需登录认证。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 【公开】根据用户名获取个人公开资料
     *
     * @param username 登录用户名（如 butvan）
     * @return 公开资料 VO，用户不存在时返回错误
     */
    @GetMapping("/profile/public/{username}")
    public Result<ProfileVO> getPublicProfile(@PathVariable String username) {
        log.info("公开资料查询请求：username={}", username);
        ProfileVO vo = profileService.getPublicProfile(username);
        if (vo == null) {
            return Result.error(404, "用户不存在：" + username);
        }
        return Result.success(vo);
    }

    /**
     * 【管理端】获取当前登录管理员的个人公开资料
     *
     * @param principal 安全凭证对象，由 Spring Security 注入
     * @return 个人公开资料 VO
     */
    @GetMapping("/admin/profile")
    public Result<ProfileVO> getAdminProfile(Principal principal) {
        String username = principal.getName();
        log.info("管理端查询公开资料请求：username={}", username);
        ProfileVO vo = profileService.getPublicProfile(username);
        if (vo == null) {
            return Result.error(404, "管理员账户不存在：" + username);
        }
        return Result.success(vo);
    }

    /**
     * 【管理端】更新当前登录管理员的个人公开资料
     *
     * @param dto       个人公开资料更新 DTO
     * @param principal 安全凭证对象，由 Spring Security 注入
     * @return 统一返回格式 Result，无具体内容
     */
    @PutMapping("/admin/profile")
    public Result<Void> updateProfile(@RequestBody ProfileUpdateDTO dto, Principal principal) {
        String username = principal.getName();
        log.info("管理端更新公开资料请求：username={}", username);
        profileService.updateProfile(username, dto);
        return Result.success();
    }
}
