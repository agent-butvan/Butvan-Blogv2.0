# 微信扫码登录 Java 17/21 `sealed` + `record` 现代语法重构指南

## 1. 重构背景与目标

在当前后端架构中，微信扫码登录涉及**微信推送事件解析**、**多分支状态决策**、**WebSocket 消息通知**及**交换码生成**等核心链路。

在传统的 Java 8 模式下，事件通常由单体大 POJO 表达，通过大量的 `if-else` 和字符串比对进行分支路由，存在以下问题：
1. **多余字段为 null**：例如文本消息包含 `content` 但缺失 `ticket`；关注事件包含 `ticket` 但缺失 `content`。
2. **缺乏编译期约束**：如果新增事件类型，无法在编译期检查处理逻辑是否全覆盖。
3. **DTO 代码臃肿**：频繁使用 Lombok `@Data` / `@Builder` 维护不可变或只读数据载体。

借助 **Java 17 / Java 21** 引入的三大核心新特性：
- **`record`（不可变数据载体）**：自动提供不可变性、`equals` / `hashCode` / `toString`。
- **`sealed interface/class`（密封类/接口）**：严格约束实现继承树，提供封闭类型域。
- **`Pattern Matching for switch`（模式匹配）**：实现解构提取与编译期穷举检查（Exhaustiveness check）。

本文档为手动重构此场景提供清晰、规范、分步的实施指南。

---

## 2. 核心改造点详解

### 改造点一：微信推送事件模型重构 (`WechatEvent`)

#### 现状
原有 `com.butvan.blog.pojo.weixin.EventXmlData` 是一个单体 POJO，集成了 `subscribe`、`SCAN`、`text`、`unsubscribe` 等所有可能字段，造成大量字段值为 `null`，可读性与安全性差。

#### 重构设计
定义 `sealed interface WechatEvent` 密封接口，下面通过 `record` 实现具体的事件类型。

```java
package com.butvan.blog.pojo.weixin;

/**
 * 微信推送事件密封接口
 * <p>限制仅允许以下四种具体的 record 事件实现</p>
 */
public sealed interface WechatEvent permits 
        WechatEvent.Subscribe, 
        WechatEvent.Scan, 
        WechatEvent.TextMessage, 
        WechatEvent.Unsubscribe {

    /**
     * 发送方账号（OpenID）
     */
    String fromUserName();

    /**
     * 开发者微信号
     */
    String toUserName();

    /**
     * 消息创建时间
     */
    int createTime();

    /**
     * 首次扫码关注事件
     */
    record Subscribe(
        String fromUserName,
        String toUserName,
        int createTime,
        String ticket,
        String eventKey
    ) implements WechatEvent {}

    /**
     * 已关注扫码事件
     */
    record Scan(
        String fromUserName,
        String toUserName,
        int createTime,
        String ticket,
        String eventKey
    ) implements WechatEvent {}

    /**
     * 用户发送文本消息（如发送邮箱地址）
     */
    record TextMessage(
        String fromUserName,
        String toUserName,
        int createTime,
        String content,
        long msgId
    ) implements WechatEvent {}

    /**
     * 取消关注事件
     */
    record Unsubscribe(
        String fromUserName,
        String toUserName,
        int createTime
    ) implements WechatEvent {}
}
```

---

### 改造点二：事件路由分发重构 (`switch` 模式匹配)

#### 现状
在 `WeiXinEventServiceImpl.java` 中，事件分支依靠繁琐的字符串 `equals` 校验：
```java
if (eventXmlData.getMsgType().equals("event") && eventXmlData.getEvent().equals("subscribe")) { ... }
else if (eventXmlData.getMsgType().equals("event") && eventXmlData.getEvent().equals("SCAN")) { ... }
else if (eventXmlData.getMsgType().equals("text")) { ... }
else if (eventXmlData.getMsgType().equals("event") && eventXmlData.getEvent().equals("unsubscribe")) { ... }
```

#### 重构设计
工厂或转换工具将 XML 转为 `WechatEvent` 之后，在 `handleEvent` 中使用 Java 21 `switch` 模式匹配：

```java
private void handleEvent(WechatEvent event) {
    switch (event) {
        case WechatEvent.Subscribe sub -> userFirstRegister(sub);
        case WechatEvent.Scan scan -> userLogin(scan);
        case WechatEvent.TextMessage text -> userText(text);
        case WechatEvent.Unsubscribe unsub -> userUnSubscribe(unsub);
    }
}
```

**优势**：
1. 无需 `default` 分支，当 `sealed interface` 新增事件类型时，编译器会在 `switch` 处强行报错提醒处理。
2. 方法入参直接变为具体的 Record（如 `userFirstRegister(WechatEvent.Subscribe event)`），无需在方法内强转或再次判空。

---

### 改造点三：WebSocket 推送消息建模 (`WsNotice`)

#### 现状
推送前端 WebSocket 消息时，使用通用的 `WebSocketMessageBase`：
```java
WebSocketMessageBase webSocketMessageBase = WebSocketMessageBase.builder()
        .code(200)
        .event("login")
        .message("登录成功！")
        .data(data)
        .build();
```

#### 重构设计
定义 `sealed interface WsNotice` 规范推送前端的所有消息消息体：

```java
package com.butvan.blog.pojo.dto.common;

/**
 * WebSocket 推送消息密封接口
 */
public sealed interface WsNotice permits 
        WsNotice.QrScanned, 
        WsNotice.LoginSuccess, 
        WsNotice.EmailException {

    int code();
    String event();
    String message();

    /** 1. 扫码成功通知 */
    record QrScanned() implements WsNotice {
        public int code() { return 200; }
        public String event() { return "weixin"; }
        public String message() { return "二维码被扫描"; }
    }

    /** 2. 登录/注册成功通知 */
    record LoginSuccess(String exchangeCode) implements WsNotice {
        public int code() { return 200; }
        public String event() { return "login"; }
        public String message() { return "登录成功！"; }
    }

    /** 3. 邮箱异常通知 */
    record EmailException() implements WsNotice {
        public int code() { return 500; }
        public String event() { return "login"; }
        public String message() { return "邮箱信息异常或已过期,请尝试重新发送邮箱信息至公众号"; }
    }
}
```

---

### 改造点四：只读响应 DTO 改造 (`AuthLoginDto`)

#### 现状 (`AuthLoginDto.java`)
```java
@Data
@Builder
public class AuthLoginDto {
    private String qrUrl;
    private String wsId;
}
```

#### 重构设计
直接重构为 `record`：
```java
package com.butvan.blog.pojo.weixin;

/**
 * 客户端获取二维码 DTO
 */
public record AuthLoginDto(
    String qrUrl,
    String wsId
) {}
```
**优势**：Jackson (2.12+) 原生天然支持 record 序列化与反序列化，彻底消除 Lombok setter 带来的潜在误修改风险。

---

### 改造点五：微信扫码登录结果/状态机建模 (`QrLoginResult`)

#### 重构设计
定义扫码登录业务领域结果受控集：

```java
package com.butvan.blog.pojo.weixin;

/**
 * 微信扫码登录业务处理结果密封接口
 */
public sealed interface QrLoginResult permits 
        QrLoginResult.Success, 
        QrLoginResult.RequireEmail, 
        QrLoginResult.QuotaFull, 
        QrLoginResult.Expired {

    /** 登录/绑定成功，携带 userId 和一次性 exchangeCode */
    record Success(Long userId, String exchangeCode) implements QrLoginResult {}

    /** 尚未绑定邮箱，提示用户发送邮箱 */
    record RequireEmail(String openId, String ticket) implements QrLoginResult {}

    /** 微信用户名额已满 */
    record QuotaFull(String openId) implements QrLoginResult {}

    /** 二维码/Ticket 已过期 */
    record Expired() implements QrLoginResult {}
}
```

---

## 3. 手动改造建议步骤清单

1. **第一步：POJO 层改造**
   - 新建 `WechatEvent.java`（密封接口 + 4 个 Record 事件）。
   - 将 `AuthLoginDto.java` 重构为 `record`。
   - 新建 `WsNotice.java`（密封接口 + 3 个 Record 推送对象）。
   - (可选) 新建 `QrLoginResult.java`。

2. **第二步：解析工具层支持**
   - 在 `FieldPrinterUtil` 或 XML 解析服务中，增加依据 `msgType` / `event` 节点生成对应的 `WechatEvent` 实例的转换逻辑。

3. **第三步：Service 层处理改造 (`WeiXinEventServiceImpl.java`)**
   - 将 `handleEvent(EventXmlData data)` 替换为 `handleEvent(WechatEvent event)`。
   - 使用 `switch(event)` 模式匹配重构四个分支方法 (`userFirstRegister`, `userLogin`, `userText`, `userUnSubscribe`)。
   - 重构 WebSocket 消息发送逻辑，使用 `WsNotice` 替代手构 Map。

4. **第四步：Controller 及测试套件验证**
   - 验证后端打包编译：`mvn clean compile` 或在 IDE 中进行无报错检查。
   - 进行微信扫码登录本地全流程联调。
