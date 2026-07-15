package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 仪表盘 AI 推理及物理存储指标
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiStorageMetricsVO {

    /** AI Token 剩余比例 (百分比，如 84.5) */
    private Double tokenBalance;

    /** AI 模块推理成功率 (百分比，如 99.8) */
    private Double inferenceSuccessRate;

    /** 磁盘/存储剩余空间比例 (百分比，如 76.2) */
    private Double storageFree;
}
