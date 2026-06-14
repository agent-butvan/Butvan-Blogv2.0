package com.butvan.blog.pojo.dto.scene;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 首页场景保存/更新请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SceneSaveDTO {
    private Long id; // 场景 ID (更新时必传)
    private String title; // 场景标题，如“我的书房”
    private String imageUrl; // 背景大图 URL
    private Boolean isActive; // 是否启用
}
