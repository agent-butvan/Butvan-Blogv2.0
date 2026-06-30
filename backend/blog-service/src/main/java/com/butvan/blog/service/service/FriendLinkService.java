package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.friend.FriendLinkApplyDTO;
import com.butvan.blog.pojo.dto.friend.FriendLinkSaveDTO;
import com.butvan.blog.pojo.entity.FriendLink;
import com.butvan.blog.pojo.vo.friend.FriendLinkVO;

import java.util.List;

/**
 * 友链 Service 接口
 */
public interface FriendLinkService {

    /**
     * 获取已批准的友链列表
     *
     * @return 友链列表
     */
    List<FriendLinkVO> getApprovedFriendLinks();

    /**
     * 根据分类获取已批准的友链列表
     *
     * @param category 分类
     * @return 友链列表
     */
    List<FriendLinkVO> getApprovedFriendLinksByCategory(String category);

    /**
     * 申请友链
     *
     * @param dto 申请信息
     */
    void applyFriendLink(FriendLinkApplyDTO dto);

    /**
     * 获取所有友链（后台）
     *
     * @return 友链列表
     */
    List<FriendLink> getAllFriendLinks();

    /**
     * 获取友链详情
     *
     * @param id 友链ID
     * @return 友链实体
     */
    FriendLink getFriendLinkById(Long id);

    /**
     * 创建友链
     *
     * @param dto 友链信息
     * @return 创建的友链
     */
    FriendLink createFriendLink(FriendLinkSaveDTO dto);

    /**
     * 更新友链
     *
     * @param id  友链ID
     * @param dto 友链信息
     * @return 更新后的友链
     */
    FriendLink updateFriendLink(Long id, FriendLinkSaveDTO dto);

    /**
     * 更新友链状态
     *
     * @param id     友链ID
     * @param status 新状态
     */
    void updateFriendLinkStatus(Long id, String status);

    /**
     * 删除友链
     *
     * @param id 友链ID
     */
    void deleteFriendLink(Long id);

    /**
     * 更新排序
     *
     * @param id        友链ID
     * @param sortOrder 新排序号
     */
    void updateSortOrder(Long id, Integer sortOrder);
}