package com.butvan.blog.common.utils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * 字符转 URL Slug 工具类
 */
public class SlugUtils {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern DUP_HYPHEN = Pattern.compile("-{2,}");

    /**
     * 将标题转为 URL 友好的 Slug
     * 英文会转为小写和短横线，中文等非拉丁字符会转为编码以保证 URL 安全
     *
     * @param input 原始文本
     * @return 格式化后的 Slug
     */
    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        
        // 1. 将空格替换为短横线
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        
        // 2. 将非拉丁/非数字/非短横线字符转为安全字符。为了安全处理中文，直接做部分保留与编码处理
        StringBuilder sb = new StringBuilder();
        for (char c : nowhitespace.toCharArray()) {
            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
                sb.append(c);
            } else if (c == '/') {
                sb.append("-");
            } else {
                // 对中文字符转为 URL 编码形式，保证 URL 友好与标准
                String encoded = URLEncoder.encode(String.valueOf(c), StandardCharsets.UTF_8);
                sb.append(encoded);
            }
        }
        
        String result = sb.toString().toLowerCase(Locale.ENGLISH);
        
        // 3. 替换多个连续的短横线
        result = DUP_HYPHEN.matcher(result).replaceAll("-");
        
        // 4. 去除首尾的短横线
        if (result.startsWith("-")) {
            result = result.substring(1);
        }
        if (result.endsWith("-")) {
            result = result.substring(0, result.length() - 1);
        }
        
        return result;
    }
}
