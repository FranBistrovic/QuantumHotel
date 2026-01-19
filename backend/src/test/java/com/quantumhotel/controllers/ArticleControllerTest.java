package com.quantumhotel.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quantumhotel.controllers.dto.ArticleRequest;
import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User user = new User();
            user.setUsername("admin");
            userRepository.save(user);
        }
    }

    @Test
    @WithMockUser(username = "admin", roles = {"STAFF"})
    void shouldCreateArticle() throws Exception {
        ArticleRequest request = new ArticleRequest();
        request.setTitle("Test Article");
        request.setDescription("Test Description");

        mockMvc.perform(post("/api/articles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Article"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }
}