# 微信扫码登录 Java 17/21 `sealed` + `record` 现代语法重构指南 (微信官方协议对齐版)

## 1. 重构背景与官方规范对齐

根据微信官方开发文档：
- **[接收普通消息 (Receiving standard messages)](https://developers.weixin.qq.com/doc/service/guide/product/message/Receiving_standard_messages.html)**：`MsgType` 为 `text`、`image` 等。特点是**包含 `MsgId`（64位整型）**，微信建议使用 `MsgId` 进行排重；不包含 `Event`、`EventKey`、`Ticket`。
- **[接收事件推送 (Receiving event pushes)](https://developers.weixin.qq.com/doc/service/guide/product/message/Receiving_event_pushes.html)**：`MsgType` 固定为 `event`。特点是**不包含 `MsgId`**，微信推荐使用 `FromUserName + CreateTime` 进行排重。主要包括：
  1. **直接关注 (`subscribe`)**：用户搜索公众号关注，**无 `EventKey` 和 `Ticket`**。
  2. **带参数二维码扫码关注 (`subscribe`)**：用户未关注时扫码，`EventKey` 带 **`qrscene_` 前缀**，包含 `Ticket`。
  3. **带参数二维码扫码事件 (`SCAN`)**：用户已关注时扫码，`EventKey` **不带前缀（直接为场景值）**，包含 `Ticket`。
  4. **取消关注 (`unsubscribe`)**：无 `EventKey` 和 `Ticket`。

为了完全符合微信官方协议规范，并充分发挥 Java 17/21 `sealed` + `record` 的优雅特性，我们将推送模型抽象为顶层密封树 `WechatPush`。

---

## 2. 核心改造点详解

### 改造点一：微信消息与事件推送模型重构 (`WechatPush`)

#### 微信官方对齐的 Sealed 继承树
定义顶层密封接口 `WechatPush`，分立 **普通消息 (`WechatMessage`)** 与 **事件推送 (`WechatEvent`)**：

```java
package com.butvan.blog.pojo.weixin;

/**
 * 微信推送根密封接口（包含普通消息与事件推送）
 */
public sealed interface WechatPush permits WechatMessage, WechatEvent {

    /** 开发者微信号 */
    String toUserName();


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
