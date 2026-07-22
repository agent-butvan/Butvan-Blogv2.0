"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  Settings, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  History, 
  Copy, 
  AlertTriangle,
  RotateCcw,
  ListFilter,
  Layers,
  ArrowRightLeft
} from "lucide-react";
import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import { cn, Modal } from "@heroui/react";

// ================== 前端数据接口声明 ==================
interface ConnectionConfig {
  id?: number;
  connName: string;
  jdbcUrl: string;
  username: string;
  password?: string;
}

interface FieldDiff {
  columnName: string;
  diffType: string;
  localValue: string;
  onlineValue: string;
}

interface SchemaDiff {
  tableName: string;
  diffType: string;
  description: string;
  fieldDiffs: FieldDiff[];
  sqlSync: string;
}

interface TableDataOverview {
  tableName: string;
  existsInOnline: boolean;
  localCount: number;
  onlineCount: number;
  toInsertCount: number;
  toUpdateCount: number;
  remoteOnlyCount: number;
}

interface DataDiff {
  tableName: string;
  toInsert: Record<string, any>[];
  toUpdate: Record<string, any>[];
  remoteOnly: Record<string, any>[];
}

interface SyncLog {
  id: number;
  opType: string;
  tableName: string;
  sqlSync: string;
  sqlRollback: string;
  operator: string;
  status: string;
  createdAt: string;
}

interface ForeignKeyDep {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  referencedValue: string;
  displayText: string;
}

export default function DbSyncPage() {
  const [activeTab, setActiveTab] = useState<"config" | "schema" | "data" | "history">("config");

  // ================== 1. 连接配置 State ==================
  const [localConfig, setLocalConfig] = useState<ConnectionConfig>({ connName: "local_dev", jdbcUrl: "", username: "", password: "" });
  const [onlineConfig, setOnlineConfig] = useState<ConnectionConfig>({ connName: "online_prod", jdbcUrl: "", username: "", password: "" });
  const [testingLocal, setTestingLocal] = useState(false);
  const [testingOnline, setTestingOnline] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);
  const [savingOnline, setSavingOnline] = useState(false);

  // ================== 2. 结构对比 State ==================
  const [schemaDiffs, setSchemaDiffs] = useState<SchemaDiff[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [syncingSchema, setSyncingSchema] = useState<Record<string, boolean>>({});

  // ================== 3. 全量数据对比 State ==================
  const [overviewList, setOverviewList] = useState<TableDataOverview[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // ================== 3.1 单表差异下钻 State ==================
  const [selectedTable, setSelectedTable] = useState("blog_article");
  const [dataDiff, setDataDiff] = useState<DataDiff | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedInsertIds, setSelectedInsertIds] = useState<string[]>([]);
  const [selectedUpdateIds, setSelectedUpdateIds] = useState<string[]>([]);
  const [syncingData, setSyncingData] = useState(false);

  // ================== 4. 操作日志 State ==================
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [rollingLogId, setRollingLogId] = useState<number | null>(null);

  // 数据差异详情弹窗 State
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // FK 依赖确认弹窗 State
  const [isFkConfirmOpen, setIsFkConfirmOpen] = useState(false);
  const [fkDeps, setFkDeps] = useState<ForeignKeyDep[]>([]);
  const [pendingSyncOp, setPendingSyncOp] = useState<{ opType: "INSERT" | "UPDATE"; keys: Record<string, any>[] } | null>(null);
  const [checkingFk, setCheckingFk] = useState(false);

  // 全局加载提示
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  /**
   * 获取行数据的唯一标识（字符串形式，用于 checkbox state）
   * - 单主键（有 id 列）：返回 "5"
   * - 复合主键（无 id 列）：返回 "col1::val1::col2::val2" 编码列名
   */
  const getRowKey = (row: Record<string, any>, index: number): string => {
    if (row.id != null) return String(row.id);
    const pkCols = Object.keys(row).filter(k => k.endsWith('_id'));
    if (pkCols.length >= 2) {
      return pkCols.map(col => `${col}::${row[col]}`).join('::');
    }
    return `__idx_${index}`;
  };

  /** 将 getRowKey 生成的字符串解析回 {col: value} 格式，用于 API 请求 */
  const parseRowKey = (key: string): Record<string, any> => {
    if (key.startsWith('__idx_')) return {};
    if (!key.includes('::')) return { id: Number(key) };
    const parts = key.split('::');
    const result: Record<string, any> = {};
    for (let i = 0; i < parts.length; i += 2) {
      const val = parts[i + 1];
      result[parts[i]] = isNaN(Number(val)) ? val : Number(val);
    }
    return result;
  };

  // ================== 初始化加载配置 ==================
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const resLocal = await apiClient.get<ApiResponse<ConnectionConfig>>("/admin/db/config?connName=local_dev");
      if (resLocal.data?.data) {
        setLocalConfig({ ...resLocal.data.data, password: "" }); // 密码打码
      }
      const resOnline = await apiClient.get<ApiResponse<ConnectionConfig>>("/admin/db/config?connName=online_prod");
      if (resOnline.data?.data) {
        setOnlineConfig({ ...resOnline.data.data, password: "" }); // 密码打码
      }
    } catch (err) {
      console.error("加载数据库配置失败:", err);
      showToast("加载连接配置失败，请检查网络", "error");
    }
  };

  // ================== 1. 配置管理逻辑 ==================
  const handleTestConnection = async (type: "local" | "online") => {
    const isLocal = type === "local";
    const setTesting = isLocal ? setTestingLocal : setTestingOnline;
    const config = isLocal ? localConfig : onlineConfig;

    if (!config.jdbcUrl || !config.username) {
      showToast("请完整填写 JDBC URL 和账号", "error");
      return;
    }

    setTesting(true);
    try {
      const res = await apiClient.post<ApiResponse<string>>("/admin/db/test", config);
      if (res.data?.code === 200) {
        showToast(`${isLocal ? "本地开发库" : "线上生产库"} 连接成功！`, "success");
      } else {
        showToast(res.data?.msg || "连接测试失败", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "连接建立超时", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (type: "local" | "online") => {
    const isLocal = type === "local";
    const setSaving = isLocal ? setSavingLocal : setSavingOnline;
    const config = isLocal ? localConfig : onlineConfig;

    if (!config.jdbcUrl || !config.username) {
      showToast("请完整填写 JDBC URL 和账号", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post<ApiResponse<ConnectionConfig>>("/admin/db/config", config);
      if (res.data?.code === 200) {
        showToast(`${isLocal ? "本地开发库" : "线上生产库"} 配置保存成功！`, "success");
        loadConfigs();
      } else {
        showToast("保存配置失败", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "保存配置请求失败", "error");
    } finally {
      setSaving(false);
    }
  };

  // ================== 2. 结构对比逻辑 ==================
  const handleCompareSchema = async () => {
    setLoadingSchema(true);
    setSchemaDiffs([]);
    try {
      const res = await apiClient.get<ApiResponse<SchemaDiff[]>>("/admin/db/compare/schema");
      if (res.data?.data) {
        setSchemaDiffs(res.data.data);
        if (res.data.data.length === 0) {
          showToast("两端表结构完全一致！无需同步 DDL", "success");
        } else {
          showToast("检测到表结构存在差异，请查看详情", "info");
        }
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "对比表结构发生异常", "error");
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleSyncSchema = async (tableName: string, sql: string) => {
    setSyncingSchema(prev => ({ ...prev, [tableName]: true }));
    try {
      const res = await apiClient.post<ApiResponse<string>>("/admin/db/sync/schema", { tableName, sql });
      if (res.data?.code === 200) {
        showToast(`表 ${tableName} 结构成功同步至线上！`, "success");
        setSchemaDiffs(prev => prev.filter(item => item.tableName !== tableName));
        // 如果当前正在展示全量概览，重新拉取一次以刷新建表状态
        if (overviewList.length > 0) {
          handleCompareOverview(true);
        }
      } else {
        showToast("结构同步失败", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "执行 DDL 同步失败", "error");
    } finally {
      setSyncingSchema(prev => ({ ...prev, [tableName]: false }));
    }
  };

  // ================== 3. 全量数据对比逻辑 ==================
  const handleCompareOverview = async (silent = false) => {
    if (!silent) {
      setLoadingOverview(true);
      setOverviewList([]);
      setDataDiff(null);
    }
    try {
      const res = await apiClient.get<ApiResponse<TableDataOverview[]>>("/admin/db/compare/data/overview");
      if (res.data?.data) {
        setOverviewList(res.data.data);
        if (!silent) {
          showToast("全表数据对比就绪，请点击表查看明细", "success");
        }
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "全量对比发生异常", "error");
    } finally {
      if (!silent) {
        setLoadingOverview(false);
      }
    }
  };

  // ================== 3.1 单表数据差异下钻查询 ==================
  const handleDrilldownDetail = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingData(true);
    setDataDiff(null);
    setSelectedInsertIds([]);
    setSelectedUpdateIds([]);
    try {
      const res = await apiClient.get<ApiResponse<DataDiff>>(`/admin/db/compare/data?tableName=${tableName}`);
      if (res.data?.data) {
        setDataDiff(res.data.data);
        setIsDetailOpen(true);
        showToast(`已加载表 [${tableName}] 数据差异详情`, "info");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "加载表记录明细失败", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSyncData = async (opType: "INSERT" | "UPDATE") => {
    const selectedKeys = opType === "INSERT" ? selectedInsertIds : selectedUpdateIds;
    if (selectedKeys.length === 0) {
      showToast("请勾选需要同步的数据行", "error");
      return;
    }

    // 将字符串 key 解析为 {col: value} 格式
    const keys = selectedKeys.map(k => parseRowKey(k)).filter(k => Object.keys(k).length > 0);
    if (keys.length === 0) {
      showToast("无法解析选中行的主键信息", "error");
      return;
    }

    // 先预览外键依赖
    setCheckingFk(true);
    try {
      const fkRes = await apiClient.post<ApiResponse<ForeignKeyDep[]>>("/admin/db/sync/data/preview-fk", {
        tableName: selectedTable,
        keys
      });
      const deps = fkRes.data?.data ?? [];
      if (deps.length > 0) {
        setFkDeps(deps);
        setPendingSyncOp({ opType, keys });
        setIsFkConfirmOpen(true);
        setCheckingFk(false);
        return;
      }
      await executeSyncData(opType, keys);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "外键依赖检测失败", "error");
    } finally {
      setCheckingFk(false);
    }
  };

  /** 用户确认后执行实际的数据同步 */
  const confirmSync = async () => {
    if (!pendingSyncOp) return;
    setIsFkConfirmOpen(false);
    await executeSyncData(pendingSyncOp.opType, pendingSyncOp.keys);
    setPendingSyncOp(null);
    setFkDeps([]);
  };

  /** 执行数据同步的核心逻辑（使用 keys 格式兼容复合主键） */
  const executeSyncData = async (opType: "INSERT" | "UPDATE", keys: Record<string, any>[]) => {
    setSyncingData(true);
    try {
      const res = await apiClient.post<ApiResponse<String>>("/admin/db/sync/data", {
        tableName: selectedTable,
        opType,
        keys
      });
      if (res.data?.code === 200) {
        showToast(`成功同步 ${keys.length} 条记录至线上！`, "success");
        handleDrilldownDetail(selectedTable);
        handleCompareOverview(true);
      } else {
        showToast("同步数据发生异常", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "同步数据执行失败", "error");
    } finally {
      setSyncingData(false);
    }
  };

  // ================== 4. 操作历史逻辑 ==================
  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await apiClient.get<ApiResponse<SyncLog[]>>("/admin/db/logs");
      if (res.data?.data) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error("加载同步历史日志失败:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadLogs();
    }
  }, [activeTab]);

  const handleRollback = async (logId: number) => {
    if (!confirm("确定一键撤销并执行反向回退 SQL 吗？这将直接改动线上数据库！")) {
      return;
    }

    setRollingLogId(logId);
    try {
      const res = await apiClient.post<ApiResponse<string>>(`/admin/db/rollback?logId=${logId}`);
      if (res.data?.code === 200) {
        showToast("回退动作成功执行，线上已被还原！", "success");
        loadLogs(); // 重新加载日志
        if (overviewList.length > 0) {
          handleCompareOverview(true); // 刷新全量计数
        }
      } else {
        showToast("回退失败", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "一键撤销失败", "error");
    } finally {
      setRollingLogId(null);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-5 min-h-[calc(100vh-60px)] bg-zinc-50/40 dark:bg-zinc-950/20 text-left">
      
      {/* 全局自定义 Toast */}
      {toastMsg && (
        <div className={cn(
          "fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-2.5 select-none text-xs font-semibold max-w-lg transition-all animate-slide-in backdrop-blur-sm",
          toastMsg.type === "success" && "bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
          toastMsg.type === "error" && "bg-rose-50/95 dark:bg-rose-950/95 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
          toastMsg.type === "info" && "bg-indigo-50/95 dark:bg-indigo-950/95 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
        )}>
          {toastMsg.type === "success" ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-1 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer">
            <XCircle size={13} className="opacity-60" />
          </button>
        </div>
      )}

      {/* 头部面板 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
              <Database size={16} />
            </div>
            Database Sync / 数据库同步中心
          </h2>
          <p className="text-[10.5px] text-zinc-400 font-mono mt-1 uppercase tracking-wide">
            Dynamic database meta compare, data migrations and transactional rollback manager
          </p>
        </div>

        {/* 顶部 Tab 控制器 */}
        <div className="flex bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800 p-0.75 rounded-xl text-xs font-bold gap-0.5 mt-3 md:mt-0 select-none">
          <button 
            onClick={() => setActiveTab("config")}
            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5", activeTab === "config" ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-2xs" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600")}
          >
            <Settings size={13} /> 连接配置
          </button>
          <button 
            onClick={() => setActiveTab("schema")}
            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5", activeTab === "schema" ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-2xs" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600")}
          >
            <Database size={13} /> 结构对比
          </button>
          <button 
            onClick={() => setActiveTab("data")}
            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5", activeTab === "data" ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-2xs" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600")}
          >
            <ListFilter size={13} /> 记录对比
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5", activeTab === "history" ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-2xs" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600")}
          >
            <History size={13} /> 操作历史
          </button>
        </div>
      </div>

      {/* ================== Tab 1: 数据库连接配置 ================== */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 select-none text-left">
          {/* 本地开发库 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-3xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Local Dev DB / 本地开发数据库</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">JDBC Connection URL</label>
                <input 
                  type="text" 
                  value={localConfig.jdbcUrl}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, jdbcUrl: e.target.value }))}
                  placeholder="jdbc:postgresql://localhost:5432/blog_dev"
                  className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">Username</label>
                  <input 
                    type="text" 
                    value={localConfig.username}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="postgres"
                    className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">Password</label>
                  <input 
                    type="password" 
                    value={localConfig.password}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="若不需要更改，请留空"
                    className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
                <button
                  onClick={() => handleTestConnection("local")}
                  disabled={testingLocal}
                  className="h-8.5 px-4.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {testingLocal && <RefreshCw size={12} className="animate-spin" />}
                  测试连接
                </button>
                <button
                  onClick={() => handleSaveConfig("local")}
                  disabled={savingLocal}
                  className="h-8.5 px-4.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {savingLocal && <RefreshCw size={12} className="animate-spin" />}
                  保存配置
                </button>
              </div>
            </div>
          </div>

          {/* 线上部署库 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-3xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Online Prod DB / 线上部署数据库</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">JDBC Connection URL</label>
                <input 
                  type="text" 
                  value={onlineConfig.jdbcUrl}
                  onChange={(e) => setOnlineConfig(prev => ({ ...prev, jdbcUrl: e.target.value }))}
                  placeholder="jdbc:postgresql://your-server-ip:5432/blog_prod"
                  className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">Username</label>
                  <input 
                    type="text" 
                    value={onlineConfig.username}
                    onChange={(e) => setOnlineConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="postgres"
                    className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase font-mono">Password</label>
                  <input 
                    type="password" 
                    value={onlineConfig.password}
                    onChange={(e) => setOnlineConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="若不需要更改，请留空"
                    className="w-full h-9 px-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/85 dark:border-zinc-800 rounded-xl text-xs font-mono outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
                <button
                  onClick={() => handleTestConnection("online")}
                  disabled={testingOnline}
                  className="h-8.5 px-4.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {testingOnline && <RefreshCw size={12} className="animate-spin" />}
                  测试连接
                </button>
                <button
                  onClick={() => handleSaveConfig("online")}
                  disabled={savingOnline}
                  className="h-8.5 px-4.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {savingOnline && <RefreshCw size={12} className="animate-spin" />}
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== Tab 2: 表结构对比 (Schema Compare) ================== */}
      {activeTab === "schema" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-3xs flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">DDL 表结构比对</h3>
            </div>
            <button
              onClick={handleCompareSchema}
              disabled={loadingSchema}
              className="h-8 px-4 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={cn(loadingSchema && "animate-spin")} />
              开始比对结构
            </button>
          </div>

          {loadingSchema ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2 font-mono text-[11px]">
              <RefreshCw className="animate-spin text-primary" size={24} />
              <span>COMPARING SCHEMA METADATA...</span>
            </div>
          ) : schemaDiffs.length > 0 ? (
            <div className="space-y-4.5">
              {schemaDiffs.map((diff) => {
                const isExpanded = expandedTable === diff.tableName;
                return (
                  <div key={diff.tableName} className="border border-zinc-200/70 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs bg-zinc-50/20 dark:bg-zinc-900/5 transition-all">
                    
                    {/* 折叠头部 */}
                    <div 
                      onClick={() => setExpandedTable(isExpanded ? null : diff.tableName)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 select-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {diff.tableName}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-md",
                          diff.diffType === "MISSING_IN_ONLINE" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {diff.diffType === "MISSING_IN_ONLINE" ? "线上缺失该表" : "字段结构不匹配"}
                        </span>
                        <span className="text-[10px] text-zinc-450 hidden md:inline">
                          {diff.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    {/* 折叠主体 */}
                    {isExpanded && (
                      <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 p-4 space-y-4 animate-slide-down">
                        
                        {/* 字段差异表格 */}
                        <div className="overflow-x-auto rounded-lg border border-zinc-200/50 dark:border-zinc-800">
                          <table className="w-full border-collapse text-left text-xs">
                            <thead>
                              <tr className="bg-zinc-100/50 dark:bg-zinc-850/50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200/50 dark:border-zinc-850">
                                <th className="p-2.5">字段列名</th>
                                <th className="p-2.5">差异类型</th>
                                <th className="p-2.5">本地开发库</th>
                                <th className="p-2.5">线上生产库</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800">
                              {diff.fieldDiffs.map((field) => (
                                <tr key={field.columnName} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 font-mono text-[11px] text-zinc-600 dark:text-zinc-450">
                                  <td className="p-2.5 font-bold text-zinc-700 dark:text-zinc-300">{field.columnName}</td>
                                  <td className="p-2.5">
                                    <span className={cn(
                                      "text-[9px] font-extrabold px-1.5 py-0.25 rounded-md",
                                      field.diffType === "MISSING_IN_ONLINE" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                      {field.diffType}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-indigo-500">{field.localValue}</td>
                                  <td className="p-2.5 text-zinc-400 font-bold">{field.onlineValue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* SQL 同步预览区 */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-450 font-bold select-none">
                            <span>RECOMMENDED SYNC DDL / 推荐同步 SQL 预览</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(diff.sqlSync);
                                showToast("SQL 已复制到剪贴板", "success");
                              }}
                              className="text-primary hover:underline flex items-center gap-0.5 active:scale-95 transition-all"
                            >
                              <Copy size={10} /> 复制代码
                            </button>
                          </div>
                          <pre className="bg-zinc-950 dark:bg-zinc-900/50 text-[11px] font-mono text-emerald-400 p-3.5 rounded-xl border border-zinc-800 overflow-x-auto shadow-inner leading-relaxed">
                            {diff.sqlSync}
                          </pre>
                        </div>

                        {/* 执行按钮 */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSyncSchema(diff.tableName, diff.sqlSync)}
                            disabled={syncingSchema[diff.tableName]}
                            className="h-8.5 px-4.5 bg-emerald-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            {syncingSchema[diff.tableName] ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                            执行同步到线上
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400 font-mono text-xs select-none">
              NO SCHEMA MISMATCH DETECTED
            </div>
          )}
        </div>
      )}

      {/* ================== Tab 3: 数据记录比对 (Data Compare) ================== */}
      {activeTab === "data" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-3xs flex flex-col gap-5 text-left">
          
          {/* 标题及一键全表对比控制栏 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">数据记录比对</h3>
            </div>
            
            <button
              onClick={() => handleCompareOverview(false)}
              disabled={loadingOverview}
              className="h-8.5 px-4.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw size={12} className={cn(loadingOverview && "animate-spin")} />
              一键全量对比所有表数据
            </button>
          </div>

          {/* 3.1 全表比对概览表格展示 */}
          {loadingOverview ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2 font-mono text-[11px]">
              <RefreshCw className="animate-spin text-primary" size={24} />
              <span>SCANNING AND COMPARING ALL DATA TABLES...</span>
            </div>
          ) : overviewList.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest select-none">
                物理数据表比对概览 (PHYSICAL TABLES OVERVIEW)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-850/50 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800 select-none">
                      <th className="p-3">物理数据表名称</th>
                      <th className="p-3">线上建表状态</th>
                      <th className="p-3 text-center">本地行数</th>
                      <th className="p-3 text-center">线上行数</th>
                      <th className="p-3 text-center text-emerald-500">待导入 (Insert)</th>
                      <th className="p-3 text-center text-amber-500">待更新 (Update)</th>
                      <th className="p-3 text-center text-zinc-400">线上特有</th>
                      <th className="p-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                    {overviewList.map((row) => (
                      <tr 
                        key={row.tableName} 
                        className={cn(
                          "hover:bg-zinc-50/20 dark:hover:bg-zinc-950/10 text-zinc-650 dark:text-zinc-400 transition-colors",
                          selectedTable === row.tableName && dataDiff && "bg-primary/5 hover:bg-primary/8 dark:bg-primary/5"
                        )}
                      >
                        <td className="p-3 font-mono font-bold text-zinc-850 dark:text-zinc-350">{row.tableName}</td>
                        <td className="p-3">
                          {row.existsInOnline ? (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              线上已建表
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5 select-none w-fit">
                              <AlertTriangle size={9} />
                              线上未建表，需要同步
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">{row.localCount}</td>
                        <td className="p-3 text-center font-mono">{row.existsInOnline ? row.onlineCount : "-"}</td>
                        <td className="p-3 text-center font-mono font-extrabold text-emerald-500">
                          {row.existsInOnline ? (row.toInsertCount > 0 ? `+${row.toInsertCount}` : 0) : "-"}
                        </td>
                        <td className="p-3 text-center font-mono font-extrabold text-amber-500">
                          {row.existsInOnline ? (row.toUpdateCount > 0 ? `~${row.toUpdateCount}` : 0) : "-"}
                        </td>
                        <td className="p-3 text-center font-mono text-zinc-400">
                          {row.existsInOnline ? row.remoteOnlyCount : "-"}
                        </td>
                        <td className="p-3 text-center">
                          {row.existsInOnline ? (
                            <button
                              onClick={() => handleDrilldownDetail(row.tableName)}
                              disabled={loadingData && selectedTable === row.tableName}
                              className={cn(
                                "px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 mx-auto",
                                selectedTable === row.tableName && dataDiff
                                  ? "bg-primary text-white shadow-2xs"
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              )}
                            >
                              {loadingData && selectedTable === row.tableName && <RefreshCw size={9} className="animate-spin" />}
                              对比明细 (Diff)
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveTab("schema");
                                handleCompareSchema();
                              }}
                              className="px-2.5 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer mx-auto flex items-center gap-0.5"
                            >
                              <Play size={9} />
                              去同步结构
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400 font-mono text-xs select-none">
              点击上方按钮一键开启全量物理数据表比对概览
            </div>
          )}

          {/* 3.2 加载指示器（详情在弹窗中展示） */}
          {loadingData && (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-6">
              <RefreshCw className="animate-spin text-primary" size={20} />
              <span className="text-[10px] font-mono">LOADING DETAIL METADATA FOR [{selectedTable}]...</span>
            </div>
          )}


        </div>
      )}

      {/* ================== Tab 4: 操作历史与回退时间轴 (History & Logs) ================== */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl shadow-3xs flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">库同步日志历史</h3>
            </div>
            <button
              onClick={loadLogs}
              disabled={loadingLogs}
              className="p-1.5 rounded-lg text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={cn(loadingLogs && "animate-spin")} />
            </button>
          </div>

          {loadingLogs ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2 font-mono text-[11px]">
              <RefreshCw className="animate-spin text-primary" size={24} />
              <span>RETRIEVING TRANSACTION LOGS...</span>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-zinc-200/50 dark:border-zinc-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-850/50 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-850 select-none">
                    <th className="p-3 w-16">编号</th>
                    <th className="p-3 w-24">操作类型</th>
                    <th className="p-3 w-28">受影响表</th>
                    <th className="p-3">执行同步 SQL</th>
                    <th className="p-3 w-36 text-center">状态</th>
                    <th className="p-3 w-40">时间</th>
                    <th className="p-3 w-24 text-center">回退</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                  {logs.map((logItem) => (
                    <tr key={logItem.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-950/10 text-zinc-655 dark:text-zinc-450">
                      <td className="p-3 font-mono font-bold text-zinc-700 dark:text-zinc-350">#{logItem.id}</td>
                      <td className="p-3">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                          logItem.opType === "SCHEMA" ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {logItem.opType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">{logItem.tableName}</td>
                      <td className="p-3">
                        <div 
                          className="font-mono text-[10.5px] max-w-[300px] truncate text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                          title={logItem.sqlSync}
                        >
                          {logItem.sqlSync}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={cn(
                          "text-[9px] font-extrabold px-2 py-0.5 rounded-lg select-none",
                          logItem.status === "SUCCESS" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          logItem.status === "FAILED" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                          logItem.status === "ROLLED_BACK" && "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500"
                        )}>
                          {logItem.status === "SUCCESS" ? "执行成功" : (logItem.status === "FAILED" ? "失败" : "已回退还原")}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-zinc-400">{logItem.createdAt}</td>
                      <td className="p-3 text-center">
                        {logItem.status === "SUCCESS" ? (
                          <button
                            onClick={() => handleRollback(logItem.id)}
                            disabled={rollingLogId === logItem.id}
                            className="p-1 bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950/30 text-zinc-400 hover:text-rose-500 rounded-lg transition-all active:scale-90 cursor-pointer disabled:opacity-50"
                            title="一键撤销同步 SQL 并恢复线上数据"
                          >
                            {rollingLogId === logItem.id ? <RefreshCw size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                          </button>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400 font-mono text-xs select-none">
              NO TRANSACTION HISTORY LOGGED
            </div>
          )}
        </div>
      )}

      {/* ================== 数据差异详情弹窗 ================== */}
      <Modal isOpen={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <Modal.Backdrop variant="blur">
          <Modal.Container size="full" scroll="inside">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  数据差异明细 — <span className="font-mono text-primary">{dataDiff?.tableName}</span>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="p-5 space-y-5">
                {dataDiff && (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-primary/5 border border-primary/10 px-4.5 py-2.5 rounded-xl select-none">
                      <ArrowRightLeft size={13} className="text-primary shrink-0" />
                      <span>正在查阅数据表 <strong className="font-mono text-primary font-extrabold">{dataDiff.tableName}</strong> 的两端行记录 Diff 明细：</span>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {/* 🟢 本地新增 */}
                      <div className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-3xs">
                        <div className="px-4 py-3.5 bg-emerald-500/5 dark:bg-emerald-500/2 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between select-none">
                          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            本地新增记录 ({dataDiff.toInsert.length} 条)
                          </h4>
                          {dataDiff.toInsert.length > 0 && (
                            <button onClick={() => handleSyncData("INSERT")} disabled={syncingData} className="h-7 px-3 bg-emerald-500 text-white text-[10.5px] font-bold rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer">
                              {syncingData && <RefreshCw size={10} className="animate-spin" />}导入选中到线上
                            </button>
                          )}
                        </div>
                        {dataDiff.toInsert.length > 0 ? (
                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-850/40 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800 select-none">
                                  <th className="p-3 w-10 text-center"><input type="checkbox" checked={selectedInsertIds.length === dataDiff.toInsert.length && dataDiff.toInsert.length > 0} onChange={(e) => { if (e.target.checked) { setSelectedInsertIds(dataDiff.toInsert.map((r, i) => getRowKey(r, i))); } else { setSelectedInsertIds([]); } }} className="rounded border-zinc-300 text-primary focus:ring-primary/20" /></th>
                                  <th className="p-3 font-mono">ID</th><th className="p-3">名称/标题/关键字段</th><th className="p-3">更多属性元数据</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                                {dataDiff.toInsert.map((row, index) => { const rk = getRowKey(row, index); return (
                                  <tr key={rk} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 text-zinc-600 dark:text-zinc-400">
                                    <td className="p-3 text-center"><input type="checkbox" checked={selectedInsertIds.includes(rk)} onChange={(e) => { if (e.target.checked) { setSelectedInsertIds(p => [...p, rk]); } else { setSelectedInsertIds(p => p.filter(k => k !== rk)); } }} className="rounded border-zinc-300 text-primary focus:ring-primary/20" /></td>
                                    <td className="p-3 font-mono font-bold text-zinc-700 dark:text-zinc-350">{row.id ?? "-"}</td>
                                    <td className="p-3 font-medium text-zinc-800 dark:text-zinc-200">{row.title || row.name || row.slug || JSON.stringify(row).substring(0, 50)}</td>
                                    <td className="p-3 text-[10.5px] font-mono text-zinc-400 dark:text-zinc-555 max-w-[300px] truncate">{Object.entries(row).filter(([k]) => k !== "id" && k !== "title" && k !== "name" && k !== "content").map(([k, v]) => `${k}:${v}`).join(" | ")}</td>
                                  </tr>
                                ); })}
                              </tbody>
                            </table>
                          </div>
                        ) : <div className="text-center py-10 text-zinc-400 font-mono text-[10.5px] select-none">没有本地特有的新增记录</div>}
                      </div>
                      {/* 🟡 本地修改 */}
                      <div className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-3xs">
                        <div className="px-4 py-3.5 bg-amber-500/5 dark:bg-amber-500/2 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between select-none">
                          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            本地更新记录 ({dataDiff.toUpdate.length} 条，本地版本较新)
                          </h4>
                          {dataDiff.toUpdate.length > 0 && (
                            <button onClick={() => handleSyncData("UPDATE")} disabled={syncingData} className="h-7 px-3 bg-amber-500 text-white text-[10.5px] font-bold rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer">
                              {syncingData && <RefreshCw size={10} className="animate-spin" />}同步更新到线上
                            </button>
                          )}
                        </div>
                        {dataDiff.toUpdate.length > 0 ? (
                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-850/40 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800 select-none">
                                  <th className="p-3 w-10 text-center"><input type="checkbox" checked={selectedUpdateIds.length === dataDiff.toUpdate.length && dataDiff.toUpdate.length > 0} onChange={(e) => { if (e.target.checked) { setSelectedUpdateIds(dataDiff.toUpdate.map((r, i) => getRowKey(r, i))); } else { setSelectedUpdateIds([]); } }} className="rounded border-zinc-300 text-primary focus:ring-primary/20" /></th>
                                  <th className="p-3 font-mono">ID</th><th className="p-3">名称/标题</th><th className="p-3">本地最后更新</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                                {dataDiff.toUpdate.map((row, index) => { const rk = getRowKey(row, index); return (
                                  <tr key={rk} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 text-zinc-650 dark:text-zinc-400">
                                    <td className="p-3 text-center"><input type="checkbox" checked={selectedUpdateIds.includes(rk)} onChange={(e) => { if (e.target.checked) { setSelectedUpdateIds(p => [...p, rk]); } else { setSelectedUpdateIds(p => p.filter(k => k !== rk)); } }} className="rounded border-zinc-300 text-primary focus:ring-primary/20" /></td>
                                    <td className="p-3 font-mono font-bold text-zinc-700 dark:text-zinc-350">{row.id ?? "-"}</td>
                                    <td className="p-3 font-medium text-zinc-800 dark:text-zinc-200">{row.title || row.name || row.slug}</td>
                                    <td className="p-3 font-mono text-[10.5px] text-amber-500 font-bold">{row.updated_at || "N/A"}</td>
                                  </tr>
                                ); })}
                              </tbody>
                            </table>
                          </div>
                        ) : <div className="text-center py-10 text-zinc-400 font-mono text-[10.5px] select-none">没有本地更新的差异记录</div>}
                      </div>
                      {/* 🔴 线上特有 */}
                      <div className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-3xs">
                        <div className="px-4 py-3.5 bg-rose-500/5 dark:bg-rose-500/2 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between select-none">
                          <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            线上多出数据 ({dataDiff.remoteOnly.length} 条，本地缺少)
                          </h4>
                          <span className="text-[10px] text-zinc-400">仅用于感知，不可直接在线上撤销</span>
                        </div>
                        {dataDiff.remoteOnly.length > 0 ? (
                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-850/40 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800 select-none">
                                  <th className="p-3 font-mono">ID</th><th className="p-3">名称/标题</th><th className="p-3">线上更新时间</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                                {dataDiff.remoteOnly.map((row, index) => (
                                  <tr key={getRowKey(row, index)} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 text-zinc-650 dark:text-zinc-450">
                                    <td className="p-3 font-mono font-bold">{row.id ?? "-"}</td>
                                    <td className="p-3 font-medium">{row.title || row.name || row.slug}</td>
                                    <td className="p-3 font-mono text-[10.5px]">{row.updated_at || "N/A"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <div className="text-center py-10 text-zinc-400 font-mono text-[10.5px] select-none">线上生产库无特有记录</div>}
                      </div>
                    </div>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                <button slot="close" className="h-8.5 px-4.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer">关闭</button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* ================== 外键依赖确认弹窗 ================== */}
      <Modal isOpen={isFkConfirmOpen} onOpenChange={setIsFkConfirmOpen}>
        <Modal.Backdrop variant="blur">
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={16} />
                    外键依赖检测
                  </span>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="p-5 space-y-4">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  检测到以下 <strong className="text-zinc-800 dark:text-zinc-200">{fkDeps.length}</strong> 条外键依赖记录在线上库中缺失，同步时将自动从本地级联导入这些父表记录：
                </p>
                <div className="border border-zinc-200/60 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-850/40 text-[10px] font-bold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800 select-none">
                        <th className="p-3">父表名</th>
                        <th className="p-3">关联条件</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/60">
                      {fkDeps.map((dep, idx) => (
                        <tr key={idx} className="text-zinc-600 dark:text-zinc-400">
                          <td className="p-3 font-mono font-bold text-zinc-700 dark:text-zinc-300">{dep.referencedTable}</td>
                          <td className="p-3 font-mono text-[10.5px]">{dep.displayText}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  确认后系统将自动先导入上述父表记录，再同步当前表数据。若取消则不执行任何操作。
                </p>
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-2">
                <button
                  slot="close"
                  className="h-8.5 px-4.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >取消</button>
                <button
                  onClick={confirmSync}
                  disabled={syncingData}
                  className="h-8.5 px-4.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {syncingData && <RefreshCw size={12} className="animate-spin" />}
                  确认并同步
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </div>
  );
}
