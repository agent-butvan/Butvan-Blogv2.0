package com.butvan.blog.common.utils;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * HEIC/HEIF 图片格式转换工具类
 * <p>
 * 通过调用系统命令行工具将 HEIC/HEIF 格式转换为 JPEG：
 * <ul>
 *     <li>macOS：使用系统自带的 sips 命令</li>
 *     <li>Linux：使用 libheif-tools 提供的 heif-convert 命令（需在 Dockerfile 中安装）</li>
 * </ul>
 * </p>
 */
@Slf4j
public class HeicConverterUtil {

    private static final boolean IS_MAC;
    private static final boolean IS_LINUX;

    static {
        String osName = System.getProperty("os.name", "").toLowerCase();
        IS_MAC = osName.contains("mac");
        IS_LINUX = osName.contains("linux");
    }

    private HeicConverterUtil() {
    }

    /**
     * 判断文件是否为 HEIC/HEIF 格式
     *
     * @param extension 文件扩展名（小写）
     * @return true 表示是 HEIC/HEIF 格式
     */
    public static boolean isHeicFormat(String extension) {
        return "heic".equalsIgnoreCase(extension) || "heif".equalsIgnoreCase(extension);
    }

    /**
     * 将 HEIC/HEIF 文件转换为 JPEG 字节数组
     * <p>
     * 利用系统临时目录进行中转转换，转换完成后自动清理临时文件。
     * </p>
     *
     * @param heicBytes 原始 HEIC 文件字节
     * @return 转换后的 JPEG 字节数组
     * @throws IOException 转换失败时抛出
     */
    public static byte[] convertToJpeg(byte[] heicBytes) throws IOException {
        Path tempInput = null;
        Path tempOutput = null;
        try {
            // 创建临时文件
            tempInput = Files.createTempFile("heic_convert_", ".heic");
            tempOutput = Path.of(tempInput.toString().replace(".heic", ".jpg"));
            Files.write(tempInput, heicBytes);

            // 根据操作系统选择转换命令
            if (IS_MAC) {
                convertWithSips(tempInput, tempOutput);
            } else if (IS_LINUX) {
                convertWithHeifConvert(tempInput, tempOutput);
            } else {
                throw new IOException("当前操作系统不支持 HEIC 转换（仅支持 macOS 和 Linux）");
            }

            // 读取转换后的 JPEG 文件
            if (!Files.exists(tempOutput)) {
                throw new IOException("HEIC 转换失败，输出文件未生成");
            }
            byte[] jpegBytes = Files.readAllBytes(tempOutput);
            log.info("HEIC 转换 JPEG 成功，原始大小: {} bytes，转换后: {} bytes", heicBytes.length, jpegBytes.length);
            return jpegBytes;

        } finally {
            // 清理临时文件
            deleteQuietly(tempInput);
            deleteQuietly(tempOutput);
        }
    }

    /**
     * 使用 macOS 自带的 sips 命令转换
     */
    private static void convertWithSips(Path input, Path output) throws IOException {
        ProcessBuilder pb = new ProcessBuilder(
                "sips", "-s", "format", "jpeg", input.toString(), "--out", output.toString()
        );
        executeConvert(pb, "sips");
    }

    /**
     * 使用 Linux 下的 heif-convert 命令转换（需安装 libheif-tools）
     */
    private static void convertWithHeifConvert(Path input, Path output) throws IOException {
        ProcessBuilder pb = new ProcessBuilder(
                "heif-convert", input.toString(), output.toString()
        );
        executeConvert(pb, "heif-convert");
    }

    /**
     * 执行转换命令并检查结果
     */
    private static void executeConvert(ProcessBuilder pb, String toolName) throws IOException {
        pb.redirectErrorStream(true);
        Process process = pb.start();
        try {
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IOException(toolName + " 转换超时（30s）");
            }
            if (process.exitValue() != 0) {
                String errorOutput = new String(process.getInputStream().readAllBytes());
                throw new IOException(toolName + " 转换失败，退出码: " + process.exitValue() + "，输出: " + errorOutput);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException(toolName + " 转换被中断", e);
        }
    }

    /**
     * 安静地删除文件，忽略异常
     */
    private static void deleteQuietly(Path path) {
        if (path != null) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                log.debug("清理临时文件失败: {}", path, e);
            }
        }
    }
}
