package com.quantumhotel.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quantumhotel.controllers.dto.FaqRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FaqControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldCreateFaqAsAdmin() throws Exception {
        FaqRequest request = new FaqRequest();
        request.setQuestion("What is Quantum Hotel?");
        request.setAnswer("A futuristic hotel.");

        mockMvc.perform(post("/api/faq")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("What is Quantum Hotel?"))
                .andExpect(jsonPath("$.answer").value("A futuristic hotel."));
    }

}
