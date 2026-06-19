package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.CurrentUserUpdateDTO;
import com.butvan.blog.pojo.dto.auth.PasswordChangeDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.pojo.vo.auth.CurrentUserVO;
import com.butvan.blog.pojo.vo.auth.LoginVO;

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
}
