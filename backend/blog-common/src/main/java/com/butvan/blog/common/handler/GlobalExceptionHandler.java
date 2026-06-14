package com.butvan.blog.common.handler;

import com.butvan.blog.common.exception.BaseException;
import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.stream.Collectors;

/**
 * REST 接口全局异常拦截处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 捕获自定义业务逻辑异常
     *
     * @param e 异常对象
     * @return 统一结果响应
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.warn("业务运行异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 捕获业务基础异常
     *
     * @param e 异常对象
     * @return 统一结果响应
     */
    @ExceptionHandler(BaseException.class)
    public Result<?> handleBaseException(BaseException e) {
        log.error("基础业务异常: {}", e.getMessage(), e);
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 捕获 MethodArgumentNotValidException (RequestBody 参数校验异常)
     *
     * @param e 异常对象
     * @return 统一结果响应
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String errors = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("RequestBody 参数校验未通过: {}", errors);
        return Result.error(400, errors);
    }

    /**
     * 捕获 BindException (RequestParam/PathVariable 参数校验异常)
     *
     * @param e 异常对象
     * @return 统一结果响应
     */
    @ExceptionHandler(BindException.class)
    public Result<?> handleBindException(BindException e) {
        String errors = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("请求参数绑定校验未通过: {}", errors);
        return Result.error(400, errors);
    }

    /**
     * 捕获全局未分类系统异常
     *
     * @param e 异常对象
     * @return 统一结果响应
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统运行发生未知异常: ", e);
        return Result.error(500, "服务器运行异常，请稍后再试");
    }
}
