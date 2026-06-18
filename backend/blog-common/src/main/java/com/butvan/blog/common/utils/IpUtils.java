package com.butvan.blog.common.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * IP 地址解析工具类
 * 从 HttpServletRequest 中穿透多层反向代理获取客户端真实 IP 地址
 */
public class IpUtils {

    private IpUtils() {
        // 工具类禁止实例化
    }

    /**
     * 从 HTTP 请求中解析客户端真实 IP 地址
     * 依次尝试 X-Forwarded-For、X-Real-IP、Proxy-Client-IP、WL-Proxy-Client-IP，
     * 最终回退到 request.getRemoteAddr()，并将 IPv6 本机回环地址转为 127.0.0.1
     *
     * @param request HttpServletRequest 请求对象
     * @return 客户端真实 IP 地址字符串
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip)) {
            // X-Forwarded-For 可能包含多个 IP（逗号分隔），取第一个真实客户端 IP
            ip = ip.split(",")[0].trim();
        }
        if (!isValidIp(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (!isValidIp(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (!isValidIp(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (!isValidIp(ip)) {
            ip = request.getRemoteAddr();
        }
        // 将 IPv6 本机回环地址统一转换为 IPv4 格式
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    /**
     * 判断 IP 字符串是否有效（非空且不为 unknown）
     *
     * @param ip IP 地址字符串
     * @return 是否为有效的 IP 值
     */
    private static boolean isValidIp(String ip) {
        return ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip);
    }
}
