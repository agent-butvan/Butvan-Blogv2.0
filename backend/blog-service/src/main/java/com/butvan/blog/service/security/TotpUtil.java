package com.butvan.blog.service.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * 双重验证 TOTP 算法及 Base32 编解码辅助类
 * 遵循 RFC 6238 标准，无需外部依赖
 */
public class TotpUtil {

    private static final int TIME_WINDOW_SIZE = 30; // 30秒为一个步长
    private static final int CODE_LENGTH = 6;       // 6位验证码

    /**
     * 生成一个随机的 16 字符 Base32 安全密钥
     *
     * @return 密钥字符串
     */
    public static String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[10]; // 80 bits 密钥强度，符合 RFC 建议
        random.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    /**
     * 校验 TOTP 动态验证码（支持允许前后 30 秒的偏移，以容忍网络延时或客户端时钟偏移）
     *
     * @param secret   密钥 (Base32 编码)
     * @param codeStr  待校验的 6 位验证码字符
     * @return 校验通过返回 true，否则返回 false
     */
    public static boolean verifyCode(String secret, String codeStr) {
        if (secret == null || codeStr == null) {
            return false;
        }
        int code;
        try {
            code = Integer.parseInt(codeStr.trim());
        } catch (NumberFormatException e) {
            return false;
        }

        byte[] decodedKey = decodeBase32(secret);
        if (decodedKey == null || decodedKey.length == 0) {
            return false;
        }

        long currentInterval = System.currentTimeMillis() / 1000 / TIME_WINDOW_SIZE;

        // 允许当前步长、前一步长、后一步长校验（容忍±30秒时差）
        for (int i = -1; i <= 1; i++) {
            long steps = currentInterval + i;
            if (verifyCodeForInterval(decodedKey, steps, code)) {
                return true;
            }
        }
        return false;
    }

    private static boolean verifyCodeForInterval(byte[] decodedKey, long steps, int code) {
        byte[] data = new byte[8];
        long value = steps;
        for (int i = 8; i-- > 0; value >>>= 8) {
            data[i] = (byte) (value & 0xFF);
        }

        SecretKeySpec signKey = new SecretKeySpec(decodedKey, "HmacSHA1");
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(signKey);
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0xF;
            long truncatedHash = 0;
            for (int i = 0; i < 4; ++i) {
                truncatedHash <<= 8;
                truncatedHash |= (hash[offset + i] & 0xFF);
            }

            truncatedHash &= 0x7FFFFFFF;
            truncatedHash %= Math.pow(10, CODE_LENGTH);

            return truncatedHash == code;
        } catch (GeneralSecurityException e) {
            return false;
        }
    }

    /**
     * 自定义 Base32 编码实现
     */
    private static String encodeBase32(byte[] bytes) {
        char[] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();
        StringBuilder sb = new StringBuilder();
        int i = 0, index = 0, digit;
        int currByte, nextByte;
        while (i < bytes.length) {
            currByte = (bytes[i] >= 0) ? bytes[i] : (bytes[i] + 256);
            if (index > 3) {
                if (i + 1 < bytes.length) {
                    nextByte = (bytes[i + 1] >= 0) ? bytes[i + 1] : (bytes[i + 1] + 256);
                } else {
                    nextByte = 0;
                }
                digit = currByte & (0xFF >> index);
                index = (index + 5) % 8;
                digit <<= index;
                digit |= nextByte >> (8 - index);
                i++;
            } else {
                digit = (currByte >> (8 - (index + 5))) & 0x1F;
                index = (index + 5) % 8;
                if (index == 0) {
                    i++;
                }
            }
            sb.append(chars[digit]);
        }
        return sb.toString();
    }

    /**
     * 自定义 Base32 解码实现，对无效字符及填充符进行静默容错
     */
    private static byte[] decodeBase32(String base32) {
        String base32Upper = base32.toUpperCase();
        int[] lookup = new int[256];
        Arrays.fill(lookup, -1);
        char[] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();
        for (int i = 0; i < chars.length; i++) {
            lookup[chars[i]] = i;
        }

        int len = (base32Upper.length() * 5) / 8;
        byte[] bytes = new byte[len];
        int i = 0, index = 0, offset = 0;
        while (i < base32Upper.length()) {
            char c = base32Upper.charAt(i);
            int digit = lookup[c];
            if (digit == -1) {
                i++;
                continue;
            }
            if (offset <= 3) {
                offset = (offset + 5) % 8;
                if (offset == 0) {
                    bytes[index] |= digit;
                    index++;
                } else {
                    bytes[index] |= (digit << (8 - offset));
                }
            } else {
                offset = (offset + 5) % 8;
                bytes[index] |= (digit >>> offset);
                index++;
                if (index < bytes.length) {
                    bytes[index] |= (digit << (8 - offset));
                }
            }
            i++;
        }
        return bytes;
    }
}
