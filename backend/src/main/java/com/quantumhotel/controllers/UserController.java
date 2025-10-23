package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal OidcUser principal) {
        String providerId = principal.getAttribute("sub");
        return userRepository.findByProviderId(providerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
