package com.butvan.blog.service.aspect;

import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.pojo.entity.ApiLog;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.repository.ApiLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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

    /**
     * 环绕拦截注解了 @TrackApi 的控制器方法，测量接口执行时间并异步入库
     */
    @Around("@annotation(trackApi)")
    public Object trackCostTime(ProceedingJoinPoint joinPoint, TrackApi trackApi) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result;
        try {
            result = joinPoint.proceed();
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            
            // 异步解析并保存请求日志，避免阻塞主接口渲染
            CompletableFuture.runAsync(() -> {
                try {
                    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attributes == null) {
                        return;
                    }
                    HttpServletRequest request = attributes.getRequest();
                    
                    String ip = IpUtils.getClientIp(request);
                    String uri = request.getRequestURI();
                    String method = request.getMethod();
                    String apiName = trackApi.value();

                    ApiLog apiLog = ApiLog.builder()
                            .apiName(apiName)
                            .method(method)
                            .uri(uri)
                            .ip(ip)
                            .costTime((int) costTime)
                            .build();

                    apiLogRepository.save(apiLog);
                    log.debug("API 测速拦截完成: {} ({} {}) - 耗时 {}ms", apiName, method, uri, costTime);
                } catch (Exception e) {
                    log.error("API 测速日志保存异常:", e);
                }
            });
        }
        return result;
    }
}
