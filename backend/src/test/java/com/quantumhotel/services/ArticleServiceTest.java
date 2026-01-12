package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.ArticleResponse;
import com.quantumhotel.entity.Article;
import com.quantumhotel.repository.ArticleRepository;
import com.quantumhotel.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ArticleServiceTest {
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ArticleService articleService;
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void shouldReturnAllArticles() {
        Article a1 = new Article();
        a1.setId(1L);
        a1.setTitle("Article 1");
        a1.setDescription("Desc 1");
        a1.setCreated(LocalDateTime.now());
        Article a2 = new Article();
        a2.setId(2L);
        a2.setTitle("Article 2");
        a2.setDescription("Desc 2");
        a2.setCreated(LocalDateTime.now());
        when(articleRepository.findAll()).thenReturn(List.of(a1, a2));
        List<ArticleResponse> result = articleService.getAll();
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Article 1", result.get(0).getTitle());
        assertEquals("Article 2", result.get(1).getTitle());
    }
}
