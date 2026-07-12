package com.butvan.blog.common.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 邮箱提取工具类
 * <p>从用户发送的文本消息中提取有效邮箱地址，忽略其他干扰内容。</p>
 *
 * <h3>使用示例</h3>
 * <pre>{@code
 * EmailUtils.extractEmail("test@qq.com");                      // → "test@qq.com"
 * EmailUtils.extractEmail("我的邮箱是 user@gmail.com 谢谢");     // → "user@gmail.com"
 * EmailUtils.extractEmail("没有邮箱的文本");                      // → null
 * EmailUtils.extractEmail(null);                                // → null
 * }</pre>
 */
public class EmailUtils {

    /** 标准邮箱正则（覆盖常见域名后缀，如 .com .cn .co.jp .io 等） */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
    );

    private EmailUtils() {
        // 工具类禁止实例化
    }

    /**
     * 从文本中提取第一个有效的邮箱地址
     *
     * @param text 用户发送的原始文本
     * @return 提取到的邮箱地址，未找到或文本为空则返回 null
     */
    public static String extractEmail(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        Matcher matcher = EMAIL_PATTERN.matcher(text.trim());
        return matcher.find() ? matcher.group() : null;
    }

    /**
     * 校验文本是否为合法邮箱格式（严格匹配整个字符串）
     *
     * @param text 待校验文本
     * @return true 表示是合法邮箱
     */
    public static boolean isValidEmail(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(text.trim()).matches();
    }
}
