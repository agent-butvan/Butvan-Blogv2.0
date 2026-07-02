package com.butvan.blog.service.service.impl;

import com.butvan.blog.service.service.WebMetaService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 网站元数据抓取服务实现
 *
 * 使用 Jsoup 解析 HTML，提取：
 * - <title> 或 og:title → 标题
 * - meta description 或 og:description → 描述
 * - favicon（从 <link rel="icon"> 或 /favicon.ico）→ 图标 URL
 */
@Service
@Slf4j
public class WebMetaServiceImpl implements WebMetaService {

    /** 请求超时时间（毫秒） */
    private static final int TIMEOUT_MS = 5000;

    /** User-Agent 模拟浏览器 */
    private static final String USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @Override
    public WebMetaDTO fetchWebMeta(String url) {
        WebMetaDTO result = new WebMetaDTO();
        result.setSuccess(false);

        try {
            // 1. 规范化 URL
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            // 2. 提取域名
            URI uri = URI.create(url);
            result.setDomain(uri.getHost());

            // 3. 获取 HTML 内容
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .ignoreHttpErrors(true)
                    .get();

            // 4. 提取标题（优先 og:title，其次 <title>）
            String title = extractOpenGraph(doc, "og:title");
            if (title == null || title.isEmpty()) {
                Element titleEl = doc.selectFirst("title");
                title = titleEl != null ? titleEl.text() : "";
            }
            result.setTitle(title.trim());

            // 5. 提取描述（优先 og:description，其次 meta description）
            String description = extractOpenGraph(doc, "og:description");
            if (description == null || description.isEmpty()) {
                Element descEl = doc.selectFirst("meta[name=description]");
                description = descEl != null ? descEl.attr("content") : "";
            }
            result.setDescription(description.trim());

            // 6. 提取 favicon
            String favicon = extractFavicon(doc, url);
            result.setFaviconUrl(favicon);

            // 7. 标记成功
            result.setSuccess(true);
            log.info("成功抓取网站元数据: {} | title={}", url, result.getTitle());

        } catch (Exception e) {
            log.error("抓取网站元数据失败: {}", url, e);
            result.setErrorMsg(e.getMessage());
        }

        return result;
    }

    /**
     * 提取 Open Graph 标签值
     */
    private String extractOpenGraph(Document doc, String property) {
        Element el = doc.selectFirst("meta[property=" + property + "]");
        return el != null ? el.attr("content") : null;
    }

    /**
     * 提取 favicon URL
     *
     * 优先级：
     * 1. <link rel="icon" href="...">
     * 2. <link rel="shortcut icon" href="...">
     * 3. /favicon.ico（兜底）
     */
    private String extractFavicon(Document doc, String baseUrl) {
        // 尝试 rel="icon" 或 rel="shortcut icon"
        Element iconLink = doc.selectFirst("link[rel~=icon]");
        if (iconLink != null) {
            String href = iconLink.attr("href");
            if (href != null && !href.isEmpty()) {
                // 处理相对路径
                if (href.startsWith("//")) {
                    return "https:" + href;
                } else if (href.startsWith("/")) {
                    try {
                        URI baseUri = URI.create(baseUrl);
                        return baseUri.getScheme() + "://" + baseUri.getHost() + href;
                    } catch (Exception e) {
                        return href;
                    }
                } else if (!href.startsWith("http")) {
                    // 相对路径，拼接基础 URL
                    try {
                        URI baseUri = URI.create(baseUrl);
                        String basePath = baseUri.getScheme() + "://" + baseUri.getHost();
                        return basePath + "/" + href;
                    } catch (Exception e) {
                        return href;
                    }
                }
                return href;
            }
        }

        // 兜底：返回默认 favicon.ico
        try {
            URI baseUri = URI.create(baseUrl);
            return baseUri.getScheme() + "://" + baseUri.getHost() + "/favicon.ico";
        } catch (Exception e) {
            return null;
        }
    }
}
