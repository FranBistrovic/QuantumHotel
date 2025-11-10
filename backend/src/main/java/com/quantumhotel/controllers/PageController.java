package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;

@Controller
public class PageController {
    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String loginPage(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/dashboard";
        }
        return "login";
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        // not logged in
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        String username = authentication.getName();

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof OidcUser oidcUser) {
                String email = oidcUser.getAttribute("email");
                optionalUser = userRepository.findByUsername(email);
            }
        }

        if (optionalUser.isEmpty()) {
            return "redirect:/login";
        }

        User user = optionalUser.get();
        UserDto userDto = UserDto.from(user);
        model.addAttribute("user", userDto);

        // route by role
        switch (user.getRole()) {
            case ADMIN:
                return "admin-dashboard";
            case STAFF:
                return "staff-dashboard";
            default:
                return "dashboard";
        }
    }

    @GetMapping("/staff/dashboard")
    public String staffDashboard(Authentication authentication, Model model) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        String username = authentication.getName();

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof OidcUser oidcUser) {
                String email = oidcUser.getAttribute("email");
                optionalUser = userRepository.findByUsername(email);
            }
        }

        if (optionalUser.isEmpty()) {
            return "redirect:/login";
        }

        User user = optionalUser.get();
        UserDto userDto = UserDto.from(user);
        model.addAttribute("user", userDto);

        return "staff-dashboard";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        return "admin-dashboard";
    }
}
