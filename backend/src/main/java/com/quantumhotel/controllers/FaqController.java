package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.FaqRequest;
import com.quantumhotel.entity.Faq;
import com.quantumhotel.services.FaqService;
import com.quantumhotel.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    // PUBLIC
    @GetMapping
    public List<Faq> getAll() {
        return faqService.findAll();
    }

    // STAFF / ADMIN
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public Faq create(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                      @RequestBody FaqRequest dto) {

        String username = principal.getUsername(); // gets username from session
        return faqService.create(username, dto.getQuestion(), dto.getAnswer());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public Faq update(
            @PathVariable Long id,
            @RequestBody FaqRequest dto) {

        return faqService.update(
                id,
                dto.getQuestion(),
                dto.getAnswer()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public void delete(@PathVariable Long id) {
        faqService.delete(id);
    }
}