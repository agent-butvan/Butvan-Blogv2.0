package com.butvan.blog.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.butvan.blog.pojo.entity.Navigation;
import com.butvan.blog.service.repository.NavigationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 导航菜单获取接口及层级装配集成测试类
 */
@SpringBootTest
@AutoConfigureMockMvc
public class NavigationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NavigationRepository navigationRepository;

    /**
     * 测试用例：匿名成功获取树状导航菜单
     * 校验 parentId 级联树装载正确，且排序正确，且处于安全白名单无阻拦状态
     */
    @Test
    public void testGetNavigationsTreeSuccess() throws Exception {
        // 1. 在数据库中写入一组测试用的父子菜单（ADMIN_SIDEBAR）
        Navigation parent = Navigation.builder()
                .title("父菜单")
                .linkType("NONE")
                .position("ADMIN_SIDEBAR")
                .sortOrder(10)
                .isVisible(true)
                .isOpenNewTab(false)
                .build();
        parent = navigationRepository.save(parent);

        Navigation child = Navigation.builder()
                .title("子菜单")
                .parentId(parent.getId())
                .linkType("INTERNAL")
                .linkUrl("/child")
                .position("ADMIN_SIDEBAR")
                .sortOrder(1)
                .isVisible(true)
                .isOpenNewTab(false)
                .build();
        child = navigationRepository.save(child);

        // 2. 调用 /api/navigations API 并校验 JSON
        mockMvc.perform(get("/api/navigations")
                        .param("position", "ADMIN_SIDEBAR")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                // 确保顶级父节点包含此子节点
                .andExpect(jsonPath("$.data[?(@.id == " + parent.getId() + ")].children[0].id").value(child.getId().intValue()))
                .andExpect(jsonPath("$.data[?(@.id == " + parent.getId() + ")].children[0].title").value("子菜单"));

        // 3. 清理测试数据
        navigationRepository.delete(child);
        navigationRepository.delete(parent);
    }
}
