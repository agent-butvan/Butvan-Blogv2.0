package com.butvan.blog.common.id;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

/**
 * 雪花算法 ID 生成器（Hibernate IdentifierGenerator 实现）
 * <p>
 * 基于 Hutool Snowflake 生成全局唯一的 Long 型 ID，替代数据库自增序列。
 * 适用于分布式场景，保证多节点下 ID 不冲突。
 * </p>
 *
 * <h3>使用方式</h3>
 * <pre>{@code
 * @Entity
 * public class User {
 *     @Id
 *     @GeneratedValue(generator = "snowflake")
 *     @GenericGenerator(name = "snowflake", type = SnowflakeIdGenerator.class)
 *     private Long id;
 * }
 * }</pre>
 */
public class SnowflakeIdGenerator implements IdentifierGenerator {

    /**
     * Hutool 雪花算法实例（使用默认 workerId=0, datacenterId=0）
     */
    private static final Snowflake SNOWFLAKE = IdUtil.getSnowflake();

    /**
     * 生成雪花算法 ID
     *
     * @param session 当前 Hibernate 会话
     * @param object  待持久化的实体对象
     * @return 全局唯一的 Long 型 ID
     */
    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        return SNOWFLAKE.nextId();
    }
}
