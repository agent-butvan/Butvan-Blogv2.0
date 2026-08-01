package com.butvan.blog.pojo.dto.common;

import java.util.Map;

/**
 * WebSocket 推送消息密封接口
 */
public sealed interface WsNotice permits
        WsNotice.QrScanned,
        WsNotice.LoginSuccess,
        WsNotice.EmailException {

    int getCode();

    String getEvent();

    String getMessage();

    /** 1. 扫码成功通知 */
    record QrScanned(int code, String event, String message) implements WsNotice {
        public QrScanned() {
            this(200, "weixin", "二维码被扫描");
        }

        public int getCode() {
            return code;
        }

        public String getEvent() {
            return event;
        }

        public String getMessage() {
            return message;
        }
    }

    /** 2. 登录/注册成功通知 */
    record LoginSuccess(int code, String event, String message, Map<String, Object> data) implements WsNotice {
        public LoginSuccess(String message, Map<String, Object> data) {
            this(200, "login", message, data);
        }

        public static LoginSuccess of(String message, String exchangeCode) {
            return new LoginSuccess(message, Map.of("exchangeCode", exchangeCode));
        }

        public int getCode() {
            return code;
        }

        public String getEvent() {
            return event;
        }

        public String getMessage() {
            return message;
        }

        public Map<String, Object> getData() {
            return data;
        }
    }

    /** 3. 邮箱异常通知 */
    record EmailException(int code, String event, String message) implements WsNotice {
        public EmailException() {
            this(500, "login", "邮箱信息异常或已过期,请尝试重新发送邮箱信息至公众号");
        }

        public int getCode() {
            return code;
        }

        public String getEvent() {
            return event;
        }

        public String getMessage() {
            return message;
        }
    }
}
