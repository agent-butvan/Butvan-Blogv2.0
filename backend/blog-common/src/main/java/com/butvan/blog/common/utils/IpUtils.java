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
     * 并处理多级反向代理中的内网过滤，最终回退到 request.getRemoteAddr()。
     *
     * @param request HttpServletRequest 请求对象
     * @return 客户端真实 IP 地址字符串
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = null;
        
        // 依次从常见的 HTTP 头部字段获取 IP
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
        };
        
        for (String header : headers) {
            ip = request.getHeader(header);
            if (isValidIp(ip)) {
                break;
            }
        }
        
        // 如果依然为空，使用默认的 remote address
        if (!isValidIp(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // 处理多级反向代理：遍历拆分 X-Forwarded-For 列表，找到第一个非内网的公网 IP 作为真实客户端 IP
        if (ip != null && ip.contains(",")) {
            String[] ipList = ip.split(",");
            for (String subIp : ipList) {
                subIp = subIp.trim();
                if (isValidIp(subIp) && !isInternalIp(subIp)) {
                    return subIp;
                }
            }
            // 如果全都是内网 IP，则取第一个
            ip = ipList[0].trim();
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
        return ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip.trim());
    }

    /**
     * 判定是否为局域网/内网 IP (例如 127.0.0.1, 10.x.x.x, 192.168.x.x, 172.16.x.x-172.31.x.x)
     *
     * @param ip 待判定 IP 地址
     * @return 是否为内网/代理 IP
     */
    private static boolean isInternalIp(String ip) {
        if (ip == null) {
            return true;
        }
        String trimmed = ip.trim();
        if (trimmed.equals("127.0.0.1") || trimmed.startsWith("localhost")) {
            return true;
        }
        // 10.0.0.0 - 10.255.255.255
        if (trimmed.startsWith("10.")) {
            return true;
        }
        // 192.168.0.0 - 192.168.255.255
        if (trimmed.startsWith("192.168.")) {
            return true;
        }
        // 172.16.0.0 - 172.31.255.255
        if (trimmed.startsWith("172.")) {
            try {
                String[] parts = trimmed.split("\\.");
                if (parts.length >= 2) {
                    int second = java.lang.Integer.parseInt(parts[1]);
                    return second >= 16 && second <= 31;
                }
            } catch (java.lang.NumberFormatException e) {
                // 忽略解析失败
            }
        }
        return false;
    }
}
