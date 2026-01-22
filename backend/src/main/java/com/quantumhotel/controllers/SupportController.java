package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.SupportQuestionDto;
import com.quantumhotel.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/questions")
    public ResponseEntity<Map<String, Object>> submitQuestion(
            @RequestBody SupportQuestionDto dto,
            Authentication authentication) {

        // Validate input
        if (dto.getSubject() == null || dto.getSubject().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Subject is required"
            ));
        }

        if (dto.getMessage() == null || dto.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Message is required"
            ));
        }

        if (dto.getSenderEmail() == null || dto.getSenderEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email is required"
            ));
        }

        // Send email
        try {
            emailService.sendSupportQuestion(
                    dto.getSenderEmail(),
                    dto.getSenderName() != null ? dto.getSenderName() : "Anonymous User",
                    dto.getSubject(),
                    dto.getMessage()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Your question has been sent successfully. We'll respond to your email shortly."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to send email. Please try again later.",
                    "details", e.getMessage()
            ));
        }
    }
}