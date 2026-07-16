package com.butvan.blog.service.aspect;

import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.repository.ApiLogRepository;
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
import java.util.concurrent.CompletableFuture;

/**
 * 接口测速与日志拦截统一处理切面
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiLogAspect {

    private final ApiLogRepository apiLogRepository;
    private final WebSocketServer webSocketServer;

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
                            .apiName(finalApiName)
                            .method(finalMethodType)
                            .uri(finalUri)
                            .ip(finalIp)
                            .costTime((int) costTime)
                            .build();

                    apiLogRepository.save(apiLog);
                    log.debug("API 测速拦截并异步入库完成: {} ({} {}) - 耗时 {}ms", finalApiName, finalMethodType, finalUri, costTime);

                    // 广播日志消息到控制台
                    try {
                        cn.hutool.json.JSONObject wsMsg = cn.hutool.json.JSONUtil.createObj();
                        wsMsg.set("type", "api-log");
                        if (apiLog.getCreatedAt() == null) {
                            apiLog.setCreatedAt(java.time.LocalDateTime.now());
                        }
                        wsMsg.set("data", apiLog);
                        webSocketServer.sendToAll(cn.hutool.json.JSONUtil.toJsonStr(wsMsg));
                    } catch (Exception wsEx) {
                        log.warn("通过 WebSocket 广播 API 日志消息异常:", wsEx);
                    }
                } catch (Exception e) {
                    log.error("API 测速日志持久化至数据库失败:", e);
                }
            });
        }
        return result;
    }
}
