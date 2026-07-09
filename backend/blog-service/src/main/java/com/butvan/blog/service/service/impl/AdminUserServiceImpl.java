package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.admin.AdminCreateUserDTO;
import com.butvan.blog.pojo.dto.admin.AdminResetPasswordDTO;
import com.butvan.blog.pojo.dto.admin.AdminUpdateUserDTO;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.admin.AdminUserVO;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CommentRepository;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.AdminUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 后台用户管理服务实现
 * <p>提供用户 CRUD、启禁用、重置密码、批量操作，含安全防护约束</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResult listUsers(String keyword, String role, String status, Integer page, Integer size) {
        log.info("管理员分页查询用户列表，keyword={}, role={}, status={}, page={}, size={}", keyword, role, status, page, size);

        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (size != null && size > 0) ? Math.min(size, 50) : 10;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Order.desc("createdAt")));

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 关键词模糊查询（匹配用户名/昵称/邮箱）
            if (StringUtils.hasText(keyword)) {
                String likeKw = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(root.get("username"), likeKw),
                        cb.like(root.get("nickname"), likeKw),
                        cb.like(root.get("email"), likeKw)
                ));
            }

            // 角色筛选
            if (StringUtils.hasText(role)) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            // 状态筛选
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<AdminUserVO> voList = userPage.getContent().stream()
                .map(this::toAdminUserVO)
                .collect(Collectors.toList());

        return PageResult.builder()
                .total(userPage.getTotalElements())
                .page(pageIndex + 1)
                .size(pageSize)
                .records(voList)
                .build();
    }

    @Override
    public AdminUserVO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return toAdminUserVO(user);
    }

    @Override
    @Transactional
    public void createUser(AdminCreateUserDTO dto) {
        log.info("管理员创建新用户，用户名: {}", dto.getUsername());

        // 校验用户名唯一性
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("用户名已被占用");
        }

        // 校验邮箱唯一性（如果提供了邮箱）
        if (StringUtils.hasText(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("邮箱已被其他账号绑定");
        }

        // 校验角色合法性
        validateRole(dto.getRole());

        User user = User.builder()
                .username(dto.getUsername())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .nickname(dto.getNickname())
                .email(StringUtils.hasText(dto.getEmail()) ? dto.getEmail() : null)
                .role(dto.getRole())
                .status("ACTIVE")
                .twoFactorEnabled(false)
                .build();

        userRepository.save(user);
        log.info("管理员创建用户成功，username={}, role={}", dto.getUsername(), dto.getRole());
    }

    @Override
    @Transactional
    public AdminUserVO updateUser(Long id, AdminUpdateUserDTO dto) {
        log.info("管理员编辑用户信息，userId={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 校验邮箱唯一性（排除自身）
        if (StringUtils.hasText(dto.getEmail()) && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("邮箱已被其他账号绑定");
            }
        }

        // 校验角色合法性
        validateRole(dto.getRole());

        user.setNickname(dto.getNickname());
        user.setEmail(StringUtils.hasText(dto.getEmail()) ? dto.getEmail() : null);
        user.setAvatarUrl(StringUtils.hasText(dto.getAvatarUrl()) ? dto.getAvatarUrl() : null);
        user.setBio(StringUtils.hasText(dto.getBio()) ? dto.getBio() : null);
        user.setRole(dto.getRole());

        userRepository.save(user);
        log.info("管理员编辑用户成功，userId={}", id);
        return toAdminUserVO(user);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id, String operatorName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 安全约束：不允许禁用自己的账号
        if (user.getUsername().equals(operatorName)) {
            throw new BusinessException("不能修改自己的账号状态");
        }

        String newStatus = "ACTIVE".equals(user.getStatus()) ? "DISABLED" : "ACTIVE";

        // 安全约束：不允许将最后一个 ADMIN 禁用
        if ("ACTIVE".equals(user.getStatus()) && "ADMIN".equals(user.getRole())) {
            long activeAdminCount = userRepository.findAll(
                    (Specification<User>) (root, query, cb) -> cb.and(
                            cb.equal(root.get("role"), "ADMIN"),
                            cb.equal(root.get("status"), "ACTIVE")
                    )).size();
            if (activeAdminCount <= 1) {
                throw new BusinessException("系统至少需要保留一个活跃的管理员账号");
            }
        }

        user.setStatus(newStatus);
        userRepository.save(user);
        log.info("用户状态切换: userId={}, {} -> {}", id, user.getStatus(), newStatus);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, String operatorName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 安全约束：不允许删除自己
        if (user.getUsername().equals(operatorName)) {
            throw new BusinessException("不能删除自己的账号");
        }

        // 安全约束：不允许删除最后一个 ADMIN
        if ("ADMIN".equals(user.getRole())) {
            long adminCount = userRepository.countByRole("ADMIN");
            if (adminCount <= 1) {
                throw new BusinessException("系统至少需要保留一个管理员账号");
            }
        }

        userRepository.delete(user);
        log.info("管理员删除用户: userId={}, username={}", id, user.getUsername());
    }

    @Override
    @Transactional
    public void resetPassword(Long id, AdminResetPasswordDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        log.info("管理员重置用户密码: userId={}, username={}", id, user.getUsername());
    }

    @Override
    @Transactional
    public void batchToggleStatus(List<Long> ids, String status, String operatorName) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException("请选择要操作的用户");
        }
        if (!"ACTIVE".equals(status) && !"DISABLED".equals(status)) {
            throw new BusinessException("无效的状态值");
        }

        // 查出操作者自身 ID
        User operator = userRepository.findByUsername(operatorName)
                .orElseThrow(() -> new BusinessException("操作者不存在"));

        // 安全约束：批量操作中排除操作者自身
        List<User> users = userRepository.findAllById(ids);
        if (users.isEmpty()) {
            throw new BusinessException("未找到指定的用户");
        }

        for (User user : users) {
            if (user.getId().equals(operator.getId())) {
                continue; // 跳过操作者自身
            }
            user.setStatus(status);
        }

        userRepository.saveAll(users);
        log.info("批量切换用户状态: count={}, status={}, operator={}", ids.size(), status, operatorName);
    }

    // ---- 内部工具方法 ----

    /**
     * 校验角色值合法性
     */
    private void validateRole(String role) {
        if (!"ADMIN".equals(role) && !"AUTHOR".equals(role)) {
            throw new BusinessException("无效的角色值，仅支持 ADMIN 或 AUTHOR");
        }
    }

    /**
     * 将 User 实体转换为 AdminUserVO（含文章数/评论数统计）
     */
    private AdminUserVO toAdminUserVO(User user) {
        long articleCount = articleRepository.countByAuthorIdAndDeletedAtIsNull(user.getId());
        long commentCount = commentRepository.countByUserIdAndDeletedAtIsNull(user.getId());

        return AdminUserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .githubUsername(user.getGithubUsername())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .articleCount(articleCount)
                .commentCount(commentCount)
                .build();
    }
}
