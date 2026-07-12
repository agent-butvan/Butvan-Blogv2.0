package com.butvan.blog.common.utils;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.XmlUtil;
import com.butvan.blog.common.annotation.FieldLabel;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * 字段自动打印工具类
 * <p>
 * 支持将 XML 字符串解析为 Java Bean，并自动打印所有带 @FieldLabel 注解的字段。
 * 使用方式：
 * <pre>
 *     EventXmlData data = FieldPrinterUtil.xmlToBean(xmlData, EventXmlData.class);
 * </pre>
 */
@Slf4j
public final class FieldPrinterUtil {

    private FieldPrinterUtil() {
    }

    /**
     * 将 XML 字符串解析为指定类型的 Bean，并自动打印所有带 @FieldLabel 注解的字段
     * <p>
     * 注意：
     * 1. XmlUtil.xmlToBean() 将传入节点本身作为属性名匹配，微信XML根节点为 {@code <xml>}，与 Bean 字段不匹配
     * 2. Hutool 5.8.36 的 BeanUtil.fillBeanWithMap(ignoreCase=true) 实际上无法正确匹配 PascalCase→camelCase
     * 因此手动将 map 的 key 转为 camelCase 后再调用 BeanUtil.toBean()
     *
     * @param xmlData   XML 格式的字符串
     * @param beanClass 目标 Bean 类型
     * @param <T>       Bean 泛型
     * @return 填充好数据的 Bean 实例
     */
    public static <T> T xmlToBean(String xmlData, Class<T> beanClass) {
        Map<String, Object> rawMap = XmlUtil.xmlToMap(xmlData);
        // 将 map 的 key 从 PascalCase 转为 camelCase（ToUserName → toUserName）
        Map<String, Object> camelMap = new HashMap<>(rawMap.size());
        for (Map.Entry<String, Object> entry : rawMap.entrySet()) {
            camelMap.put(StrUtil.lowerFirst(entry.getKey()), entry.getValue());
        }
        T bean = BeanUtil.toBean(camelMap, beanClass);
        printLabeledFields(bean);
        return bean;
    }

    /**
     * 反射遍历对象所有带 @FieldLabel 注解的字段，并以"中文标签(字段名)=值"格式输出到日志
     *
     * @param obj 需要打印字段的对象
     */
    public static void printLabeledFields(Object obj) {
        if (obj == null) {
            log.info("printLabeledFields: 传入对象为 null");
            return;
        }
        String className = obj.getClass().getSimpleName();
        StringJoiner joiner = new StringJoiner(", ", className + " [", "]");
        for (Field field : obj.getClass().getDeclaredFields()) {
            FieldLabel label = field.getAnnotation(FieldLabel.class);
            if (label == null) {
                continue;
            }
            field.setAccessible(true);
            try {
                Object value = field.get(obj);
                joiner.add(label.value() + "(" + field.getName() + ")=" + value);
            } catch (IllegalAccessException e) {
                joiner.add(label.value() + "(" + field.getName() + ")=<无法访问>");
            }
        }
        log.info(joiner.toString());
    }
}
