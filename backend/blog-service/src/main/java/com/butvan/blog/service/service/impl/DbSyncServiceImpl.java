package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.utils.AesUtils;
import com.butvan.blog.pojo.entity.DbConnectionConfig;
import com.butvan.blog.pojo.entity.DbSyncLog;
import com.butvan.blog.pojo.vo.dbsync.DataDiffVO;
import com.butvan.blog.pojo.vo.dbsync.DbConnectionConfigVO;
import com.butvan.blog.pojo.vo.dbsync.SchemaDiffVO;
import com.butvan.blog.pojo.vo.dbsync.TableDataOverviewVO;
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
    public List<TableDataOverviewVO> compareDataOverview() {
        log.info("一键全量对比本地开发库与线上部署库的所有物理表记录数与差集数量");
        
        DbConnectionConfig localConfig = configRepository.findByConnName("local_dev")
                .orElseThrow(() -> new IllegalArgumentException("未配置本地开发库 [local_dev] 连接信息"));
        DbConnectionConfig onlineConfig = configRepository.findByConnName("online_prod")
                .orElseThrow(() -> new IllegalArgumentException("未配置线上部署库 [online_prod] 连接信息"));

        JdbcTemplate localTemplate = new JdbcTemplate(connectionManager.getDataSource(localConfig));
        JdbcTemplate onlineTemplate = new JdbcTemplate(connectionManager.getDataSource(onlineConfig));

        // 1. 查询两边物理表清单
        List<String> localTables = queryTables(localTemplate).stream()
                // 排除系统表与日志配置表，保持业务表焦点
                .filter(t -> !t.equals("flyway_schema_history") && !t.equals("db_sync_log") && !t.equals("db_connection_config"))
                .sorted()
                .collect(Collectors.toList());
        List<String> onlineTables = queryTables(onlineTemplate);

        List<TableDataOverviewVO> overviewList = new ArrayList<>();

        for (String table : localTables) {
            // 2. 判定线上是否存在该表
            boolean exists = onlineTables.contains(table);
            
            // 查询本地数据量
            Integer localCount = localTemplate.queryForObject(String.format("SELECT COUNT(*) FROM \"%s\"", table), Integer.class);
            if (localCount == null) localCount = 0;

            if (!exists) {
                // 线上缺失此表
                overviewList.add(TableDataOverviewVO.builder()
                        .tableName(table)
                        .existsInOnline(false)
                        .localCount(localCount)
                        .onlineCount(0)
                        .toInsertCount(localCount)
                        .toUpdateCount(0)
                        .remoteOnlyCount(0)
                        .build());
                continue;
            }

            // 3. 线上表存在，执行行级快照比对
            Integer onlineCount = onlineTemplate.queryForObject(String.format("SELECT COUNT(*) FROM \"%s\"", table), Integer.class);
            if (onlineCount == null) onlineCount = 0;

            // 动态检测主键列，兼容复合主键与无id关联表
            List<String> pkColumns = queryPrimaryKeyColumns(localTemplate, table);
            if (pkColumns.isEmpty()) {
                // 无主键表跳过差集比对，仅展示记录数
                log.warn("表 [{}] 未检测到主键列，跳过行级差集比对", table);
                overviewList.add(TableDataOverviewVO.builder()
                        .tableName(table)
                        .existsInOnline(true)
                        .localCount(localCount)
                        .onlineCount(onlineCount)
                        .toInsertCount(null)
                        .toUpdateCount(null)
                        .remoteOnlyCount(null)
                        .build());
                continue;
            }

            boolean hasUpdatedAt = checkColumnExists(localTemplate, table, "updated_at");

            // 构建 SELECT 列清单：主键列 + 可选的 updated_at
            String pkSelectCols = String.join(", ", pkColumns.stream().map(c -> "\"" + c + "\"").collect(Collectors.toList()));
            String sqlQuery = hasUpdatedAt
                    ? String.format("SELECT %s, updated_at FROM \"%s\"", pkSelectCols, table)
                    : String.format("SELECT %s FROM \"%s\"", pkSelectCols, table);

            List<Map<String, Object>> localSnapshot = localTemplate.queryForList(sqlQuery);
            List<Map<String, Object>> onlineSnapshot = onlineTemplate.queryForList(sqlQuery);

            Map<String, Timestamp> localMap = buildSnapshotMap(localSnapshot, pkColumns, hasUpdatedAt);
            Map<String, Timestamp> onlineMap = buildSnapshotMap(onlineSnapshot, pkColumns, hasUpdatedAt);

            int toInsertCount = 0;
            int toUpdateCount = 0;
            int remoteOnlyCount = 0;

            for (Map.Entry<String, Timestamp> localEntry : localMap.entrySet()) {
                String key = localEntry.getKey();
                Timestamp localTs = localEntry.getValue();

                if (!onlineMap.containsKey(key)) {
                    toInsertCount++;
                } else {
                    if (hasUpdatedAt) {
                        Timestamp onlineTs = onlineMap.get(key);
                        if (onlineTs == null || (localTs != null && localTs.after(onlineTs))) {
                            toUpdateCount++;
                        }
                    }
                }
            }

            for (String onlineKey : onlineMap.keySet()) {
                if (!localMap.containsKey(onlineKey)) {
                    remoteOnlyCount++;
                }
            }

            overviewList.add(TableDataOverviewVO.builder()
                    .tableName(table)
                    .existsInOnline(true)
                    .localCount(localCount)
                    .onlineCount(onlineCount)
                    .toInsertCount(toInsertCount)
                    .toUpdateCount(toUpdateCount)
                    .remoteOnlyCount(remoteOnlyCount)
                    .build());
        }

        return overviewList;
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

        // 动态检测主键列
        List<String> pkColumns = queryPrimaryKeyColumns(localTemplate, tableName);
        if (pkColumns.isEmpty()) {
            throw new IllegalArgumentException("表 [" + tableName + "] 未检测到主键列，暂不支持行级差集比对");
        }

        // 1. 分别查询两边的主键与更新时间快照
        boolean hasUpdatedAt = checkColumnExists(localTemplate, tableName, "updated_at");
        String pkSelectCols = String.join(", ", pkColumns.stream().map(c -> "\"" + c + "\"").collect(Collectors.toList()));
        String orderByCols = pkColumns.stream().map(c -> "\"" + c + "\"").collect(Collectors.joining(", "));
        String sqlQuery = hasUpdatedAt
                ? String.format("SELECT %s, updated_at FROM \"%s\" ORDER BY %s", pkSelectCols, tableName, orderByCols)
                : String.format("SELECT %s FROM \"%s\" ORDER BY %s", pkSelectCols, tableName, orderByCols);

        List<Map<String, Object>> localSnapshot = localTemplate.queryForList(sqlQuery);
        List<Map<String, Object>> onlineSnapshot = onlineTemplate.queryForList(sqlQuery);

        Map<String, Timestamp> localMap = buildSnapshotMap(localSnapshot, pkColumns, hasUpdatedAt);
        Map<String, Timestamp> onlineMap = buildSnapshotMap(onlineSnapshot, pkColumns, hasUpdatedAt);

        // 计算差集 - 存储复合主键值列表
        List<Map<String, Object>> insertKeys = new ArrayList<>();
        List<Map<String, Object>> updateKeys = new ArrayList<>();
        List<Map<String, Object>> remoteOnlyKeys = new ArrayList<>();

        // 本地多的 (To Insert) 和不一致的 (To Update)
        for (Map.Entry<String, Timestamp> localEntry : localMap.entrySet()) {
            String compositeKey = localEntry.getKey();
            Timestamp localTs = localEntry.getValue();

            if (!onlineMap.containsKey(compositeKey)) {
                insertKeys.add(parseCompositeKey(compositeKey, pkColumns));
            } else {
                if (hasUpdatedAt) {
                    Timestamp onlineTs = onlineMap.get(compositeKey);
                    if (onlineTs == null || (localTs != null && localTs.after(onlineTs))) {
                        updateKeys.add(parseCompositeKey(compositeKey, pkColumns));
                    }
                }
            }
        }

        // 线上多的 (Remote Only)
        for (String onlineKey : onlineMap.keySet()) {
            if (!localMap.containsKey(onlineKey)) {
                remoteOnlyKeys.add(parseCompositeKey(onlineKey, pkColumns));
            }
        }

        // 2. 根据主键列表拉取全量详细信息
        List<Map<String, Object>> toInsertList = queryFullRowsByKeys(localTemplate, tableName, pkColumns, insertKeys);
        List<Map<String, Object>> toUpdateList = queryFullRowsByKeys(localTemplate, tableName, pkColumns, updateKeys);
        List<Map<String, Object>> remoteOnlyList = queryFullRowsByKeys(onlineTemplate, tableName, pkColumns, remoteOnlyKeys);

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

        // 动态检测主键列
        List<String> pkColumns = queryPrimaryKeyColumns(localTemplate, tableName);
        if (pkColumns.isEmpty()) {
            throw new IllegalArgumentException("表 [" + tableName + "] 未检测到主键列，暂不支持数据同步");
        }

        // 将传入的 ids 转换为主键值 Map 列表（兼容单主键场景）
        List<Map<String, Object>> keyList = ids.stream()
                .map(id -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put(pkColumns.get(0), id);
                    return m;
                })
                .collect(Collectors.toList());

        // 从本地查询源数据行
        List<Map<String, Object>> rows = queryFullRowsByKeys(localTemplate, tableName, pkColumns, keyList);

        for (Map<String, Object> row : rows) {
            String sqlSync;
            String sqlRollback;

            // 构建主键 WHERE 条件
            String pkWhere = buildPkWhereClause(pkColumns, row);

            if ("INSERT".equalsIgnoreCase(opType)) {
                // 1. 新增同步：先级联确保外键依赖记录已存在
                ensureForeignKeyDependencies(localTemplate, onlineTemplate, tableName, row, 0, new HashSet<>());
                sqlSync = buildInsertSql(tableName, row);
                sqlRollback = String.format("DELETE FROM \"%s\" WHERE %s;", tableName, pkWhere);

                onlineTemplate.execute(sqlSync);

            } else {
                // 2. 更新同步 (覆盖前先查询线上老数据快照以便回退)
                List<Map<String, Object>> oldRows = queryFullRowsByKeys(onlineTemplate, tableName, pkColumns,
                        Collections.singletonList(extractKeyValues(pkColumns, row)));
                if (oldRows.isEmpty()) {
                    // 线上没有，退化为新增：先级联确保外键依赖
                    ensureForeignKeyDependencies(localTemplate, onlineTemplate, tableName, row, 0, new HashSet<>());
                    sqlSync = buildInsertSql(tableName, row);
                    sqlRollback = String.format("DELETE FROM \"%s\" WHERE %s;", tableName, pkWhere);
                } else {
                    sqlSync = buildUpdateSql(tableName, row, pkColumns);
                    sqlRollback = buildUpdateSql(tableName, oldRows.get(0), pkColumns);
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

    /**
     * 查询指定表的所有主键列名（按序号排序）
     * 支持单主键和复合主键，若无主键则返回空列表
     */
    private List<String> queryPrimaryKeyColumns(JdbcTemplate jdbcTemplate, String tableName) {
        String sql = "SELECT kcu.column_name " +
                "FROM information_schema.table_constraints tc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON tc.constraint_name = kcu.constraint_name " +
                "  AND tc.table_schema = kcu.table_schema " +
                "WHERE tc.constraint_type = 'PRIMARY KEY' " +
                "  AND tc.table_schema = 'public' " +
                "  AND tc.table_name = ? " +
                "ORDER BY kcu.ordinal_position";
        return jdbcTemplate.queryForList(sql, String.class, tableName);
    }

    /** 外键约束信息 */
    private record ForeignKeyInfo(String columnName, String referencedTable, String referencedColumn) {}

    /**
     * 查询指定表的所有外键约束（列名、引用表名、引用列名）
     */
    private List<ForeignKeyInfo> queryForeignKeyConstraints(JdbcTemplate jdbcTemplate, String tableName) {
        String sql = "SELECT kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column " +
                "FROM information_schema.table_constraints tc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON tc.constraint_name = kcu.constraint_name " +
                "  AND tc.table_schema = kcu.table_schema " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = tc.constraint_name " +
                "  AND ccu.table_schema = tc.table_schema " +
                "WHERE tc.constraint_type = 'FOREIGN KEY' " +
                "  AND tc.table_schema = 'public' " +
                "  AND tc.table_name = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ForeignKeyInfo(
                rs.getString("column_name"),
                rs.getString("referenced_table"),
                rs.getString("referenced_column")
        ), tableName);
    }

    /**
     * 递归确保外键依赖记录在线上库已存在，缺失时自动从本地级联同步
     * @param depth 当前递归深度，最大 5 层防止循环引用
     * @param visited 已处理的「表名::主键值」集合，防止重复同步
     */
    private void ensureForeignKeyDependencies(JdbcTemplate localTemplate, JdbcTemplate onlineTemplate,
                                              String tableName, Map<String, Object> row,
                                              int depth, Set<String> visited) {
        if (depth > 5) return;

        List<ForeignKeyInfo> fks = queryForeignKeyConstraints(localTemplate, tableName);

        for (ForeignKeyInfo fk : fks) {
            Object fkValue = row.get(fk.columnName());
            if (fkValue == null) continue;

            String visitKey = fk.referencedTable() + "::" + fkValue;
            if (visited.contains(visitKey)) continue;
            visited.add(visitKey);

            // 检查线上是否已存在该引用记录
            String checkSql = String.format("SELECT COUNT(*) FROM \"%s\" WHERE \"%s\" = %s",
                    fk.referencedTable(), fk.referencedColumn(), formatSqlValue(fkValue));
            Integer count = onlineTemplate.queryForObject(checkSql, Integer.class);
            if (count != null && count > 0) continue;

            // 从本地查询该引用记录
            String refQuery = String.format("SELECT * FROM \"%s\" WHERE \"%s\" = %s",
                    fk.referencedTable(), fk.referencedColumn(), formatSqlValue(fkValue));
            List<Map<String, Object>> refRows = localTemplate.queryForList(refQuery);
            if (refRows.isEmpty()) continue;

            Map<String, Object> refRow = refRows.get(0);

            // 递归处理该引用记录的更上层依赖
            ensureForeignKeyDependencies(localTemplate, onlineTemplate, fk.referencedTable(), refRow, depth + 1, visited);

            // 级联插入该引用记录到线上（使用 ON CONFLICT DO NOTHING 防止已存在时报错）
            String insertSql = buildInsertSql(fk.referencedTable(), refRow)
                    .replaceFirst(";$", " ON CONFLICT DO NOTHING;");
            String rollbackSql = String.format("DELETE FROM \"%s\" WHERE \"%s\" = %s;",
                    fk.referencedTable(), fk.referencedColumn(), formatSqlValue(fkValue));

            try {
                onlineTemplate.execute(insertSql);
                logRepository.save(DbSyncLog.builder()
                        .opType("DATA")
                        .tableName(fk.referencedTable())
                        .sqlSync(insertSql)
                        .sqlRollback(rollbackSql)
                        .operator("admin")
                        .status("SUCCESS")
                        .build());
                log.info("级联同步外键依赖: 表={}, {}={}, 引用自 {}.{}",
                        fk.referencedTable(), fk.referencedColumn(), fkValue, tableName, fk.columnName());
            } catch (Exception e) {
                log.warn("级联同步外键依赖失败: 表={}, 原因: {}", fk.referencedTable(), e.getMessage());
            }
        }
    }

    /**
     * 将快照行列表转换为 Map<复合主键字符串, 时间戳> 用于差集比对
     * 单主键时 key = "123"，复合主键时 key = "123::456"
     */
    private Map<String, Timestamp> buildSnapshotMap(List<Map<String, Object>> snapshot,
                                                     List<String> pkColumns,
                                                     boolean hasUpdatedAt) {
        Map<String, Timestamp> map = new LinkedHashMap<>();
        for (Map<String, Object> row : snapshot) {
            String compositeKey = buildCompositeKey(row, pkColumns);
            Timestamp ts = hasUpdatedAt ? (Timestamp) row.get("updated_at") : null;
            map.put(compositeKey, ts);
        }
        return map;
    }

    /**
     * 根据主键列列表从行数据中构建复合键字符串
     */
    private String buildCompositeKey(Map<String, Object> row, List<String> pkColumns) {
        return pkColumns.stream()
                .map(col -> String.valueOf(row.get(col)))
                .collect(Collectors.joining("::"));
    }

    /**
     * 将复合键字符串解析回 Map<列名, 值> 形式
     */
    private Map<String, Object> parseCompositeKey(String compositeKey, List<String> pkColumns) {
        String[] parts = compositeKey.split("::", -1);
        Map<String, Object> keyMap = new LinkedHashMap<>();
        for (int i = 0; i < pkColumns.size() && i < parts.length; i++) {
            keyMap.put(pkColumns.get(i), parts[i]);
        }
        return keyMap;
    }

    /**
     * 从行数据中提取指定主键列的值组成 Map
     */
    private Map<String, Object> extractKeyValues(List<String> pkColumns, Map<String, Object> row) {
        Map<String, Object> keyMap = new LinkedHashMap<>();
        for (String col : pkColumns) {
            keyMap.put(col, row.get(col));
        }
        return keyMap;
    }

    /**
     * 构建主键 WHERE 子句，如 "id = 123" 或 "article_id = 1 AND tag_id = 2"
     */
    private String buildPkWhereClause(List<String> pkColumns, Map<String, Object> row) {
        return pkColumns.stream()
                .map(col -> String.format("\"%s\" = %s", col, formatSqlValue(row.get(col))))
                .collect(Collectors.joining(" AND "));
    }

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

    /**
     * 根据主键列与主键值列表查询完整行数据
     * 支持单主键和复合主键
     */
    private List<Map<String, Object>> queryFullRowsByKeys(JdbcTemplate jdbcTemplate, String tableName,
                                                           List<String> pkColumns, List<Map<String, Object>> keyList) {
        if (keyList.isEmpty()) return new ArrayList<>();

        // 单主键场景使用 IN 子句优化查询
        if (pkColumns.size() == 1) {
            String pkCol = pkColumns.get(0);
            List<Object> values = keyList.stream()
                    .map(k -> k.get(pkCol))
                    .collect(Collectors.toList());
            String placeholders = values.stream().map(v -> formatSqlValue(v)).collect(Collectors.joining(","));
            String sql = String.format("SELECT * FROM \"%s\" WHERE \"%s\" IN (%s) ORDER BY \"%s\"",
                    tableName, pkCol, placeholders, pkCol);
            return jdbcTemplate.queryForList(sql);
        }

        // 复合主键场景：使用 OR 组合条件
        List<String> conditions = new ArrayList<>();
        for (Map<String, Object> key : keyList) {
            String cond = pkColumns.stream()
                    .map(col -> String.format("\"%s\" = %s", col, formatSqlValue(key.get(col))))
                    .collect(Collectors.joining(" AND "));
            conditions.add("(" + cond + ")");
        }
        String orderByCols = pkColumns.stream().map(c -> "\"" + c + "\"").collect(Collectors.joining(", "));
        String sql = String.format("SELECT * FROM \"%s\" WHERE %s ORDER BY %s",
                tableName, String.join(" OR ", conditions), orderByCols);
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
        // 收集主键列名（约定：列名为 id 或以 _id 结尾的关联字段视为主键候选）
        List<String> pkCandidates = new ArrayList<>();
        for (Map<String, Object> col : columns) {
            String colName = (String) col.get("column_name");
            if ("id".equalsIgnoreCase(colName)) {
                pkCandidates.add(colName);
            }
        }

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
            
            // 如果是 id 主键，追加主键申明
            if ("id".equalsIgnoreCase(colName) && pkCandidates.size() == 1) {
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

    /**
     * 构建 UPDATE SQL，使用动态主键列作为 WHERE 条件
     */
    private String buildUpdateSql(String tableName, Map<String, Object> row, List<String> pkColumns) {
        StringBuilder sets = new StringBuilder();
        Set<String> pkSet = new HashSet<>(pkColumns);

        for (Map.Entry<String, Object> entry : row.entrySet()) {
            String colName = entry.getKey();
            if (pkSet.contains(colName)) {
                continue;
            }
            if (sets.length() > 0) {
                sets.append(", ");
            }
            sets.append("\"").append(colName).append("\" = ").append(formatSqlValue(entry.getValue()));
        }

        String whereClause = buildPkWhereClause(pkColumns, row);
        return String.format("UPDATE \"%s\" SET %s WHERE %s;", tableName, sets, whereClause);
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
