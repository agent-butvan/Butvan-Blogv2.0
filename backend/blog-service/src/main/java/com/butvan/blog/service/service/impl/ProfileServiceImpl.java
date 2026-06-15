package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.profile.ProfileVO;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.ProfileService;
import org.springframework.stereotype.Service;

/**
 * 公开用户资料服务实现
 */
@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    public ProfileServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public ProfileVO getPublicProfile(String username) {
        return userRepository.findByUsername(username)
                .map(this::toProfileVO)
                .orElse(null);
    }

    /**
     * User 实体 → 公开资料 VO（脱敏转换）
     */
    private ProfileVO toProfileVO(User user) {
        return ProfileVO.builder()
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .socialLinks(user.getSocialLinks())
                .build();
    }

    @Override
    public void updateProfile(String username, com.butvan.blog.pojo.dto.profile.ProfileUpdateDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在：" + username));
        user.setNickname(dto.getNickname());
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setBio(dto.getBio());
        user.setSocialLinks(dto.getSocialLinks());
        userRepository.save(user);
    }
}
