package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.auth.LoginVO;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.security.JwtUtil;
import com.butvan.blog.service.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 账号认证与权限业务逻辑层实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 管理后台账号注册核心业务实现
     *
     * @param registerDTO 注册表单传输对象
     */
    @Override
    @Transactional
    public void register(RegisterDTO registerDTO) {
        log.info("开始处理用户注册请求，用户名: {}", registerDTO.getUsername());

        // 1. 唯一性校验：判断用户名是否已占用
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            log.warn("注册失败，用户名已占用: {}", registerDTO.getUsername());
            throw new BusinessException(400, "该用户名已被注册使用");
        }

        // 2. 唯一性校验：如果填了邮箱，校验邮箱是否已被绑定
        if (registerDTO.getEmail() != null && !registerDTO.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(registerDTO.getEmail())) {
                log.warn("注册失败，邮箱已占用: {}", registerDTO.getEmail());
                throw new BusinessException(400, "该电子邮箱已被其它账号绑定");
            }
        }

        // 3. 密码高安全加密处理
        String encodedPassword = passwordEncoder.encode(registerDTO.getPassword());

        // 4. 判断用户角色身份分配策略：如果数据库中还没有任何账号，第一个人自动升级为 ADMIN，后续为 AUTHOR
        String assignedRole = "AUTHOR";
        long totalUsers = userRepository.count();
        if (totalUsers == 0) {
            assignedRole = "ADMIN";
            log.info("数据库中无可用账号，默认将首个注册账号 [{}] 设为系统超级管理员 (ADMIN)", registerDTO.getUsername());
        }

        // 5. 构建并装配持久化实体对象
        User user = User.builder()
                .username(registerDTO.getUsername())
                .passwordHash(encodedPassword)
                .nickname(registerDTO.getNickname())
                .email(registerDTO.getEmail())
                .role(assignedRole)
                .status("ACTIVE") // 默认注册即激活启用
                .build();

        userRepository.save(user);
        log.info("用户 [{}] 成功注册入库，分配角色: {}", user.getUsername(), user.getRole());
    }

    /**
     * 管理后台账号登录核心业务实现
     *
     * @param loginDTO 登录表单传输对象
     * @return 登录结果视图对象
     */
    @Override
    public LoginVO login(LoginDTO loginDTO) {
        log.info("开始处理用户登录请求，用户名: {}", loginDTO.getUsername());

        // 1. 查询用户是否存在
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new BusinessException(400, "用户名或密码错误"));

        // 2. 校验账号是否已启用 (ACTIVE)
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            log.warn("用户登录失败，账号被停用: {}", loginDTO.getUsername());
            throw new BusinessException(400, "该账号已被停用，请联系管理员");
        }

        // 3. 校验密码是否匹配
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPasswordHash())) {
            log.warn("用户登录失败，密码不匹配: {}", loginDTO.getUsername());
            throw new BusinessException(400, "用户名或密码错误");
        }

        // 4. 签发 JWT
        String token = jwtUtil.generateToken(user.getUsername());
        log.info("用户 [{}] 登录成功，JWT 签发完毕", user.getUsername());

        // 5. 组装 LoginVO 响应体
        return LoginVO.builder()
                .token(token)
                .user(LoginVO.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .nickname(user.getNickname())
                        .avatarUrl(user.getAvatarUrl())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
