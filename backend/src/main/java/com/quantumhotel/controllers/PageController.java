package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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

    @GetMapping("/login/staff")
    public String staffLoginPage(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            if (authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return "redirect:/admin/dashboard";
            }
            return "redirect:/staff/dashboard";
        }
        return "login-staff";
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication,
                            @AuthenticationPrincipal OidcUser oidcUser,
                            Model model) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        // STAFF / ADMIN (form-login users)
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_STAFF"))) {

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            UserDto userDto = UserDto.from(user);

            model.addAttribute("user", userDto);
            System.out.println(user.getRole().name());
            if ("ADMIN".equals(user.getRole().name())) {
                return "admin-dashboard";
            } else {
                return "staff-dashboard";
            }
        }

        // Google (OAuth2) users
        if (oidcUser != null) {
            String providerId = oidcUser.getAttribute("sub");

            User user = userRepository.findByProviderId(providerId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDto userDto = UserDto.from(user);

            model.addAttribute("user", userDto);

            return "dashboard";
        }

        // Fallback
        return "redirect:/login";
    }

    @GetMapping("/staff/dashboard")
    public String staffDashboard(Authentication authentication, Model model) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login/staff";
        }
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        UserDto dto = UserDto.from(user);

        model.addAttribute("user", dto);

        return "staff-dashboard";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login/staff";
        }

        return "admin-dashboard";
    }
}
