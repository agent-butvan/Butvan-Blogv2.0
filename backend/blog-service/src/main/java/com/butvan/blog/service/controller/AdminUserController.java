package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.admin.AdminCreateUserDTO;
import com.butvan.blog.pojo.dto.admin.AdminResetPasswordDTO;
import com.butvan.blog.pojo.dto.admin.AdminUpdateUserDTO;
import com.butvan.blog.pojo.vo.admin.AdminUserVO;
import com.butvan.blog.service.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * 后台用户管理控制器
 * <p>仅 ADMIN 角色可访问，提供用户 CRUD、启禁用、重置密码、批量操作</p>
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * 分页查询用户列表
     *
     * @param keyword 关键词（用户名/昵称/邮箱模糊搜索）
     * @param role    角色筛选（ADMIN/AUTHOR）
     * @param status  状态筛选（ACTIVE/DISABLED）
     * @param page    页码（1-based，默认 1）
     * @param size    每页大小（默认 10）
     * @return 分页结果
     */
    @TrackApi("分页查询用户列表")
    @GetMapping
    public Result<PageResult> listUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        log.info("管理员查询用户列表: keyword={}, role={}, status={}, page={}, size={}", keyword, role, status, page, size);
        PageResult pageResult = adminUserService.listUsers(keyword, role, status, page, size);
        return Result.success(pageResult);
    }

    /**
     * 获取用户详情
     *
     * @param id 用户 ID
     * @return 用户详情 VO
     */
    @TrackApi("获取用户详情")
    @GetMapping("/{id}")
    public Result<AdminUserVO> getUserById(@PathVariable Long id) {
        AdminUserVO userVO = adminUserService.getUserById(id);
        return Result.success(userVO);
    }

    /**
     * 创建新用户
     *
     * @param dto 创建用户表单
     * @return 统一成功响应
     */
    @TrackApi("创建新用户")
    @PostMapping
    public Result<Void> createUser(@Validated @RequestBody AdminCreateUserDTO dto) {
        log.info("管理员创建用户: username={}", dto.getUsername());
        adminUserService.createUser(dto);
        return Result.success();
    }

    /**
     * 编辑用户信息
     *
     * @param id  用户 ID
     * @param dto 更新表单
     * @return 更新后的用户 VO
     */
    @TrackApi("编辑用户信息")
    @PutMapping("/{id}")
    public Result<AdminUserVO> updateUser(
            @PathVariable Long id,
            @Validated @RequestBody AdminUpdateUserDTO dto
    ) {
        log.info("管理员编辑用户: id={}", id);
        AdminUserVO userVO = adminUserService.updateUser(id, dto);
        return Result.success(userVO);
    }

    /**
     * 切换用户启用/禁用状态
     *
     * @param id        用户 ID
     * @param principal 当前操作者
     * @return 统一成功响应
     */
    @TrackApi("切换用户启用/禁用状态")
    @PatchMapping("/{id}/status")
    public Result<Void> toggleUserStatus(@PathVariable Long id, Principal principal) {
        log.info("管理员切换用户状态: id={}, operator={}", id, principal.getName());
        adminUserService.toggleUserStatus(id, principal.getName());
        return Result.success();
    }

    /**
     * 删除用户
     *
     * @param id        用户 ID
     * @param principal 当前操作者
     * @return 统一成功响应
     */
    @TrackApi("删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id, Principal principal) {
        log.info("管理员删除用户: id={}, operator={}", id, principal.getName());
        adminUserService.deleteUser(id, principal.getName());
        return Result.success();
    }

    /**
     * 重置用户密码
     *
     * @param id  用户 ID
     * @param dto 新密码表单
     * @return 统一成功响应
     */
    @TrackApi("重置用户密码")
    @PutMapping("/{id}/password")
    public Result<Void> resetPassword(
            @PathVariable Long id,
            @Validated @RequestBody AdminResetPasswordDTO dto
    ) {
        log.info("管理员重置密码: userId={}", id);
        adminUserService.resetPassword(id, dto);
        return Result.success();
    }

    /**
     * 批量切换用户状态
     *
     * @param body      包含 ids 和 status
     * @param principal 当前操作者
     * @return 统一成功响应
     */
    @TrackApi("批量切换用户状态")
    @PatchMapping("/batch/status")
    public Result<Void> batchToggleStatus(@RequestBody Map<String, Object> body, Principal principal) {
        @SuppressWarnings("unchecked")
        List<Integer> rawIds = (List<Integer>) body.get("ids");
        String status = (String) body.get("status");

        List<Long> ids = rawIds.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList());

        log.info("管理员批量切换用户状态: ids={}, status={}, operator={}", ids, status, principal.getName());
        adminUserService.batchToggleStatus(ids, status, principal.getName());
        return Result.success();
    }
}
