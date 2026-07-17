package com.butvan.blog.service.log;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import com.butvan.blog.service.websocket.WebSocketServer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * 自定义 Logback 实时系统控制台 Appender
 * 用于在应用运行期间将所有标准控制台日志秒级捕获并通过 WebSocket 推送给管理页面
 */
@Component
public class WebConsoleAppender extends AppenderBase<ILoggingEvent> implements ApplicationContextAware {

    // 静态 ApplicationContext 容器，让 Logback 自身反射出来的实例共享 SpringBean 访问权限
    private static ApplicationContext applicationContext;
    
    private PatternLayoutEncoder encoder;

    @Override
    public void setApplicationContext(ApplicationContext context) {
        applicationContext = context;
    }

    public PatternLayoutEncoder getEncoder() {
        return encoder;
    }

    public void setEncoder(PatternLayoutEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (event == null || !isStarted()) {
            return;
        }

        // 默认获取原始格式化信息，若定义了 encoder 则输出含前缀格式化信息
        String formattedMessage = event.getFormattedMessage();
        if (encoder != null && encoder.getLayout() != null) {
            formattedMessage = encoder.getLayout().doLayout(event);
        }

        // 动态获取 WebSocketServer 并秒级推向管理员
        if (applicationContext != null) {
            try {
                WebSocketServer webSocketServer = applicationContext.getBean(WebSocketServer.class);
                webSocketServer.sendSystemLog(formattedMessage);
            } catch (Exception e) {
                // 静默异常，避免引发日志打印循环递归死锁
            }
        }
    }
}
