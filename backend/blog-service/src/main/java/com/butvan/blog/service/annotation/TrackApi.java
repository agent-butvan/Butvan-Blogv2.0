package com.butvan.blog.service.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * API 请求耗时与测速跟踪统计自定义注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TrackApi {
    /**
     * 接口功能描述名称（如：获取仪表盘统计数据）
     */
    String value() default "";
}
