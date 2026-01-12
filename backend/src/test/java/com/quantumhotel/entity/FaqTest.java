
package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class FaqTest {

    private Faq faq;
    private User user;

    @BeforeEach
    void init() {
        user = new User();
        user.setUsername("janedoe");

        faq = new Faq();
        faq.setId(1L);
        faq.setQuestion("What is Quantum Hotel?");
        faq.setAnswer("A futuristic hotel.");
        faq.setCreatedAt(Instant.now());
        faq.setEditedAt(Instant.now());
        faq.setCreatedBy(user);
    }

    @Test
    void testFaqProperties() {
        assertNotNull(faq);
        assertEquals(1L, faq.getId());
        assertEquals("What is Quantum Hotel?", faq.getQuestion());
        assertEquals("A futuristic hotel.", faq.getAnswer());
        assertNotNull(faq.getCreatedAt());
        assertNotNull(faq.getEditedAt());
        assertEquals("janedoe", faq.getCreatedBy().getUsername());
    }
}
