package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.services.UserService;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public UserDto getCurrentUser(Authentication authentication) {
        return UserDto.from(resolveCurrentUser(authentication));
    }

    @PatchMapping("/me")
    public UserDto patchCurrentUser(@RequestBody UserService.UpdateMeRequest body,
                                    Authentication authentication) {
        User user = resolveCurrentUser(authentication);
        return userService.updateMe(user, body);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser(Authentication authentication, HttpServletRequest request) {
        User user = resolveCurrentUser(authentication);
        userService.deleteMe(user);
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();

        return ResponseEntity.noContent().build();
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            String email = oidcUser.getAttribute("email");
            return userRepository.findByUsername(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "OIDC user not found: " + email));
        }

        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Unsupported authentication type: " + principal.getClass().getName());
    }
}
