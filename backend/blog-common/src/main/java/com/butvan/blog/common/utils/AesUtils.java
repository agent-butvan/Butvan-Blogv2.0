package com.butvan.blog.common.utils;

import lombok.extern.slf4j.Slf4j;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * AES 对称加解密工具类，用于动态数据库密码安全存储
 */
@Slf4j
public class AesUtils {

    // 系统固定盐值 (16字节，128位 AES)
    private static final String KEY = "VB_Blog_Db_Salt!";

    /**
     * 加密
     *
     * @param data 明文
     * @return 密文
     */
    public static String encrypt(String data) {
        if (data == null) {
            return null;
        }
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("AES加密失败", e);
            throw new RuntimeException("加密数据库密码失败", e);
        }
    }

    /**
     * 解密
     *
     * @param data 密文
     * @return 明文
     */
    public static String decrypt(String data) {
        if (data == null) {
            return null;
        }
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(data));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("AES解密失败", e);
            throw new RuntimeException("解密数据库密码失败", e);
        }
    }
}
