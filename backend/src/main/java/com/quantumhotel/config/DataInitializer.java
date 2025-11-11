package com.quantumhotel.config;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Value("${app.domain}")
    private String domain;
    @Bean
    CommandLineRunner initDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEmail("admin@quantumhotel.com");
                admin.setRole(Role.ADMIN);
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setEnabled(true);
                admin.setAccountNonLocked(true);
                admin.setEmailVerified(true);

                userRepository.save(admin);
                System.out.println("Default ADMIN user created: admin / admin123");
            } else {

                System.out.println("Admin user already exists, skipping creation.");
                System.out.println(domain);
            }
        };
    }
}
