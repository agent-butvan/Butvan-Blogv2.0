package com.butvan.blog.pojo.weixin;

/**
 * 微信扫码登录业务处理结果密封接口
 */
public sealed interface QrLoginResult permits
        QrLoginResult.Success,
        QrLoginResult.RequireEmail,
        QrLoginResult.QuotaFull,
        QrLoginResult.UserNotFound,
        QrLoginResult.EmailMissing {

    /** 1. 扫码登录/注册成功（携带 userId 与 换码 code） */
    record Success(Long userId, String exchangeCode) implements QrLoginResult {}

    /** 2. 需要引导用户发送邮箱信息进行绑定 */
    record RequireEmail(String openId, String ticket) implements QrLoginResult {}

    /** 3. 注册名额已满（上限 20 人） */
    record QuotaFull(String openId) implements QrLoginResult {}

    /** 4. 微信用户表/用户账号不存在 */
    record UserNotFound(String openId) implements QrLoginResult {}

    /** 5. 账号绑定的邮箱缺失/异常 */
    record EmailMissing(String openId) implements QrLoginResult {}
}
