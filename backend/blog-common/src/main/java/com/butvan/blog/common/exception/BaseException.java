package com.butvan.blog.common.exception;

/**
 * 业务异常基类
 */
public class BaseException extends RuntimeException {
    
    private final int code;

    /**
     * 构造函数
     *
     * @param msg 异常提示信息
     */
    public BaseException(String msg) {
        super(msg);
        this.code = 500;
    }

    /**
     * 构造函数
     *
     * @param code 异常状态码
     * @param msg 异常提示信息
     */
    public BaseException(int code, String msg) {
        super(msg);
        this.code = code;
    }

    /**
     * 获取异常状态码
     *
     * @return 状态码
     */
    public int getCode() {
        return code;
    }
}
