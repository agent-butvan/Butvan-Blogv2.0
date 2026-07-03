package com.butvan.blog.common.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Redis 通用操作工具类（基于 StringRedisTemplate）
 * <p>
 * 封装常用的 Redis 操作方法，所有键值均以 String 形式存储。
 * 复杂对象通过 Jackson 手动序列化为 JSON 字符串后存取。
 * 涵盖字符串、哈希、列表、集合、计数器、过期时间管理以及简易分布式锁等功能。
 * </p>
 *
 * <h3>使用示例</h3>
 * <pre>{@code
 * // 缓存字符串
 * redisUtils.set("user:token", tokenValue, 30, TimeUnit.MINUTES);
 *
 * // 缓存对象（手动 JSON 序列化）
 * redisUtils.setObject("article:1", article, 1, TimeUnit.HOURS);
 *
 * // 获取对象
 * Article article = redisUtils.getObject("article:1", Article.class);
 *
 * // 分布式锁
 * boolean locked = redisUtils.tryLock("lock:order:1", uuid, 10, TimeUnit.SECONDS);
 * }</pre>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisUtils {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    // ==================== 通用 Key 操作 ====================

    /**
     * 设置指定 key 的过期时间
     *
     * @param key      缓存键
     * @param timeout  过期时长
     * @param timeUnit 时间单位
     * @return true 设置成功，false key 不存在
     */
    public boolean expire(String key, long timeout, TimeUnit timeUnit) {
        if (timeout <= 0) {
            log.warn("过期时间必须为正数，当前值: {}", timeout);
            return false;
        }
        try {
            Boolean result = stringRedisTemplate.expire(key, timeout, timeUnit);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            log.error("设置 key [{}] 过期时间失败", key, e);
            return false;
        }
    }

    /**
     * 获取指定 key 的剩余过期时间
     *
     * @param key      缓存键
     * @param timeUnit 时间单位
     * @return 剩余过期时间，-1 表示永久有效，-2 表示 key 不存在
     */
    public long getExpire(String key, TimeUnit timeUnit) {
        Long expire = stringRedisTemplate.getExpire(key, timeUnit);
        return expire != null ? expire : -2;
    }

    /**
     * 判断 key 是否存在
     *
     * @param key 缓存键
     * @return true 存在，false 不存在
     */
    public boolean hasKey(String key) {
        try {
            return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("判断 key [{}] 是否存在异常", key, e);
            return false;
        }
    }

    /**
     * 删除一个或多个 key
     *
     * @param keys 缓存键集合
     * @return 成功删除的 key 数量
     */
    public long delete(Collection<String> keys) {
        try {
            Long deleted = stringRedisTemplate.delete(keys);
            return deleted != null ? deleted : 0;
        } catch (Exception e) {
            log.error("批量删除 key 异常", e);
            return 0;
        }
    }

    /**
     * 删除单个 key
     *
     * @param key 缓存键
     * @return true 删除成功，false key 不存在
     */
    public boolean delete(String key) {
        try {
            return Boolean.TRUE.equals(stringRedisTemplate.delete(key));
        } catch (Exception e) {
            log.error("删除 key [{}] 异常", key, e);
            return false;
        }
    }

    /**
     * 模糊匹配删除（如 "prefix:*"）
     *
     * @param pattern 匹配模式，例如 "cache:article:*"
     * @return 删除的 key 数量
     */
    public long deleteByPattern(String pattern) {
        Set<String> keys = stringRedisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            return delete(keys);
        }
        return 0;
    }

    // ==================== 字符串（String）操作 ====================

    /**
     * 存入字符串值（永不过期）
     *
     * @param key   缓存键
     * @param value 缓存值
     */
    public void set(String key, String value) {
        try {
            stringRedisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.error("存入 key [{}] 失败", key, e);
        }
    }

    /**
     * 存入字符串值并设置过期时间
     *
     * @param key      缓存键
     * @param value    缓存值
     * @param timeout  过期时长
     * @param timeUnit 时间单位
     */
    public void set(String key, String value, long timeout, TimeUnit timeUnit) {
        try {
            stringRedisTemplate.opsForValue().set(key, value, timeout, timeUnit);
        } catch (Exception e) {
            log.error("存入 key [{}]（带过期时间）失败", key, e);
        }
    }

    /**
     * 将对象序列化为 JSON 字符串后存入 Redis
     *
     * @param key      缓存键
     * @param value    Java 对象（会被序列化为 JSON）
     * @param timeout  过期时长
     * @param timeUnit 时间单位
     */
    public void setObject(String key, Object value, long timeout, TimeUnit timeUnit) {
        try {
            String json = objectMapper.writeValueAsString(value);
            stringRedisTemplate.opsForValue().set(key, json, timeout, timeUnit);
        } catch (JsonProcessingException e) {
            log.error("序列化对象存入 key [{}] 失败", key, e);
        }
    }

    /**
     * 将对象序列化为 JSON 字符串后存入 Redis（永不过期）
     *
     * @param key   缓存键
     * @param value Java 对象
     */
    public void setObject(String key, Object value) {
        try {
            String json = objectMapper.writeValueAsString(value);
            stringRedisTemplate.opsForValue().set(key, json);
        } catch (JsonProcessingException e) {
            log.error("序列化对象存入 key [{}] 失败", key, e);
        }
    }

    /**
     * 仅当 key 不存在时设置值（SET NX），常用于分布式锁
     *
     * @param key   缓存键
     * @param value 缓存值
     * @return true 设置成功，false key 已存在
     */
    public boolean setIfAbsent(String key, String value) {
        try {
            return Boolean.TRUE.equals(stringRedisTemplate.opsForValue().setIfAbsent(key, value));
        } catch (Exception e) {
            log.error("SETNX key [{}] 异常", key, e);
            return false;
        }
    }

    /**
     * 仅当 key 不存在时设置值并指定过期时间
     *
     * @param key      缓存键
     * @param value    缓存值
     * @param timeout  过期时长
     * @param timeUnit 时间单位
     * @return true 设置成功，false key 已存在
     */
    public boolean setIfAbsent(String key, String value, long timeout, TimeUnit timeUnit) {
        try {
            return Boolean.TRUE.equals(
                    stringRedisTemplate.opsForValue().setIfAbsent(key, value, timeout, timeUnit));
        } catch (Exception e) {
            log.error("SETNX key [{}]（带过期时间）异常", key, e);
            return false;
        }
    }

    /**
     * 获取字符串缓存值
     *
     * @param key 缓存键
     * @return 缓存值，不存在返回 null
     */
    public String get(String key) {
        try {
            return stringRedisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("获取 key [{}] 异常", key, e);
            return null;
        }
    }

    /**
     * 获取缓存中的 JSON 字符串并反序列化为目标类型
     *
     * @param key   缓存键
     * @param clazz 目标类型
     * @param <T>   泛型
     * @return 目标类型对象，不存在或反序列化失败返回 null
     */
    public <T> T getObject(String key, Class<T> clazz) {
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null) {
                return null;
            }
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("反序列化 key [{}] 为 [{}] 失败", key, clazz.getSimpleName(), e);
            return null;
        }
    }

    // ==================== 计数器（自增/自减）操作 ====================

    /**
     * 自增（步长为 1）
     *
     * @param key 缓存键
     * @return 自增后的值
     */
    public long incr(String key) {
        return incrBy(key, 1);
    }

    /**
     * 按指定步长自增
     *
     * @param key   缓存键
     * @param delta 增量（可为负数以实现递减）
     * @return 自增后的值
     */
    public long incrBy(String key, long delta) {
        try {
            Long result = stringRedisTemplate.opsForValue().increment(key, delta);
            return result != null ? result : 0;
        } catch (Exception e) {
            log.error("自增 key [{}] 异常", key, e);
            return 0;
        }
    }

    /**
     * 自减（步长为 1）
     *
     * @param key 缓存键
     * @return 自减后的值
     */
    public long decr(String key) {
        return incrBy(key, -1);
    }

    // ==================== 哈希（Hash）操作 ====================

    /**
     * 向 Hash 中存入单个字符串字段
     *
     * @param key   缓存键
     * @param field 字段名
     * @param value 字段值
     */
    public void hSet(String key, String field, String value) {
        try {
            stringRedisTemplate.opsForHash().put(key, field, value);
        } catch (Exception e) {
            log.error("Hash key [{}] 设置字段 [{}] 失败", key, field, e);
        }
    }

    /**
     * 向 Hash 中存入单个字段（值为对象，自动序列化为 JSON）
     *
     * @param key   缓存键
     * @param field 字段名
     * @param value 字段值（Java 对象）
     */
    public void hSetObject(String key, String field, Object value) {
        try {
            String json = objectMapper.writeValueAsString(value);
            stringRedisTemplate.opsForHash().put(key, field, json);
        } catch (JsonProcessingException e) {
            log.error("Hash key [{}] 序列化字段 [{}] 失败", key, field, e);
        }
    }

    /**
     * 向 Hash 中批量存入多个字符串字段
     *
     * @param key 缓存键
     * @param map 字段键值对（String → String）
     */
    public void hSetAll(String key, Map<String, String> map) {
        try {
            stringRedisTemplate.opsForHash().putAll(key, map);
        } catch (Exception e) {
            log.error("Hash key [{}] 批量设置字段失败", key, e);
        }
    }

    /**
     * 获取 Hash 中指定字段的字符串值
     *
     * @param key   缓存键
     * @param field 字段名
     * @return 字段值，不存在返回 null
     */
    public String hGet(String key, String field) {
        try {
            Object value = stringRedisTemplate.opsForHash().get(key, field);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            log.error("Hash key [{}] 获取字段 [{}] 失败", key, field, e);
            return null;
        }
    }

    /**
     * 获取 Hash 中指定字段的对象值（自动反序列化 JSON）
     *
     * @param key   缓存键
     * @param field 字段名
     * @param clazz 目标类型
     * @param <T>   泛型
     * @return 目标类型对象，不存在返回 null
     */
    public <T> T hGetObject(String key, String field, Class<T> clazz) {
        try {
            Object value = stringRedisTemplate.opsForHash().get(key, field);
            if (value == null) {
                return null;
            }
            return objectMapper.readValue(value.toString(), clazz);
        } catch (JsonProcessingException e) {
            log.error("Hash key [{}] 反序列化字段 [{}] 为 [{}] 失败", key, field, clazz.getSimpleName(), e);
            return null;
        }
    }

    /**
     * 获取 Hash 中所有字段和值
     *
     * @param key 缓存键
     * @return Map 形式的所有字段，key 不存在返回空 Map
     */
    public Map<Object, Object> hGetAll(String key) {
        try {
            return stringRedisTemplate.opsForHash().entries(key);
        } catch (Exception e) {
            log.error("Hash key [{}] 获取全部字段失败", key, e);
            return Map.of();
        }
    }

    /**
     * 删除 Hash 中的一个或多个字段
     *
     * @param key    缓存键
     * @param fields 要删除的字段名
     * @return 成功删除的字段数
     */
    public long hDelete(String key, Object... fields) {
        try {
            Long deleted = stringRedisTemplate.opsForHash().delete(key, fields);
            return deleted != null ? deleted : 0;
        } catch (Exception e) {
            log.error("Hash key [{}] 删除字段失败", key, e);
            return 0;
        }
    }

    /**
     * 判断 Hash 中是否存在指定字段
     *
     * @param key   缓存键
     * @param field 字段名
     * @return true 存在，false 不存在
     */
    public boolean hHasKey(String key, String field) {
        try {
            return stringRedisTemplate.opsForHash().hasKey(key, field);
        } catch (Exception e) {
            log.error("Hash key [{}] 判断字段 [{}] 是否存在异常", key, field, e);
            return false;
        }
    }

    /**
     * 获取 Hash 中所有字段名
     *
     * @param key 缓存键
     * @return 字段名集合
     */
    public Set<Object> hKeys(String key) {
        try {
            return stringRedisTemplate.opsForHash().keys(key);
        } catch (Exception e) {
            log.error("Hash key [{}] 获取所有字段名失败", key, e);
            return Set.of();
        }
    }

    /**
     * 获取 Hash 中字段数量
     *
     * @param key 缓存键
     * @return 字段数量
     */
    public long hSize(String key) {
        try {
            Long size = stringRedisTemplate.opsForHash().size(key);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("Hash key [{}] 获取字段数量失败", key, e);
            return 0;
        }
    }

    // ==================== 列表（List）操作 ====================

    /**
     * 从列表左侧（头部）推入一个元素
     *
     * @param key   缓存键
     * @param value 字符串值
     * @return 推入后列表的长度
     */
    public long lPush(String key, String value) {
        try {
            Long size = stringRedisTemplate.opsForList().leftPush(key, value);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("List key [{}] 左推入失败", key, e);
            return 0;
        }
    }

    /**
     * 从列表右侧（尾部）推入一个元素
     *
     * @param key   缓存键
     * @param value 字符串值
     * @return 推入后列表的长度
     */
    public long rPush(String key, String value) {
        try {
            Long size = stringRedisTemplate.opsForList().rightPush(key, value);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("List key [{}] 右推入失败", key, e);
            return 0;
        }
    }

    /**
     * 获取列表指定范围内的元素
     *
     * @param key   缓存键
     * @param start 起始索引（包含，0 表示第一个）
     * @param end   结束索引（包含，-1 表示最后一个）
     * @return 字符串列表
     */
    public List<String> lRange(String key, long start, long end) {
        try {
            return stringRedisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            log.error("List key [{}] 获取范围 [{} - {}] 失败", key, start, end, e);
            return List.of();
        }
    }

    /**
     * 获取列表长度
     *
     * @param key 缓存键
     * @return 列表长度
     */
    public long lSize(String key) {
        try {
            Long size = stringRedisTemplate.opsForList().size(key);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("List key [{}] 获取长度失败", key, e);
            return 0;
        }
    }

    /**
     * 从列表左侧（头部）弹出一个元素
     *
     * @param key 缓存键
     * @return 弹出的元素，列表为空返回 null
     */
    public String lPop(String key) {
        try {
            return stringRedisTemplate.opsForList().leftPop(key);
        } catch (Exception e) {
            log.error("List key [{}] 左弹出失败", key, e);
            return null;
        }
    }

    /**
     * 从列表右侧（尾部）弹出一个元素
     *
     * @param key 缓存键
     * @return 弹出的元素，列表为空返回 null
     */
    public String rPop(String key) {
        try {
            return stringRedisTemplate.opsForList().rightPop(key);
        } catch (Exception e) {
            log.error("List key [{}] 右弹出失败", key, e);
            return null;
        }
    }

    // ==================== 集合（Set）操作 ====================

    /**
     * 向集合中添加一个或多个元素
     *
     * @param key    缓存键
     * @param values 字符串值
     * @return 成功添加的元素数量
     */
    public long sAdd(String key, String... values) {
        try {
            Long added = stringRedisTemplate.opsForSet().add(key, values);
            return added != null ? added : 0;
        } catch (Exception e) {
            log.error("Set key [{}] 添加元素失败", key, e);
            return 0;
        }
    }

    /**
     * 获取集合中的所有元素
     *
     * @param key 缓存键
     * @return 字符串集合
     */
    public Set<String> sMembers(String key) {
        try {
            return stringRedisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            log.error("Set key [{}] 获取所有成员失败", key, e);
            return Set.of();
        }
    }

    /**
     * 判断元素是否为集合成员
     *
     * @param key   缓存键
     * @param value 字符串值
     * @return true 是成员，false 不是
     */
    public boolean sIsMember(String key, String value) {
        try {
            return Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(key, value));
        } catch (Exception e) {
            log.error("Set key [{}] 判断成员 [{}] 是否存在异常", key, value, e);
            return false;
        }
    }

    /**
     * 从集合中移除一个或多个元素
     *
     * @param key    缓存键
     * @param values 要移除的字符串值
     * @return 成功移除的元素数量
     */
    public long sRemove(String key, String... values) {
        try {
            Long removed = stringRedisTemplate.opsForSet().remove(key, (Object[]) values);
            return removed != null ? removed : 0;
        } catch (Exception e) {
            log.error("Set key [{}] 移除元素失败", key, e);
            return 0;
        }
    }

    /**
     * 获取集合大小
     *
     * @param key 缓存键
     * @return 集合元素数量
     */
    public long sSize(String key) {
        try {
            Long size = stringRedisTemplate.opsForSet().size(key);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("Set key [{}] 获取大小失败", key, e);
            return 0;
        }
    }

    // ==================== 简易分布式锁 ====================

    /**
     * 尝试获取分布式锁（基于 SETNX）
     *
     * @param lockKey   锁的 key
     * @param requestId 请求标识（如 UUID），用于释放锁时校验身份
     * @param timeout   锁的自动过期时间
     * @param timeUnit  时间单位
     * @return true 获取锁成功，false 获取锁失败
     */
    public boolean tryLock(String lockKey, String requestId, long timeout, TimeUnit timeUnit) {
        try {
            Boolean locked = stringRedisTemplate.opsForValue()
                    .setIfAbsent(lockKey, requestId, timeout, timeUnit);
            if (Boolean.TRUE.equals(locked)) {
                log.debug("获取分布式锁成功，lockKey: {}, requestId: {}", lockKey, requestId);
            }
            return Boolean.TRUE.equals(locked);
        } catch (Exception e) {
            log.error("获取分布式锁 [{}] 异常", lockKey, e);
            return false;
        }
    }

    /**
     * 释放分布式锁（通过 Lua 脚本保证原子性）
     *
     * @param lockKey   锁的 key
     * @param requestId 请求标识，只有与锁中存储的值匹配时才会释放
     * @return true 释放成功，false 释放失败（可能锁已过期或被其他线程持有）
     */
    public boolean unlock(String lockKey, String requestId) {
        try {
            // Lua 脚本：原子性地校验 requestId 并删除 key
            String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) " +
                    "else return 0 end";
            Long result = stringRedisTemplate.execute(
                    (org.springframework.data.redis.core.RedisCallback<Long>) connection -> {
                        Object nativeConnection = connection.getNativeConnection();
                        // 兼容 Lettuce（当前项目使用的 Redis 客户端）
                        if (nativeConnection instanceof io.lettuce.core.api.sync.RedisCommands) {
                            @SuppressWarnings("unchecked")
                            io.lettuce.core.api.sync.RedisCommands<String, String> commands =
                                    (io.lettuce.core.api.sync.RedisCommands<String, String>) nativeConnection;
                            return commands.eval(script,
                                    io.lettuce.core.ScriptOutputType.INTEGER,
                                    new String[]{lockKey}, requestId);
                        }
                        log.warn("不支持的 Redis 客户端类型: {}",
                                nativeConnection != null ? nativeConnection.getClass().getName() : "null");
                        return 0L;
                    }, true);
            boolean success = result != null && result > 0;
            if (success) {
                log.debug("释放分布式锁成功，lockKey: {}, requestId: {}", lockKey, requestId);
            }
            return success;
        } catch (Exception e) {
            log.error("释放分布式锁 [{}] 异常", lockKey, e);
            return false;
        }
    }
}
