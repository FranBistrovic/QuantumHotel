package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.AuthProvider;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.RegisterRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.quantumhotel.services.EmailService;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private ResponseEntity<Map<String, Object>> jsonResponse(boolean success, String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequestDto request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return jsonResponse(false, "Email already in use.", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setUsername(request.email()); // use email as username
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), token);

        return jsonResponse(true, "Registration successful! Please check your email to verify your account.", HttpStatus.OK);
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token."));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return jsonResponse(true, "Email verified successfully! You can now log in.", HttpStatus.OK);
    }

    @PostMapping("/request-reset")
    public ResponseEntity<Map<String, Object>> requestReset(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with that email."));

        if (user.getProvider() != AuthProvider.LOCAL)
            return jsonResponse(false, "Password reset not available for Google accounts.", HttpStatus.BAD_REQUEST);

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
        return jsonResponse(true, "Password reset link sent to your email.", HttpStatus.OK);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestParam("token") String token,
                                                             @RequestParam("password") String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setRequirePasswordChange(false);
        userRepository.save(user);

        return jsonResponse(true, "Password successfully reset. You can now log in.", HttpStatus.OK);
    }
}
