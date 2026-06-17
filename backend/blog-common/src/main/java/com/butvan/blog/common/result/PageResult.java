package com.butvan.blog.common.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.List;

/**
 * 分页数据响应体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResult implements Serializable {

    private Long total;     // 总记录数
    private Integer page;   // 当前页码
    private Integer size;   // 每页大小
    private List<?> records; // 数据列表

    /**
     * 获取数据列表（向前兼容 Spring Data Page 序列化格式中的 content 字段）
     *
     * @return 数据列表
     */
    public List<?> getContent() {
        return this.records;
    }

    /**
     * 获取总元素个数（向前兼容 Spring Data Page 中的 totalElements 字段）
     *
     * @return 总元素个数
     */
    public Long getTotalElements() {
        return this.total;
    }

    /**
     * 获取总页数（兼容 Spring Data Page 中的 totalPages 字段）
     *
     * @return 总页数
     */
    public Integer getTotalPages() {
        if (this.total == null || this.size == null || this.size <= 0) {
            return 1;
        }
        return (int) Math.ceil((double) this.total / this.size);
    }
}
