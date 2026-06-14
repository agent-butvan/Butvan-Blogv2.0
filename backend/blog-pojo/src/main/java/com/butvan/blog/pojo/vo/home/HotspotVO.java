package com.butvan.blog.pojo.vo.home;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

/**
 * 首页热区/物品 VO 视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotspotVO {
    private Long id; // 物品唯一ID
    private String itemName; // 物品名称
    private String itemImageUrl; // 透明抠图 PNG 文件地址
    private BigDecimal xPercent; // 左边界 X 坐标百分比
    private BigDecimal yPercent; // 上边界 Y 坐标百分比
    private BigDecimal widthPercent; // 物品百分比宽度
    private BigDecimal heightPercent; // 物品百分比高度
    private Map<String, Object> geometryExt; // 扩展几何属性
    private String hoverTips; // 悬浮提示文案
    private String redirectType; // 跳转类型: INTERNAL | EXTERNAL | ARTICLE | CATEGORY
    private String redirectPath; // 跳转 URL/路由路径
    private Long redirectTargetId; // 跳转目标 ID (如文章 ID)
    private BigDecimal zoomScale; // 镜头缩放比
    private Integer sortOrder; // 排序号（z-index层级）
    private Boolean isVisible; // 是否在前台可见
}
