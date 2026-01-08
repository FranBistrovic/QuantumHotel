package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.ArticleRequest;
import com.quantumhotel.controllers.dto.ArticleResponse;
import com.quantumhotel.services.ArticleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    // PUBLIC
    @GetMapping
    public List<ArticleResponse> getAll() {
        return articleService.getAll();
    }

    @GetMapping("/{id}")
    public ArticleResponse getById(@PathVariable Long id) {
        return articleService.getById(id);
    }

    // STAFF / ADMIN
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ArticleResponse create(@RequestBody ArticleRequest request,
                                  @AuthenticationPrincipal UserDetails principal) {
        return articleService.create(request, principal.getUsername());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ArticleResponse update(@PathVariable Long id,
                                  @RequestBody ArticleRequest request,
                                  @AuthenticationPrincipal UserDetails principal) {
        return articleService.update(id, request, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails principal) {
        articleService.delete(id, principal.getUsername());
    }
}
