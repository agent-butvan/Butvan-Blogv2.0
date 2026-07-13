package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.CurrentUserUpdateDTO;
import com.butvan.blog.pojo.dto.auth.PasswordChangeDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorEnableDTO;
import com.butvan.blog.pojo.dto.auth.TwoFactorDisableDTO;
import com.butvan.blog.pojo.dto.auth.GithubBindDTO;
import com.butvan.blog.pojo.vo.auth.CurrentUserVO;
import com.butvan.blog.pojo.vo.auth.LoginVO;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

/**
 * 账号认证与权限业务逻辑层接口
 */
public interface AuthService {

    /**
     * 管理后台账号注册核心业务
     *
     * @param registerDTO 注册表单传输对象
     */
    void register(RegisterDTO registerDTO);

    /**
     * 管理后台账号登录核心业务
     *
     * @param loginDTO 登录表单传输对象
     * @return 登录结果视图对象
     */
    LoginVO login(LoginDTO loginDTO);

    /**
     * 查询当前登录账号的个人中心资料
     *
     * @param username 当前登录用户名
     * @return 当前账号资料视图对象
     */
    CurrentUserVO getCurrentUser(String username);

    /**
     * 更新当前登录账号的基础资料
     *
     * @param username 当前登录用户名
     * @param dto      基础资料更新请求
     * @return 更新后的当前账号资料视图对象
     */
    CurrentUserVO updateCurrentUser(String username, CurrentUserUpdateDTO dto);

    /**
     * 修改当前登录账号密码
     *
     * @param username 当前登录用户名
     * @param dto      密码修改请求
     */
    void changePassword(String username, PasswordChangeDTO dto);

    /**
     * 初始化双重认证 (2FA) 配置
     *
     * @param username 当前登录用户名
     * @return 包含 secret 密钥与 otpauthUri 字符串的键值对 Map
     */
    Map<String, String> initTwoFactor(String username);

    /**
     * 验证并启用双重认证 (2FA)
     *
     * @param username 当前登录用户名
     * @param dto      2FA 启用参数表单
     */
    void enableTwoFactor(String username, TwoFactorEnableDTO dto);

    /**
     * 校验并关闭双重认证 (2FA)
     *
     * @param username 当前登录用户名
     * @param dto      2FA 关闭参数表单
     */
    void disableTwoFactor(String username, TwoFactorDisableDTO dto);

    /**
     * 绑定 GitHub 账号
     *
     * @param username 当前登录用户名
     * @param dto      GitHub 绑定参数表单
     */
    void bindGithub(String username, GithubBindDTO dto);

    /**
     * 解绑 GitHub 账号
     *
     * @param username 当前登录用户名
     */
    void unbindGithub(String username);

    /**
     * 上传用户头像
     *
     * @param username 当前登录用户名
     * @param file     上传的头像文件
     * @return 更新后的当前账号资料视图对象
     */
    CurrentUserVO uploadAvatar(String username, MultipartFile file);

    /**
     * 微信扫码登录 Token 交换
     * <p>校验 exchangeCode 有效性，查询对应用户并构建登录视图</p>
     *
     * @param exchangeCode 一次性交换码（WS 下发，60s 过期）
     * @return 登录结果视图对象
     */
    LoginVO wechatExchange(String exchangeCode);
}
