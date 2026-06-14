package com.butvan.blog.common.exception;

/**
 * 业务具体异常
 */
public class BusinessException extends BaseException {

    /**
     * 构造函数
     *
     * @param msg 异常描述
     */
    public BusinessException(String msg) {
        super(500, msg);
    }

    /**
     * 构造函数
     *
     * @param code 异常状态码
     * @param msg 异常描述
     */
    public BusinessException(int code, String msg) {
        super(code, msg);
    }
}
