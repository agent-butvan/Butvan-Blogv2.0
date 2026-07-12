package com.butvan.blog.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 字段中文标签注解，用于运行时通过反射获取字段的中文描述信息，
 * 配合 FieldPrinterUtil 实现对象创建后自动打印所有字段
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldLabel {
    /** 字段的中文描述 */
    String value();
}
