package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.ArticleRequest;
import com.quantumhotel.controllers.dto.ArticleResponse;
import com.quantumhotel.entity.Article;
import com.quantumhotel.repository.ArticleRepository;
import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    // GET /api/articles
    public List<ArticleResponse> getAll() {
        return articleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // GET /api/articles/{id}
    public ArticleResponse getById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return toResponse(article);
    }

    // POST /api/articles
    public ArticleResponse create(ArticleRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setDescription(request.getDescription());
        article.setAuthor(user); // managed entity
        article.setCreated(LocalDateTime.now());

        return toResponse(articleRepository.save(article));
    }

    // PATCH /api/articles/{id}
    public ArticleResponse update(Long id, ArticleRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        if (request.getTitle() != null) {
            article.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            article.setDescription(request.getDescription());
        }

        article.setEdited(LocalDateTime.now());
        return toResponse(article);
    }

    // DELETE /api/articles/{id}
    public void delete(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        articleRepository.deleteById(id);
    }

    // Mapper
    private ArticleResponse toResponse(Article article) {
        ArticleResponse response = new ArticleResponse();
        response.setId(article.getId());
        response.setTitle(article.getTitle());
        response.setDescription(article.getDescription());
        response.setCreated(article.getCreated());
        response.setEdited(article.getEdited());
        return response;
    }
}
