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
}
