package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.SiteConfig;
import com.butvan.blog.pojo.vo.site.SiteConfigVO;
import com.butvan.blog.service.repository.SiteConfigRepository;
import com.butvan.blog.service.service.SiteConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 站点配置服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SiteConfigServiceImpl implements SiteConfigService {

    private final SiteConfigRepository siteConfigRepository;

    @Override
    public SiteConfigVO getConfig(String configKey) {
        return siteConfigRepository.findByConfigKey(configKey)
                .map(config -> SiteConfigVO.builder()
                        .configKey(config.getConfigKey())
                        .configValue(config.getConfigValue())
                        .build())
                .orElse(SiteConfigVO.builder()
                        .configKey(configKey)
                        .configValue("")
                        .build());
    }

    @Override
    public void setConfig(String configKey, String configValue) {
        SiteConfig config = siteConfigRepository.findByConfigKey(configKey)
                .orElse(SiteConfig.builder()
                        .configKey(configKey)
                        .configType("string")
                        .description("")
                        .build());
        config.setConfigValue(configValue);
        siteConfigRepository.save(config);
        log.info("站点配置已更新：{} = {}", configKey, configValue);
    }
}
