package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.ArticleRequest;
import com.quantumhotel.controllers.dto.ArticleResponse;
import com.quantumhotel.services.ArticleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;


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
                                    Authentication authentication) {
        String username = extractUsername(authentication);
        return articleService.create(request, username);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ArticleResponse update(@PathVariable Long id,
                                  @RequestBody ArticleRequest request,
                                  Authentication authentication) {
        return articleService.update(id, request, extractUsername(authentication));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public void delete(@PathVariable Long id,
                       Authentication authentication) {
        articleService.delete(id, extractUsername(authentication));
    }

    private String extractUsername(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email"); // or "login", "sub", etc.
        }

        throw new IllegalStateException("Unknown principal type: " + principal.getClass());
    }
}
