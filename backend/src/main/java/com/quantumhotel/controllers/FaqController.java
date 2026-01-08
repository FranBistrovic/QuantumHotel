package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.FaqRequest;
import com.quantumhotel.controllers.dto.FaqResponse;
import com.quantumhotel.services.FaqService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
                              @AuthenticationPrincipal UserDetails principal) {
        return faqService.create(request, principal.getUsername());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public FaqResponse update(@PathVariable Long id,
                              @RequestBody FaqRequest request,
                              @AuthenticationPrincipal UserDetails principal) {
        return faqService.update(id, request, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails principal) {
        faqService.delete(id, principal.getUsername());
    }
}
