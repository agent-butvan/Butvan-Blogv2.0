package com.butvan.blog.pojo.dto.scene;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

/**
 * 首页热区/物品保存或更新请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotspotSaveDTO {
    private Long id; // 物品 ID (更新时必传)
    private Long sceneId; // 所属场景 ID (必传)
    private String itemName; // 物品名称，如“电脑工作台”
    private String itemImageUrl; // v0.2: 透明抠图 PNG 文件地址 (可选)
    private BigDecimal xPercent; // v0.2: 左边界 X 百分比 (0.00 ~ 100.00)
    private BigDecimal yPercent; // v0.2: 上边界 Y 百分比 (0.00 ~ 100.00)
    private BigDecimal widthPercent; // v0.2: 百分比宽度
    private BigDecimal heightPercent; // v0.2: 百分比高度 (可选)
    private Map<String, Object> geometryExt; // 扩展几何属性 JSON
    private String hoverTips; // 悬浮提示文字
    private String redirectType; // 跳转类型: INTERNAL | EXTERNAL | ARTICLE | CATEGORY (必传)
    private String redirectPath; // 跳转 URL/相对路由路径
    private Long redirectTargetId; // 跳转目标对应的实体 ID (如文章 ID)
    private BigDecimal zoomScale; // 点击聚焦时的缩放比 (默认 3.00)
    private Integer sortOrder; // 排序号 (对应 z-index)
    private Boolean isVisible; // 是否可见
}
