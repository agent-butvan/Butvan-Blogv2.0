package com.butvan.blog.service.service;

import com.butvan.blog.pojo.vo.profile.ProfileVO;

/**
 * 公开用户资料服务接口
 */
public interface ProfileService {

    /**
     * 根据用户名获取公开的个人资料
     *
     * @param username 登录用户名
     * @return 公开资料 VO（用户不存在时返回 null）
     */
    ProfileVO getPublicProfile(String username);

    /**
     * 更新用户的公开资料
     *
     * @param username 登录用户名
     * @param dto      更新数据传输对象
     */
    void updateProfile(String username, com.butvan.blog.pojo.dto.profile.ProfileUpdateDTO dto);
}
