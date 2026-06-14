package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.auth.LoginDTO;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
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
}
