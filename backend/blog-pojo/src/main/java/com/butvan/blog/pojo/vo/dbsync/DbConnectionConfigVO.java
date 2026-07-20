package com.butvan.blog.pojo.vo.dbsync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 数据库连接配置 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DbConnectionConfigVO {
    private Integer id;
    private String connName;
    private String jdbcUrl;
    private String username;
    private String password;
}
