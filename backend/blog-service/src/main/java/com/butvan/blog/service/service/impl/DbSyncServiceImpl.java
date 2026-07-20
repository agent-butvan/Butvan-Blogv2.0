package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.utils.AesUtils;
import com.butvan.blog.pojo.entity.DbConnectionConfig;
import com.butvan.blog.pojo.entity.DbSyncLog;
import com.butvan.blog.pojo.vo.dbsync.DataDiffVO;
import com.butvan.blog.pojo.vo.dbsync.DbConnectionConfigVO;
import com.butvan.blog.pojo.vo.dbsync.SchemaDiffVO;
import com.butvan.blog.service.config.DbConnectionManager;
import com.butvan.blog.service.repository.DbConnectionConfigRepository;
import com.butvan.blog.service.repository.DbSyncLogRepository;
import com.butvan.blog.service.service.DbSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据库多维比对与数据同步服务层实现类
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DbSyncServiceImpl implements DbSyncService {

    private final DbConnectionConfigRepository configRepository;
    private final DbSyncLogRepository logRepository;
    private final DbConnectionManager connectionManager;

    @Override
    public boolean testConnection(String jdbcUrl, String username, String password) {
        return connectionManager.testConnection(jdbcUrl, username, password);
    }

    @Override
    @Transactional
    public DbConnectionConfigVO saveConfig(DbConnectionConfigVO configVO) {
        log.info("保存数据库连接配置，名称: {}", configVO.getConnName());
        
        DbConnectionConfig config = configRepository.findByConnName(configVO.getConnName())
                .orElse(new DbConnectionConfig());

        config.setConnName(configVO.getConnName());
        config.setJdbcUrl(configVO.getJdbcUrl());
        config.setUsername(configVO.getUsername());
        
        // 密码加密存储
        config.setPassword(AesUtils.encrypt(configVO.getPassword()));

        DbConnectionConfig saved = configRepository.save(config);
        
        // 当配置发生变化时，立即清理连接池缓存以保证下次使用最新配置
        connectionManager.removeDataSource(configVO.getConnName());

        return DbConnectionConfigVO.builder()
                .id(saved.getId())
                .connName(saved.getConnName())
                .jdbcUrl(saved.getJdbcUrl())
                .username(saved.getUsername())
                .password("") // 密码打码
                .build();
    }

    @Override
    public DbConnectionConfigVO getConfig(String connName) {
        return configRepository.findByConnName(connName)
                .map(config -> DbConnectionConfigVO.builder()
                        .id(config.getId())
                        .connName(config.getConnName())
                        .jdbcUrl(config.getJdbcUrl())
                        .username(config.getUsername())
                        .password("") // 密码隐藏
                        .build())
                .orElse(null);
    }

    @Override
    public List<SchemaDiffVO> compareSchema() {
        log.info("开始执行本地开发库与线上生产库的 DDL 表结构比对");
        
        DbConnectionConfig localConfig = configRepository.findByConnName("local_dev")
                .orElseThrow(() -> new IllegalArgumentException("未配置本地开发库 [local_dev] 连接信息"));
        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate localTemplate = new JdbcTemplate(connectionManager.getDataSource(localConfig));
        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 1. 获取两边所有的表名
        List<String> localTables = queryTables(localTemplate);
        List<String> onlineTables = queryTables(onlineTemplate);

        List<SchemaDiffVO> diffList = new ArrayList<>();

        // 2. 找出线上缺少的表
        List<String> missingTables = localTables.stream()
                .filter(t -> !onlineTables.contains(t))
                .collect(Collectors.toList());

        for (String table : missingTables) {
            // 动态构建建表 SQL
            List<Map<String, Object>> columns = queryColumnsInfo(localTemplate, table);
            String sqlCreate = buildCreateTableSql(table, columns);

            List<SchemaDiffVO.FieldDiff> fieldDiffs = columns.stream()
                    .map(col -> SchemaDiffVO.FieldDiff.builder()
                            .columnName((String) col.get("column_name"))
                            .diffType("MISSING_IN_ONLINE")
                            .localValue(col.get("data_type") + (col.get("character_maximum_length") != null ? "(" + col.get("character_maximum_length") + ")" : ""))
                            .onlineValue("null")
                            .build())
                    .collect(Collectors.toList());

            diffList.add(SchemaDiffVO.builder()
                    .tableName(table)
                    .diffType("MISSING_IN_ONLINE")
                    .description("线上生产库缺失该表，建议进行同步建表")
                    .fieldDiffs(fieldDiffs)
                    .sqlSync(sqlCreate)
                    .build());
        }

        // 3. 对比共存表的列属性差异
        List<String> commonTables = localTables.stream()
                .filter(onlineTables::contains)
                // 排除一些不对比的系统表或日志表
                .filter(t -> !t.equals("flyway_schema_history") && !t.equals("db_sync_log") && !t.equals("db_connection_config"))
                .collect(Collectors.toList());

        for (String table : commonTables) {
            List<Map<String, Object>> localCols = queryColumnsInfo(localTemplate, table);
            List<Map<String, Object>> onlineCols = queryColumnsInfo(onlineTemplate, table);

            Map<String, Map<String, Object>> onlineColsMap = onlineCols.stream()
                    .collect(Collectors.toMap(c -> (String) c.get("column_name"), c -> c));

            List<SchemaDiffVO.FieldDiff> fieldDiffs = new ArrayList<>();
            StringBuilder sqlSyncBuilder = new StringBuilder();

            for (Map<String, Object> localCol : localCols) {
                String colName = (String) localCol.get("column_name");
                String localType = (String) localCol.get("data_type");
                Object localLen = localCol.get("character_maximum_length");
                String localTypeDesc = localType + (localLen != null ? "(" + localLen + ")" : "");
                String localNullable = (String) localCol.get("is_nullable");

                Map<String, Object> onlineCol = onlineColsMap.get(colName);

                if (onlineCol == null) {
                    // 线上缺少该列
                    fieldDiffs.add(SchemaDiffVO.FieldDiff.builder()
                            .columnName(colName)
                            .diffType("MISSING_IN_ONLINE")
                            .localValue(localTypeDesc)
                            .onlineValue("null")
                            .build());

                    sqlSyncBuilder.append(String.format("ALTER TABLE \"%s\" ADD COLUMN \"%s\" %s %s;", 
                            table, colName, localTypeDesc, "YES".equalsIgnoreCase(localNullable) ? "" : "NOT NULL"));
                } else {
                    // 对比类型
                    String onlineType = (String) onlineCol.get("data_type");
                    Object onlineLen = onlineCol.get("character_maximum_length");
                    String onlineTypeDesc = onlineType + (onlineLen != null ? "(" + onlineLen + ")" : "");
                    
                    if (!localTypeDesc.equalsIgnoreCase(onlineTypeDesc)) {
                        fieldDiffs.add(SchemaDiffVO.FieldDiff.builder()
                                .columnName(colName)
                                .diffType("TYPE_MISMATCH")
                                .localValue(localTypeDesc)
                                .onlineValue(onlineTypeDesc)
                                .build());

                        sqlSyncBuilder.append(String.format("ALTER TABLE \"%s\" ALTER COLUMN \"%s\" TYPE %s;", 
                                table, colName, localTypeDesc));
                    }
                }
            }

            if (!fieldDiffs.isEmpty()) {
                diffList.add(SchemaDiffVO.builder()
                        .tableName(table)
                        .diffType("FIELD_MISMATCH")
                        .description("检测到表字段结构存在差异")
                        .fieldDiffs(fieldDiffs)
                        .sqlSync(sqlSyncBuilder.toString())
                        .build());
            }
        }

        return diffList;
    }

    @Override
    public DataDiffVO compareData(String tableName) {
        log.info("开始对比数据表内容记录差异: {}", tableName);
        
        DbConnectionConfig localConfig = configRepository.findByConnName("local_dev")
                .orElseThrow(() -> new IllegalArgumentException("未配置本地开发库 [local_dev] 连接信息"));
        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate localTemplate = new JdbcTemplate(connectionManager.getDataSource(localConfig));
        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 校验表是否存在，防止抛出 BadSqlGrammarException 导致接口报 500
        List<String> localTables = queryTables(localTemplate);
        List<String> onlineTables = queryTables(onlineTemplate);
        
        if (!localTables.contains(tableName)) {
            throw new IllegalArgumentException("本地开发库中不存在表 [" + tableName + "]");
        }
        if (!onlineTables.contains(tableName)) {
            throw new IllegalArgumentException("线上部署库中不存在表 [" + tableName + "]，请先在【结构对比】中执行同步建表！");
        }

        // 1. 分别查询两边的主键与更新时间快照
        boolean hasUpdatedAt = checkColumnExists(localTemplate, tableName, "updated_at");
        String sqlQuery = hasUpdatedAt 
                ? String.format("SELECT id, updated_at FROM \"%s\" ORDER BY id", tableName)
                : String.format("SELECT id FROM \"%s\" ORDER BY id", tableName);

        List<Map<String, Object>> localSnapshot = localTemplate.queryForList(sqlQuery);
        List<Map<String, Object>> onlineSnapshot = onlineTemplate.queryForList(sqlQuery);

        Map<Long, Timestamp> localMap = new HashMap<>();
        for (Map<String, Object> row : localSnapshot) {
            Long id = ((Number) row.get("id")).longValue();
            Timestamp ts = hasUpdatedAt ? (Timestamp) row.get("updated_at") : null;
            localMap.put(id, ts);
        }

        Map<Long, Timestamp> onlineMap = new HashMap<>();
        for (Map<String, Object> row : onlineSnapshot) {
            Long id = ((Number) row.get("id")).longValue();
            Timestamp ts = hasUpdatedAt ? (Timestamp) row.get("updated_at") : null;
            onlineMap.put(id, ts);
        }

        // 计算差集
        List<Long> insertIds = new ArrayList<>();
        List<Long> updateIds = new ArrayList<>();
        List<Long> remoteOnlyIds = new ArrayList<>();

        // 本地多的 (To Insert) 和不一致的 (To Update)
        for (Map.Entry<Long, Timestamp> localEntry : localMap.entrySet()) {
            Long id = localEntry.getKey();
            Timestamp localTs = localEntry.getValue();

            if (!onlineMap.containsKey(id)) {
                insertIds.add(id);
            } else {
                if (hasUpdatedAt) {
                    Timestamp onlineTs = onlineMap.get(id);
                    if (onlineTs == null || (localTs != null && localTs.after(onlineTs))) {
                        updateIds.add(id);
                    }
                }
            }
        }

        // 线上多的 (Remote Only)
        for (Long onlineId : onlineMap.keySet()) {
            if (!localMap.containsKey(onlineId)) {
                remoteOnlyIds.add(onlineId);
            }
        }

        // 2. 根据主键列表拉取全量详细信息
        List<Map<String, Object>> toInsertList = queryFullRowsByIds(localTemplate, tableName, insertIds);
        List<Map<String, Object>> toUpdateList = queryFullRowsByIds(localTemplate, tableName, updateIds);
        List<Map<String, Object>> remoteOnlyList = queryFullRowsByIds(onlineTemplate, tableName, remoteOnlyIds);

        // 格式化处理，把时间戳等特殊对象转成 String 方便前端展示
        formatRows(toInsertList);
        formatRows(toUpdateList);
        formatRows(remoteOnlyList);

        return DataDiffVO.builder()
                .tableName(tableName)
                .toInsert(toInsertList)
                .toUpdate(toUpdateList)
                .remoteOnly(remoteOnlyList)
                .build();
    }

    @Override
    @Transactional
    public void syncSchema(String tableName, String sql) {
        log.info("同步表结构到线上: {} -> SQL: {}", tableName, sql);
        
        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 1. 分析反向回退 SQL
        String sqlRollback = buildRollbackDdl(tableName, sql);

        // 2. 执行线上库结构同步
        try {
            onlineTemplate.execute(sql);
        } catch (Exception e) {
            log.error("执行结构同步失败 SQL: {}", sql, e);
            throw new RuntimeException("同步表结构失败: " + e.getMessage(), e);
        }

        // 3. 记录日志到主库
        logRepository.save(DbSyncLog.builder()
                .opType("SCHEMA")
                .tableName(tableName)
                .sqlSync(sql)
                .sqlRollback(sqlRollback)
                .operator("admin")
                .status("SUCCESS")
                .build());
    }

    @Override
    @Transactional
    public void syncData(String tableName, String opType, List<Long> ids) {
        log.info("执行数据同步至线上: 表={}, 类型={}, 记录数={}", tableName, opType, ids.size());
        if (ids.isEmpty()) return;

        DbConnectionConfig localConfig = configRepository.findByConnName("local_dev")
                .orElseThrow(() -> new IllegalArgumentException("未配置本地开发库 [local_dev] 连接信息"));
        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate localTemplate = new JdbcTemplate(connectionManager.getDataSource(localConfig));
        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 从本地查询源数据行
        List<Map<String, Object>> rows = queryFullRowsByIds(localTemplate, tableName, ids);

        for (Map<String, Object> row : rows) {
            Long id = ((Number) row.get("id")).longValue();
            String sqlSync;
            String sqlRollback;

            if ("INSERT".equalsIgnoreCase(opType)) {
                // 1. 新增同步
                sqlSync = buildInsertSql(tableName, row);
                sqlRollback = String.format("DELETE FROM \"%s\" WHERE id = %d;", tableName, id);

                onlineTemplate.execute(sqlSync);

            } else {
                // 2. 更新同步 (覆盖前先查询线上老数据快照以便回退)
                List<Map<String, Object>> oldRows = queryFullRowsByIds(onlineTemplate, tableName, Collections.singletonList(id));
                if (oldRows.isEmpty()) {
                    // 线上没有，退化为新增
                    sqlSync = buildInsertSql(tableName, row);
                    sqlRollback = String.format("DELETE FROM \"%s\" WHERE id = %d;", tableName, id);
                } else {
                    sqlSync = buildUpdateSql(tableName, row);
                    sqlRollback = buildUpdateSql(tableName, oldRows.get(0));
                }

                onlineTemplate.execute(sqlSync);
            }

            // 写入日志
            logRepository.save(DbSyncLog.builder()
                    .opType("DATA")
                    .tableName(tableName)
                    .sqlSync(sqlSync)
                    .sqlRollback(sqlRollback)
                    .operator("admin")
                    .status("SUCCESS")
                    .build());
        }
    }

    @Override
    @Transactional
    public void rollback(Long logId) {
        log.info("执行数据库同步回退，日志ID: {}", logId);
        
        DbSyncLog syncLog = logRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("找不到对应的同步日志记录: " + logId));

        if ("ROLLED_BACK".equalsIgnoreCase(syncLog.getStatus())) {
            throw new IllegalStateException("该记录已经被回退过，不能重复操作");
        }

        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 执行回退 SQL
        try {
            onlineTemplate.execute(syncLog.getSqlRollback());
            syncLog.setStatus("ROLLED_BACK");
            logRepository.save(syncLog);
        } catch (Exception e) {
            log.error("执行回退 SQL 失败: {}", syncLog.getSqlRollback(), e);
            throw new RuntimeException("一键回退失败: " + e.getMessage(), e);
        }
    }

    @Override
    public List<DbSyncLog> getSyncLogs() {
        return logRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // ================== 辅助私有工具方法 ==================

    private List<String> queryTables(JdbcTemplate jdbcTemplate) {
        String sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
        return jdbcTemplate.queryForList(sql, String.class);
    }

    private List<Map<String, Object>> queryColumnsInfo(JdbcTemplate jdbcTemplate, String tableName) {
        String sql = "SELECT column_name, data_type, is_nullable, column_default, character_maximum_length " +
                "FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = ? " +
                "ORDER BY ordinal_position";
        return jdbcTemplate.queryForList(sql, tableName);
    }

    private boolean checkColumnExists(JdbcTemplate jdbcTemplate, String tableName, String columnName) {
        String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = ? AND column_name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
        return count != null && count > 0;
    }

    private List<Map<String, Object>> queryFullRowsByIds(JdbcTemplate jdbcTemplate, String tableName, List<Long> ids) {
        if (ids.isEmpty()) return new ArrayList<>();
        
        // 构造 In 子句
        String idListStr = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
        String sql = String.format("SELECT * FROM \"%s\" WHERE id IN (%s) ORDER BY id", tableName, idListStr);
        return jdbcTemplate.queryForList(sql);
    }

    private void formatRows(List<Map<String, Object>> rows) {
        for (Map<String, Object> row : rows) {
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                if (entry.getValue() instanceof Timestamp || entry.getValue() instanceof Date) {
                    entry.setValue(entry.getValue().toString());
                }
            }
        }
    }

    private String buildCreateTableSql(String tableName, List<Map<String, Object>> columns) {
        StringBuilder sql = new StringBuilder();
        sql.append(String.format("CREATE TABLE \"public\".\"%s\" (\n", tableName));
        
        List<String> colDefs = new ArrayList<>();
        for (Map<String, Object> col : columns) {
            String colName = (String) col.get("column_name");
            String dataType = (String) col.get("data_type");
            Object maxLen = col.get("character_maximum_length");
            String nullable = (String) col.get("is_nullable");
            Object defVal = col.get("column_default");

            String typeDesc = dataType + (maxLen != null ? "(" + maxLen + ")" : "");
            
            StringBuilder colDef = new StringBuilder();
            colDef.append(String.format("  \"%s\" %s", colName, typeDesc));

            if ("NO".equalsIgnoreCase(nullable)) {
                colDef.append(" NOT NULL");
            }
            if (defVal != null) {
                colDef.append(" DEFAULT ").append(defVal);
            }
            
            // 如果是 id 主键，追加主键申明 (这里根据约定直接设置 id)
            if ("id".equalsIgnoreCase(colName)) {
                colDef.append(" PRIMARY KEY");
            }

            colDefs.add(colDef.toString());
        }

        sql.append(String.join(",\n", colDefs));
        sql.append("\n);");
        return sql.toString();
    }

    private String buildInsertSql(String tableName, Map<String, Object> row) {
        StringBuilder cols = new StringBuilder();
        StringBuilder vals = new StringBuilder();

        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (cols.length() > 0) {
                cols.append(", ");
                vals.append(", ");
            }
            cols.append("\"").append(entry.getKey()).append("\"");
            vals.append(formatSqlValue(entry.getValue()));
        }

        return String.format("INSERT INTO \"%s\" (%s) VALUES (%s);", tableName, cols, vals);
    }

    private String buildUpdateSql(String tableName, Map<String, Object> row) {
        StringBuilder sets = new StringBuilder();
        Object idVal = row.get("id");

        for (Map.Entry<String, Object> entry : row.entrySet()) {
            String colName = entry.getKey();
            if ("id".equalsIgnoreCase(colName)) {
                continue;
            }
            if (sets.length() > 0) {
                sets.append(", ");
            }
            sets.append("\"").append(colName).append("\" = ").append(formatSqlValue(entry.getValue()));
        }

        return String.format("UPDATE \"%s\" SET %s WHERE id = %s;", tableName, sets, formatSqlValue(idVal));
    }

    private String buildRollbackDdl(String tableName, String sqlSync) {
        // 简单分析 DDL 以生成回退 SQL
        if (sqlSync.toUpperCase().startsWith("CREATE TABLE")) {
            return String.format("DROP TABLE \"public\".\"%s\";", tableName);
        }
        if (sqlSync.toUpperCase().contains("ADD COLUMN")) {
            // 解析添加的列名，简易做法为在日志里寻找
            String temp = sqlSync.toUpperCase();
            int addIndex = temp.indexOf("ADD COLUMN");
            if (addIndex != -1) {
                String sub = sqlSync.substring(addIndex + 10).trim();
                String colName = sub.split("\\s+")[0].replace("\"", "").replace("'", "");
                return String.format("ALTER TABLE \"%s\" DROP COLUMN \"%s\";", tableName, colName);
            }
        }
        return "-- 自动回退不可用，请手动订正结构";
    }

    private String formatSqlValue(Object value) {
        if (value == null) {
            return "NULL";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        // 字符串、时间戳转义单引号
        String str = value.toString().replace("'", "''");
        return "'" + str + "'";
    }
}
