package com.quantumhotel.services;

import com.quantumhotel.users.AuthProvider;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.User;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.beans.factory.annotation.Autowired;
import com.quantumhotel.repository.UserRepository;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class CustomOidcUserService extends OidcUserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        // Extract user details
        String providerId = oidcUser.getAttribute("sub");
        String email = oidcUser.getAttribute("email");
        String firstName = oidcUser.getAttribute("given_name");
        String lastName = oidcUser.getAttribute("family_name");
        String imageUrl = oidcUser.getAttribute("picture");

        String fileName = providerId + ".jpg";
        Path imagePath = Paths.get("uploads/profile_pics/" + fileName);

        try {
            Files.createDirectories(imagePath.getParent());

            try (InputStream in = new URL(imageUrl).openStream()) {
                Files.copy(in, imagePath, StandardCopyOption.REPLACE_EXISTING);
            }

        } catch (IOException e) {
            System.err.println("Failed to download Google profile image for " + email + ": " + e.getMessage());
        }

        String localImageUrl = "/uploads/profile_pics/" + fileName;

        User user = userRepository.findByUsername(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setProviderId(providerId);
                    newUser.setEmail(email);
                    newUser.setUsername(email);
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setImageUrl(localImageUrl);
                    newUser.setRole(Role.USER);
                    newUser.setProvider(AuthProvider.GOOGLE);
                    return userRepository.save(newUser);
                });

        // Update info if needed
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setImageUrl(localImageUrl);
        userRepository.save(user);

        Set <GrantedAuthority> mappedAuthorities = new HashSet<>();
        mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        mappedAuthorities.addAll(oidcUser.getAuthorities());

        return new DefaultOidcUser(mappedAuthorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}
