package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.common.utils.RedisUtils;
import com.butvan.blog.pojo.dto.auth.CurrentUserUpdateDTO;
import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.PasswordChangeDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorEnableDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorDisableDTO;
import com.butvan.blog.pojo.dto.auth.GithubBindDTO;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.auth.CurrentUserVO;
import com.butvan.blog.pojo.vo.auth.LoginVO;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.security.JwtUtil;
import com.butvan.blog.service.security.TotpUtil;
import com.butvan.blog.service.service.AuthService;
import com.butvan.blog.service.weixin.common.constant.WeiXinRedisKeyPrefix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

import com.butvan.blog.common.utils.EmailUtils;
import com.butvan.blog.service.service.SiteConfigService;
import com.butvan.blog.pojo.vo.site.SiteConfigVO;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import cn.hutool.core.util.RandomUtil;
import org.springframework.beans.factory.annotation.Value;
import java.util.concurrent.TimeUnit;

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
    private final FileStorageService fileStorageService;
    private final RedisUtils redisUtils;
    private final JavaMailSender mailSender;
    private final SiteConfigService siteConfigService;

    @Value("${spring.mail.username:}")
    private String mailFrom;

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
    @Transactional
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

        // 3. 根据登录入参判断登录模式：2FA 免密极速登录 或 传统密码登录
        String password = loginDTO.getPassword();
        String code = loginDTO.getTwoFactorCode();
        boolean is2FactorMode = (code != null && !code.trim().isEmpty()) && (password == null || password.trim().isEmpty());

        if (is2FactorMode) {
            // 3.1 2FA 免密直接登录模式
            if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
                log.warn("用户 [{}] 未启用双重验证，无法使用 2FA 免密登录", user.getUsername());
                throw new BusinessException(400, "该账号未开启双重验证，请使用密码登录");
            }
            if (!TotpUtil.verifyCode(user.getTwoFactorSecret(), code)) {
                log.warn("用户 [{}] 双重验证码输入错误: {}", user.getUsername(), code);
                throw new BusinessException(400, "双重验证码错误，请重新输入");
            }
            log.info("用户 [{}] 使用 2FA 免密通道登录成功", user.getUsername());
        } else {
            // 3.2 传统密码登录模式
            if (password == null || password.trim().isEmpty()) {
                throw new BusinessException(400, "登录密码不能为空");
            }
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                log.warn("用户登录失败，密码不匹配: {}", loginDTO.getUsername());
                throw new BusinessException(400, "用户名或密码错误");
            }
            // 密码通过后，如果该用户开启了 2FA，进行双重校验拦截
            if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
                if (code == null || code.trim().isEmpty()) {
                    log.warn("用户 [{}] 已启用双重验证，但登录未传入验证码，返回 NEED_2FA 拦截", user.getUsername());
                    throw new BusinessException(400, "NEED_2FA");
                }
                if (!TotpUtil.verifyCode(user.getTwoFactorSecret(), code)) {
                    log.warn("用户 [{}] 双重验证码输入错误: {}", user.getUsername(), code);
                    throw new BusinessException(400, "双重验证码错误，请重新输入");
                }
            }
        }

        // 4. 签发 JWT（携带 userId 和 role 增强载荷）
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("用户 [{}] 登录成功，JWT 签发完毕", user.getUsername());

        // 5. 组装 LoginVO 响应体
        return LoginVO.builder()
                .token(token)
                .user(LoginVO.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .avatarUrl(user.getAvatarUrl())
                        .githubUsername(user.getGithubUsername())
                        .twoFactorEnabled(user.getTwoFactorEnabled())
                        .role(user.getRole())
                        .build())
                .build();
    }

    /**
     * 查询当前登录账号的个人中心资料
     *
     * @param username 当前登录用户名
     * @return 当前账号资料视图对象
     */
    @Override
    public CurrentUserVO getCurrentUser(String username) {
        User user = findActiveUser(username);
        return toCurrentUserVO(user);
    }

    /**
     * 更新当前登录账号的基础资料
     *
     * @param username 当前登录用户名
     * @param dto      基础资料更新请求
     * @return 更新后的当前账号资料视图对象
     */
    @Override
    @Transactional
    public CurrentUserVO updateCurrentUser(String username, CurrentUserUpdateDTO dto) {
        User user = findActiveUser(username);

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            userRepository.findByEmail(dto.getEmail().trim())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new BusinessException(400, "该电子邮箱已被其它账号绑定");
                    });
            user.setEmail(dto.getEmail().trim());
        } else {
            user.setEmail(null);
        }

        user.setNickname(dto.getNickname().trim());
        user.setAvatarUrl(normalizeBlank(dto.getAvatarUrl()));
        user.setBio(normalizeBlank(dto.getBio()));

        User savedUser = userRepository.save(user);
        log.info("用户 [{}] 已更新个人中心基础资料", username);
        return toCurrentUserVO(savedUser);
    }

    /**
     * 修改当前登录账号密码
     *
     * @param username 当前登录用户名
     * @param dto      密码修改请求
     */
    @Override
    @Transactional
    public void changePassword(String username, PasswordChangeDTO dto) {
        User user = findActiveUser(username);
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(400, "当前密码不正确");
        }
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPasswordHash())) {
            throw new BusinessException(400, "新密码不能与当前密码相同");
        }
        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        log.info("用户 [{}] 已完成密码更新", username);
    }

    /**
     * 按用户名查询处于启用状态的用户实体
     *
     * @param username 当前登录用户名
     * @return 用户实体
     */
    private User findActiveUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new BusinessException(404, "当前登录账号不存在"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessException(403, "该账号已被停用，请联系管理员");
        }
        return user;
    }

    /**
     * 将空白字符串规整为 null，避免数据库写入无意义空字符串
     *
     * @param value 待规整的文本值
     * @return 规整后的文本值
     */
    private String normalizeBlank(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    /**
     * 将用户实体转换为当前账号个人中心视图对象
     *
     * @param user 用户实体
     * @return 当前账号资料视图对象
     */
    private CurrentUserVO toCurrentUserVO(User user) {
        return CurrentUserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .githubUsername(user.getGithubUsername())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .role(user.getRole())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    public Map<String, String> initTwoFactor(String username) {
        User user = findActiveUser(username);
        String secret = TotpUtil.generateSecret();
        String otpauthUri = String.format("otpauth://totp/ButvanBlog:%s?secret=%s&issuer=ButvanBlog", user.getUsername(), secret);

        Map<String, String> result = new HashMap<>();
        result.put("secret", secret);
        result.put("otpauthUri", otpauthUri);
        return result;
    }

    @Override
    @Transactional
    public void enableTwoFactor(String username, TwoFactorEnableDTO dto) {
        User user = findActiveUser(username);
        if (!TotpUtil.verifyCode(dto.getSecret(), dto.getCode())) {
            throw new BusinessException(400, "2FA验证码校验失败，请重新扫码验证");
        }
        user.setTwoFactorSecret(dto.getSecret());
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        log.info("用户 [{}] 成功开启双重验证 2FA", username);
    }

    @Override
    @Transactional
    public void disableTwoFactor(String username, TwoFactorDisableDTO dto) {
        User user = findActiveUser(username);
        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new BusinessException(400, "当前未开启双重验证，无需关闭");
        }
        if (!TotpUtil.verifyCode(user.getTwoFactorSecret(), dto.getCode())) {
            throw new BusinessException(400, "2FA验证码校验失败，无法关闭双重验证");
        }
        user.setTwoFactorSecret(null);
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        log.info("用户 [{}] 成功关闭双重验证 2FA", username);
    }

    @Override
    @Transactional
    public void bindGithub(String username, GithubBindDTO dto) {
        User user = findActiveUser(username);
        user.setGithubId(dto.getGithubId());
        user.setGithubUsername(dto.getGithubUsername());
        userRepository.save(user);
        log.info("用户 [{}] 成功绑定 GitHub 账号 [{} ({})]", username, dto.getGithubUsername(), dto.getGithubId());
    }

    @Override
    @Transactional
    public void unbindGithub(String username) {
        User user = findActiveUser(username);
        user.setGithubId(null);
        user.setGithubUsername(null);
        userRepository.save(user);
        log.info("用户 [{}] 成功解绑 GitHub 账号", username);
    }

    /**
     * 上传用户头像
     *
     * @param username 当前登录用户名
     * @param file     上传的头像文件
     * @return 更新后的当前账号资料视图对象
     */
    @Override
    @Transactional
    public CurrentUserVO uploadAvatar(String username, MultipartFile file) {
        // 1. 校验文件是否为空
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "上传的文件不能为空");
        }

        // 2. 校验文件类型（仅允许图片）
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(400, "只支持上传图片文件");
        }

        // 3. 校验文件大小（最大 5MB）
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new BusinessException(400, "图片大小不能超过 5MB");
        }

        // 4. 查找用户
        User user = findActiveUser(username);

        // 5. 生成唯一文件名（UUID + 扩展名）
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String objectName = "avatars/" + UUID.randomUUID().toString() + extension;

        try {
            // 6. 删除旧头像（如果存在）
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                // 从 URL 中提取 objectName
                String oldObjectName = extractObjectNameFromUrl(user.getAvatarUrl());
                if (oldObjectName != null) {
                    fileStorageService.delete(oldObjectName);
                    log.info("已删除用户 [{}] 的旧头像: {}", username, oldObjectName);
                }
            }

            // 7. 上传新头像
            String accessUrl = fileStorageService.upload(file, objectName, "USER_AVATAR", contentType);
            log.info("用户 [{}] 头像上传成功: {}", username, accessUrl);

            // 8. 更新数据库中的头像 URL
            user.setAvatarUrl(accessUrl);
            User savedUser = userRepository.save(user);

            return toCurrentUserVO(savedUser);
        } catch (Exception e) {
            log.error("用户 [{}] 头像上传失败: {}", username, e.getMessage(), e);
            throw new BusinessException(500, "头像上传失败，请稍后重试");
        }
    }

    /**
     * 从 URL 中提取 objectName
     * 例如：http://localhost:9000/blog/avatars/xxx.jpg -> avatars/xxx.jpg
     *      /uploads/avatars/xxx.jpg -> uploads/avatars/xxx.jpg
     */
    private String extractObjectNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        // 如果是完整 URL，提取路径部分
        if (url.startsWith("http://") || url.startsWith("https://")) {
            int idx = url.indexOf("/USER_AVATAR/");
            if (idx >= 0) {
                return url.substring(idx + 1); // 去掉开头的 /，提取出以 USER_AVATAR 开头的路径
            }
            // 兼容可能存在的旧格式（如 bucket 根目录下的 avatars/）
            idx = url.indexOf("/avatars/");
            if (idx >= 0) {
                return url.substring(idx + 1); // 去掉开头的 /
            }
            return null;
        }
        // 如果是相对路径，提取时需排除 "/uploads/" 虚拟目录映射前缀
        if (url.startsWith("/")) {
            if (url.startsWith("/uploads/")) {
                return url.substring(9); // 去掉 "/uploads/"，剩下实际在存储桶/上传目录中的相对路径
            }
            return url.substring(1);
        }
        return url;
    }

    /**
     * 微信扫码登录 Token 交换
     * <p>校验 exchangeCode 有效性，查询对应用户并构建登录视图</p>
     *
     * @param exchangeCode 一次性交换码（WS 下发，60s 过期）
     * @return 登录结果视图对象
     */
    @Override
    public LoginVO wechatExchange(String exchangeCode) {
        if (exchangeCode == null || exchangeCode.isBlank()) {
            throw new BusinessException(400, "交换码不能为空");
        }

        // 1. 从 Redis 校验并获取 userId（一次性使用）
        String key = WeiXinRedisKeyPrefix.REDIS_WECHAT_EXCHANGE_CODE + exchangeCode;
        String userIdStr = redisUtils.get(key);
        if (userIdStr == null) {
            throw new BusinessException(400, "交换码无效或已过期");
        }
        redisUtils.delete(key);

        // 2. 查询用户
        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));

        log.info("微信登录 Token 交换成功, userId={}", userId);
        return toLoginVO(user);
    }

    /**
     * 将 User 实体转换为 LoginVO 视图对象
     *
     * @param user 用户实体
     * @return 登录视图对象
     */
    private LoginVO toLoginVO(User user) {
        return LoginVO.builder()
                .user(LoginVO.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .avatarUrl(user.getAvatarUrl())
                        .githubUsername(user.getGithubUsername())
                        .twoFactorEnabled(user.getTwoFactorEnabled())
                        .role(user.getRole())
                        .build())
                .build();
    }

    @Override
    public void sendEmailCode(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException(400, "邮箱地址不能为空");
        }
        if (!EmailUtils.isValidEmail(email)) {
            throw new BusinessException(400, "邮箱格式不正确");
        }

        // 1. 发送频率限制：60秒一次
        String limitKey = "email_code_limit:" + email;
        if (redisUtils.hasKey(limitKey)) {
            throw new BusinessException(429, "验证码发送频繁，请60秒后再试");
        }

        // 2. 生成 6 位随机验证码
        String code = RandomUtil.randomNumbers(6);
        log.info("向邮箱 {} 生成验证码 {}", email, code);

        // 3. 存储验证码到 Redis，5 分钟有效
        String codeKey = "email_code:" + email;
        redisUtils.set(codeKey, code, 5, TimeUnit.MINUTES);
        // 存储频率限制 key，60秒过期
        redisUtils.set(limitKey, "1", 60, TimeUnit.SECONDS);

        // 4. 获取后台配置模版并发送邮件
        SiteConfigVO subjectConfig = siteConfigService.getConfig("email_verify_subject");
        SiteConfigVO templateConfig = siteConfigService.getConfig("email_verify_template");

        String subject = (subjectConfig != null && subjectConfig.getConfigValue() != null && !subjectConfig.getConfigValue().isBlank())
                ? subjectConfig.getConfigValue()
                : "【可梵的个人博客】登录验证码";
        
        String template = (templateConfig != null && templateConfig.getConfigValue() != null && !templateConfig.getConfigValue().isBlank())
                ? templateConfig.getConfigValue()
                : "您的验证码是：${code}，该验证码 5 分钟内有效。如非本人操作，请忽略此邮件。";

        String content = template.replace("${code}", code);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(content, true); // true 支持 html 格式发送
            mailSender.send(mimeMessage);
            log.info("向邮箱 {} 发送邮件验证码成功", email);
        } catch (Exception e) {
            log.error("发送邮件验证码失败, email={}", email, e);
            throw new BusinessException(500, "邮件验证码发送失败，请检查邮箱配置或稍后再试");
        }
    }

    @Override
    @Transactional
    public LoginVO emailLogin(String email, String code) {
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            throw new BusinessException(400, "邮箱和验证码不能为空");
        }

        // 1. 校验验证码
        String codeKey = "email_code:" + email;
        String cachedCode = redisUtils.get(codeKey);
        if (cachedCode == null) {
            throw new BusinessException(400, "验证码已失效，请重新获取");
        }
        if (!cachedCode.equals(code.trim())) {
            throw new BusinessException(400, "验证码错误");
        }

        // 2. 验证成功，删除验证码
        redisUtils.delete(codeKey);

        // 3. 查找或创建用户
        User user = userRepository.findByEmail(email.trim()).orElse(null);
        if (user == null) {
            // 新增用户自动注册
            user = User.builder()
                    .email(email.trim())
                    .role("USER")
                    .status("ACTIVE")
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            log.info("普通邮箱用户自动注册成功, userId={}, email={}", user.getId(), email);
        } else {
            // 用户已存在，校验状态
            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                log.warn("用户登录失败，账号被停用: {}", email);
                throw new BusinessException(400, "该账号已被停用，请联系管理员");
            }
            user.setLastLoginAt(LocalDateTime.now());
            user = userRepository.save(user);
            log.info("普通邮箱用户登录成功, userId={}, email={}", user.getId(), email);
        }

        // 4. 签发 JWT
        String subject = user.getUsername() != null ? user.getUsername() : user.getEmail();
        String token = jwtUtil.generateToken(user.getId(), subject, user.getRole());

        LoginVO loginVO = toLoginVO(user);
        loginVO.setToken(token); // 设置 Token 属性
        return loginVO;
    }
}
