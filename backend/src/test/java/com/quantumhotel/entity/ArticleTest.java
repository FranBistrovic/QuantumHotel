package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ArticleTest {

    private Article article;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("admin");

        article = new Article();
        article.setId(1L);
        article.setTitle("Test Title");
        article.setDescription("Test Description");
        article.setCreated(LocalDateTime.now());
        article.setEdited(LocalDateTime.now());
        article.setAuthor(user);
    }

    @Test
    void testArticleProperties() {
        assertNotNull(article);
        assertEquals(1L, article.getId());
        assertEquals("Test Title", article.getTitle());
        assertEquals("Test Description", article.getDescription());
        assertNotNull(article.getCreated());
        assertNotNull(article.getEdited());
        assertEquals("admin", article.getAuthor().getUsername());
    }
}
