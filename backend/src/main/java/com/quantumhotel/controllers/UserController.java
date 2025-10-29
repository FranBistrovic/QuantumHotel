package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public UserDto getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            String providerId = oidcUser.getAttribute("sub");
            User user = userRepository.findByProviderId(providerId)
                    .orElseThrow(() -> new RuntimeException("OIDC user not found: " + providerId));
            return UserDto.from(user);
        }

        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return UserDto.from(user);
        }

        throw new RuntimeException("Unsupported authentication type: " + principal.getClass());
    }
}
