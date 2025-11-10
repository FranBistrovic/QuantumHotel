package com.quantumhotel.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.services.CustomOidcUserService;
import com.quantumhotel.users.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOidcUserService customOidcUserService;

    @Autowired
    private UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Public pages and assets
                        .requestMatchers("/", "/login", "/api/auth/**", "/oauth2/**", "/css/**", "/js/**", "/images/**", "/logout").permitAll()

                        // Admin-only API
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Staff or Admin API
                        .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/staff/**").hasAnyRole("ADMIN","STAFF")

                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login") // normal user login page
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOidcUserService))
                        .successHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setContentType("application/json;charset=UTF-8");

                            Long userId = null;
                            Object principal = authentication.getPrincipal();
                            if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser) {
                                String email = oidcUser.getAttribute("email");
                                userId = userRepository.findByUsername(email)
                                        .map(User::getId)
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                            }

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", true);
                            body.put("message", "Login successful");
                            body.put("id", userId);

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", false);
                            body.put("error", exception.getMessage() != null ? exception.getMessage() : "OAuth2 login failed");

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                )

                .formLogin(form -> form
                        .loginPage("/login")
                        .successHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setContentType("application/json;charset=UTF-8");

                            String username = authentication.getName();
                            User user = userRepository.findByUsername(username)
                                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", true);
                            body.put("message", "Login successful");
                            body.put("id", user.getId());

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", false);
                            body.put("error", exception.getMessage() != null ? exception.getMessage() : "Login failed");

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutSuccessUrl("/")
                        .deleteCookies("JSESSIONID")
                        .invalidateHttpSession(true)
                        .permitAll()
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setContentType("application/json;charset=UTF-8");

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", true);
                            body.put("message", "Logout successful");

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", false);
                            body.put("error", "Unauthorized access");
                            body.put("message", authException.getMessage());
                            body.put("status", 401);

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })

                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");

                            Map<String, Object> body = new HashMap<>();
                            body.put("success", false);
                            body.put("error", "Access denied");
                            body.put("message", accessDeniedException.getMessage());
                            body.put("status", 403);

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                )

                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
