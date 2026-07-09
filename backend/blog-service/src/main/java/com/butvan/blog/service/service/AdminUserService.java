package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.admin.AdminCreateUserDTO;
import com.butvan.blog.pojo.dto.admin.AdminResetPasswordDTO;
import com.butvan.blog.pojo.dto.admin.AdminUpdateUserDTO;
import com.butvan.blog.pojo.vo.admin.AdminUserVO;
import java.util.List;

/**
 * 后台用户管理服务层接口
 * <p>提供管理员专用的用户 CRUD、启禁用、重置密码、批量操作等能力</p>
 */
public interface AdminUserService {

    /**
     * 分页查询用户列表（支持关键词搜索 + 角色/状态筛选）
     *
     * @param keyword 关键词（匹配用户名/昵称/邮箱）
     * @param role    角色筛选（ADMIN/AUTHOR，空则不过滤）
     * @param status  状态筛选（ACTIVE/DISABLED，空则不过滤）
     * @param page    页码（1-based）
     * @param size    每页大小
     * @return 分页结果
     */
    PageResult listUsers(String keyword, String role, String status, Integer page, Integer size);

    /**
     * 根据 ID 获取用户详情（含文章数/评论数统计）
     *
     * @param id 用户 ID
     * @return 用户详情 VO
     */
    AdminUserVO getUserById(Long id);

    /**
     * 管理员创建新用户
     *
     * @param dto 创建用户表单
     */
    void createUser(AdminCreateUserDTO dto);

    /**
     * 管理员编辑用户信息
     *
     * @param id  用户 ID
     * @param dto 更新表单
     * @return 更新后的用户 VO
     */
    AdminUserVO updateUser(Long id, AdminUpdateUserDTO dto);

    /**
     * 切换用户启用/禁用状态
     *
     * @param id            用户 ID
     * @param operatorName  操作者用户名（防止禁用自己）
     */
    void toggleUserStatus(Long id, String operatorName);

    /**
     * 删除用户（禁止删除自身、禁止删除最后一个 ADMIN）
     *
     * @param id            用户 ID
     * @param operatorName  操作者用户名
     */
    void deleteUser(Long id, String operatorName);

    /**
     * 管理员重置用户密码
     *
     * @param id  用户 ID
     * @param dto 新密码表单
     */
    void resetPassword(Long id, AdminResetPasswordDTO dto);

    /**
     * 批量切换用户状态
     *
     * @param ids           用户 ID 列表
     * @param status        目标状态（ACTIVE/DISABLED）
     * @param operatorName  操作者用户名
     */
    void batchToggleStatus(List<Long> ids, String status, String operatorName);
}
