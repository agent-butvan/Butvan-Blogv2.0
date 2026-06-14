package com.butvan.blog.common.result;

import lombok.Data;
import java.io.Serializable;

/**
 * 统一响应包装器
 *
 * @param <T> 数据类型
 */
@Data
public class Result<T> implements Serializable {

    private Integer code; // 状态码：200 成功，其他失败
    private String msg;   // 提示信息
    private T data;       // 数据对象

    /**
     * 快捷构建成功响应
     *
     * @param <T> 数据类型
     * @return 响应结果
     */
    public static <T> Result<T> success() {
        Result<T> result = new Result<>();
        result.code = 200;
        result.msg = "操作成功";
        return result;
    }

    /**
     * 快捷构建带数据的成功响应
     *
     * @param data 响应数据
     * @param <T> 数据类型
     * @return 响应结果
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.code = 200;
        result.msg = "操作成功";
        result.data = data;
        return result;
    }

    /**
     * 快捷构建失败响应
     *
     * @param msg 错误提示
     * @param <T> 数据类型
     * @return 响应结果
     */
    public static <T> Result<T> error(String msg) {
        Result<T> result = new Result<>();
        result.code = 500;
        result.msg = msg;
        return result;
    }

    /**
     * 自定义状态码的失败响应
     *
     * @param code 状态码
     * @param msg 错误提示
     * @param <T> 数据类型
     * @return 响应结果
     */
    public static <T> Result<T> error(Integer code, String msg) {
        Result<T> result = new Result<>();
        result.code = code;
        result.msg = msg;
        return result;
    }
}
