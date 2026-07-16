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

    /**
     * 环绕拦截所有 Controller 中的方法，自动测速并记录耗时到日志表中。
     * 支持 @TrackApi 注解的自定义名称抓取；如未加注解，则以 "类名.方法名" 作为默认接口描述。
     */
    @Around("execution(* com.butvan.blog.service.controller..*.*(..))")
    public Object trackCostTime(ProceedingJoinPoint joinPoint) throws Throwable {
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
                    
                    // 获取反射方法，提取 @TrackApi 自定义描述
                    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
                    Method method = signature.getMethod();
                    TrackApi trackApi = method.getAnnotation(TrackApi.class);
                    
                    String apiName;
                    if (trackApi != null && StringUtils.hasText(trackApi.value())) {
                        apiName = trackApi.value();
                    } else {
                        // 降级使用 类名.方法名
                        apiName = joinPoint.getTarget().getClass().getSimpleName() + "." + method.getName();
                    }

                    String ip = IpUtils.getClientIp(request);
                    String uri = request.getRequestURI();
                    String methodType = request.getMethod();

                    ApiLog apiLog = ApiLog.builder()
                            .apiName(apiName)
                            .method(methodType)
                            .uri(uri)
                            .ip(ip)
                            .costTime((int) costTime)
                            .build();

                    apiLogRepository.save(apiLog);
                    log.debug("API 测速拦截完成: {} ({} {}) - 耗时 {}ms", apiName, methodType, uri, costTime);
                } catch (Exception e) {
                    log.error("API 测速日志保存异常:", e);
                }
            });
        }
        return result;
    }
}
