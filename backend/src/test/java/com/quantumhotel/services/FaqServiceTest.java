package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.FaqResponse;
import com.quantumhotel.entity.Faq;
import com.quantumhotel.repository.FaqRepository;
import com.quantumhotel.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class FaqServiceTest {

    @Mock
    private FaqRepository faqRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FaqService faqService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldReturnAllFaqsSortedByCreatedAtDesc() {
        Faq faq1 = new Faq();
        faq1.setId(1L);
        faq1.setQuestion("Q1");
        faq1.setAnswer("A1");
        faq1.setCreatedAt(Instant.now().minusSeconds(60));

        Faq faq2 = new Faq();
        faq2.setId(2L);
        faq2.setQuestion("Q2");
        faq2.setAnswer("A2");
        faq2.setCreatedAt(Instant.now());

        when(faqRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")))
                .thenReturn(List.of(faq2, faq1));

        List<FaqResponse> result = faqService.findAll();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("Q2", result.get(0).getQuestion());
        assertEquals("A2", result.get(0).getAnswer());

        assertEquals("Q1", result.get(1).getQuestion());
        assertEquals("A1", result.get(1).getAnswer());
    }
}
