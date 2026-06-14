package com.butvan.blog.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.butvan.blog.pojo.dto.auth.RegisterDTO;
import com.butvan.blog.service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 账号注册接口功能与边界集成测试类
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        // 清理一下历史测试记录（可选，为了不脏库）
    }

    /**
     * 测试用例：用户正常注册流程，密码应加密且返回200状态码
     */
    @Test
    public void testRegisterSuccess() throws Exception {
        String randomUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String randomEmail = randomUsername + "@butvan.com";
        
        RegisterDTO dto = RegisterDTO.builder()
                .username(randomUsername)
                .password("securePassword123")
                .nickname("测试账号")
                .email(randomEmail)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.msg").value("操作成功"));

        // 检查数据库记录确实存在
        assertTrue(userRepository.existsByUsername(randomUsername));
        userRepository.findByUsername(randomUsername).ifPresent(user -> {
            // 验证密码是否已被 BCrypt 加密（以 $2a$ 或 $2y$ 开头）
            assertTrue(user.getPasswordHash().startsWith("$2a$") || user.getPasswordHash().startsWith("$2b$"));
            // 清理测试数据，保持幂等
            userRepository.delete(user);
        });
    }

    /**
     * 测试用例：重复注册相同用户名，预期失败报错
     */
    @Test
    public void testRegisterDuplicateUsername() throws Exception {
        String duplicateName = "dup_" + UUID.randomUUID().toString().substring(0, 8);
        RegisterDTO dto1 = RegisterDTO.builder()
                .username(duplicateName)
                .password("password123")
                .nickname("昵称1")
                .email(duplicateName + "1@butvan.com")
                .build();
                
        RegisterDTO dto2 = RegisterDTO.builder()
                .username(duplicateName)
                .password("differentPassword")
                .nickname("昵称2")
                .email(duplicateName + "2@butvan.com")
                .build();

        // 第一次注册成功
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto1)))
                .andExpect(status().isOk());

        // 第二次同用户名注册失败
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto2)))
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("该用户名已被注册使用"));

        // 清理数据
        userRepository.findByUsername(duplicateName).ifPresent(userRepository::delete);
    }

    /**
     * 测试用例：提交不合法参数（如密码过短、邮箱不符合规范），检验参数拦截器
     */
    @Test
    public void testRegisterInvalidParameters() throws Exception {
        RegisterDTO invalidDto = RegisterDTO.builder()
                .username("us") // 长度不足 3
                .password("123") // 长度不足 6
                .nickname("") // 不能为空
                .email("invalid-email-format") // 错误的邮箱格式
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(jsonPath("$.code").value(400)); // 触发 validation 校验拦截
    }
}
