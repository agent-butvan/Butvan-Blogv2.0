package com.butvan.blog.pojo.vo.home;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 首页场景及关联热区 VO 视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeSceneVO {
    private Long id; // 场景唯一ID
    private String title; // 场景标题
    private String imageUrl; // 背景图 URL
    private Boolean isActive; // 是否启用
    private List<HotspotVO> hotspots; // 该场景下的热区物品列表
}
