package com.quantumhotel.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.services.CustomOidcUserService;
import com.quantumhotel.users.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOidcUserService customOidcUserService;

    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.domain}")
    private String domain;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Public pages and assets
                        .requestMatchers("/api/auth/**", "/oauth2/**", "/css/**", "/js/**", "/images/**", "/logout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/faq/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/support/questions").authenticated()


                        // Admin-only API
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Staff or Admin API

                        .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/staff/**").hasAnyRole("ADMIN","STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/faq/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/faq/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/faq/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/articles/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/articles/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/articles/**").hasAnyRole("STAFF", "ADMIN")
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login") // normal user login page
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOidcUserService))
                        .successHandler((request, response, authentication) -> {
                            response.sendRedirect("/");
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
                        .loginPage("/api/auth/login")
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
        ;

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        String frontendOrigin = "https://" + domain;
	configuration.setAllowedOrigins(List.of(
            "http://localhost:3000", // local dev
            frontendOrigin           // deployed frontend
    	));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
