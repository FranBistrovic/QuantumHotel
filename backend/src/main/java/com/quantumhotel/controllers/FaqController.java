package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.FaqRequest;
import com.quantumhotel.controllers.dto.FaqResponse;
import com.quantumhotel.services.FaqService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;


import java.util.List;

@RestController
@RequestMapping("/api/faq")
public class FaqController {

    private final FaqService faqService;

    public FaqController(FaqService faqService) {
        this.faqService = faqService;
    }

    // PUBLIC
    @GetMapping
    public List<FaqResponse> getAll() {
        return faqService.findAll();
    }

    // STAFF / ADMIN
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public FaqResponse create(@RequestBody FaqRequest request,
                              Authentication authentication) {
        return faqService.create(request, extractUsername(authentication));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public FaqResponse update(@PathVariable Long id,
                              @RequestBody FaqRequest request,
                              Authentication authentication) {
        return faqService.update(id, request, extractUsername(authentication));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public void delete(@PathVariable Long id,
                       Authentication authentication) {
        faqService.delete(id, extractUsername(authentication));
    }

    private String extractUsername(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userDetails.getUsername(); // normal login
        }

        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email"); // Google OAuth2
        }

        throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
    }
}

