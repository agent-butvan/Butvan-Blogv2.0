package com.butvan.blog.service.aspect;

import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.repository.DailyStatsRepository;
import com.butvan.blog.service.websocket.WebSocketServer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Queue;
import java.util.LinkedList;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import jakarta.annotation.PostConstruct;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 接口测速与日志拦截统一处理切面
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiLogAspect {

    private static final Logger apiLogger = LoggerFactory.getLogger("api-log");
    
    // 生成内存唯一的自增日志ID，供前端 React 渲染做唯一 key，防止 null 冲突报错
    private static final AtomicLong logIdCounter = new AtomicLong(1);

    // 内存中缓存最新的 1000 条接口请求流水明细，支持工作台秒级拉取
    public static final Queue<ApiLog> RECENT_LOGS = new ConcurrentLinkedQueue<>();
    // 内存中缓存最近 100 次 API 响应的耗时数据（毫秒）用于高速响应平均时间计算
    public static final Queue<Long> RECENT_COST_TIMES = new ConcurrentLinkedQueue<>();

    private final DailyStatsRepository dailyStatsRepository;
    private final WebSocketServer webSocketServer;

    /**
     * 系统启动时从本地 api-log.log 文件中恢复最近的日志数据到内存中，以保持数据一致
     */
    @PostConstruct
    public void init() {
        log.info("开始从本地 API 日志文件 logs/api-log.log 恢复最近的日志历史...");
        File file = new File("logs/api-log.log");
        if (file.exists() && file.isFile()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                String line;
                Queue<ApiLog> queue = new LinkedList<>();
                while ((line = reader.readLine()) != null) {
                    if (StringUtils.hasText(line)) {
                        try {
                            ApiLog apiLog = JSONUtil.toBean(line, ApiLog.class);
                            if (apiLog != null) {
                                queue.offer(apiLog);
                                if (queue.size() > 1000) {
                                    queue.poll();
                                }
                            }
                        } catch (Exception ex) {
                            // 静默异常，忽略个别行解析错误
                        }
                    }
                }
                RECENT_LOGS.addAll(queue);
                
                // 恢复自增 ID 计数器
                long maxId = queue.stream()
                        .mapToLong(ApiLog::getId)
                        .max()
                        .orElse(0L);
                logIdCounter.set(maxId + 1);
                
                log.info("本地 API 日志历史恢复成功，共恢复数据 {} 条，当前自增 ID 计数器为: {}", RECENT_LOGS.size(), logIdCounter.get());
            } catch (Exception e) {
                log.error("从本地 api-log.log 恢复历史日志失败: ", e);
            }
        } else {
            log.info("未发现本地 api-log.log 文件，跳过历史日志恢复");
        }
    }

    /**
     * 重置日志自增计数器
     */
    public static void clearLogCounter() {
        logIdCounter.set(1);
    }

    /**
     * 环绕拦截所有 Controller（含微信包）中的方法，自动测速并记录耗时到日志表中。
     * 采用主线程同步极速提取上下文数据，跨线程仅用于异步数据库持久化，彻底杜绝 ThreadLocal 跨线程丢失的 Bug。
     */
    @Around("execution(* com.butvan.blog.service.controller..*.*(..)) || execution(* com.butvan.blog.service.weixin.controller..*.*(..))")
    public Object trackCostTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        // 1. 主线程同步解析当前请求网络元数据，防止异步线程 ThreadLocal 丢失
        String ip = "127.0.0.1";
        String uri = "/unknown";
        String methodType = "UNKNOWN";
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ip = IpUtils.getClientIp(request);
                uri = request.getRequestURI();
                methodType = request.getMethod();
            }
        } catch (Exception e) {
            log.warn("API 日志拦截 in main thread 解析网络请求数据发生异常:", e);
        }

        // 2. 主线程同步反射读取标注注解 @TrackApi 的接口中文名称
        String apiName;
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            TrackApi trackApi = method.getAnnotation(TrackApi.class);
            if (trackApi != null && StringUtils.hasText(trackApi.value())) {
                apiName = trackApi.value();
            } else {
                // 降级使用 类名.方法名 作为描述
                apiName = joinPoint.getTarget().getClass().getSimpleName() + "." + method.getName();
            }
        } catch (Exception e) {
            apiName = joinPoint.getSignature().getName();
        }

        Object result;
        try {
            result = joinPoint.proceed();
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            
            // 3. 拷贝不可变参数，在新线程中异步执行耗时的持久化操作，保证零阻塞渲染
            final String finalIp = ip;
            final String finalUri = uri;
            final String finalMethodType = methodType;
            final String finalApiName = apiName;
            
            CompletableFuture.runAsync(() -> {
                try {
                    ApiLog apiLog = ApiLog.builder()
                            .id(logIdCounter.getAndIncrement())
                            .apiName(finalApiName)
                            .method(finalMethodType)
                            .uri(finalUri)
                            .ip(finalIp)
                            .costTime((int) costTime)
                            .createdAt(LocalDateTime.now())
                            .build();

                    // 1. 打印到本地日志文件（JSON格式，自动滚动压缩）
                    apiLogger.info(JSONUtil.toJsonStr(apiLog));

                    // 2. 存入内存滑动队列，用于大屏及平均延迟高速计算
                    RECENT_COST_TIMES.offer(costTime);
                    while (RECENT_COST_TIMES.size() > 100) {
                        RECENT_COST_TIMES.poll();
                    }
                    RECENT_LOGS.offer(apiLog);
                    while (RECENT_LOGS.size() > 1000) {
                        RECENT_LOGS.poll();
                    }

                    // 3. 增加 PV 流量统计：仅前台公开的 GET 请求（排除 /admin/ 和 /ws/）
                    if ("GET".equalsIgnoreCase(finalMethodType) && !finalUri.contains("/admin/") && !finalUri.contains("/ws/")) {
                        try {
                            dailyStatsRepository.incrementTodayPv();
                        } catch (Exception pvEx) {
                            log.warn("AOP异步累加每日流量PV失败: {}", pvEx.getMessage());
                        }
                    }

                    // 4. 广播日志消息到控制台
                    try {
                        JSONObject wsMsg = JSONUtil.createObj();
                        wsMsg.set("type", "api-log");
                        wsMsg.set("data", apiLog);
                        webSocketServer.broadcastApiLog(JSONUtil.toJsonStr(wsMsg));
                    } catch (Exception wsEx) {
                        log.warn("通过 WebSocket 广播 API 日志消息异常:", wsEx);
                    }
                } catch (Exception e) {
                    log.error("API 测速日志本地归档处理失败:", e);
                }
            });
        }
        return result;
    }
}
