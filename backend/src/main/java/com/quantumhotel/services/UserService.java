package com.quantumhotel.services;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.AuthProvider;
import com.quantumhotel.users.Gender;
import com.quantumhotel.users.dto.NewUserDto;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.User;
import com.quantumhotel.users.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRegistry sessionRegistry;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserDto updateMe(User user, UpdateMeRequest body) {
        // PATCH semantics: only apply non-null fields
        if (body.email != null) user.setEmail(body.email);
        if (body.username != null) user.setUsername(body.username);
        if (body.firstName != null) user.setFirstName(body.firstName);
        if (body.lastName != null) user.setLastName(body.lastName);
        if (body.gender != null) user.setGender(body.gender);
        if (body.imageUrl != null) user.setImageUrl(body.imageUrl);
        if (body.city != null) user.setCity(body.city);
        if (body.dateOfBirth != null) user.setDateOfBirth(body.dateOfBirth);

        try {
            return UserDto.from(userRepository.save(user));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email/username/providerId must be unique");
        }
    }

    @Transactional
    public void deleteMe(User user) {
        user.setEnabled(false);
        user.setDeletedAt(Instant.now());
    }

    public List<UserDto> adminListUsers() {
        return userRepository.findAll().stream().map(UserDto::from).toList();
    }

    public UserDto adminGetUser(Long id) {
        return UserDto.from(findUserOrThrow(id));
    }

    public UserDto adminCreateUser(AdminCreateUserRequest body) {
        User u = new User();

        // Required-ish: role column is NOT NULL
        u.setRole(body.role != null ? body.role : Role.USER);

        // Basic identity fields
        u.setEmail(body.email);
        u.setUsername(body.username);
        u.setFirstName(body.firstName);
        u.setLastName(body.lastName);
        u.setGender(body.gender);
        u.setImageUrl(body.imageUrl);
        u.setCity(body.city);
        u.setDateOfBirth(body.dateOfBirth);

        // Provider fields
        if (body.provider != null) u.setProvider(body.provider);
        u.setProviderId(body.providerId);

        // Security/account flags
        if (body.enabled != null) u.setEnabled(body.enabled);
        if (body.accountNonLocked != null) u.setAccountNonLocked(body.accountNonLocked);
        if (body.requirePasswordChange != null) u.setRequirePasswordChange(body.requirePasswordChange);
        if (body.emailVerified != null) u.setEmailVerified(body.emailVerified);

        // Tokens
        u.setVerificationToken(body.verificationToken);
        u.setResetToken(body.resetToken);

        // Password (raw -> hash). Do NOT accept passwordHash directly.
        if (body.password != null && !body.password.isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(body.password));
        } else if (u.getProvider() == AuthProvider.LOCAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required for LOCAL users");
        }

        try {
            return UserDto.from(userRepository.save(u));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email/username/providerId must be unique");
        }
    }

    public UserDto adminPatchUser(Long id, AdminPatchUserRequest body) {
        User u = findUserOrThrow(id);

        if (body.email != null) u.setEmail(body.email);
        if (body.username != null) u.setUsername(body.username);
        if (body.firstName != null) u.setFirstName(body.firstName);
        if (body.lastName != null) u.setLastName(body.lastName);
        if (body.gender != null) u.setGender(body.gender);
        if (body.imageUrl != null) u.setImageUrl(body.imageUrl);
        if (body.city != null) u.setCity(body.city);
        if (body.dateOfBirth != null) u.setDateOfBirth(body.dateOfBirth);

        // Provider fields
        if (body.provider != null) u.setProvider(body.provider);
        if (body.providerId != null) u.setProviderId(body.providerId);

        // Account flags
        if (body.enabled != null) u.setEnabled(body.enabled);
        if (body.accountNonLocked != null) u.setAccountNonLocked(body.accountNonLocked);
        if (body.requirePasswordChange != null) u.setRequirePasswordChange(body.requirePasswordChange);
        if (body.emailVerified != null) u.setEmailVerified(body.emailVerified);

        // Tokens
        if (body.verificationToken != null) u.setVerificationToken(body.verificationToken);
        if (body.resetToken != null) u.setResetToken(body.resetToken);

        if (body.password != null && !body.password.isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(body.password));
        }

        try {
            return UserDto.from(userRepository.save(u));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email/username/providerId must be unique");
        }
    }

    @Transactional
    public void adminDeleteUser(Long id) {
        User user = findUserOrThrow(id);
        user.setEnabled(false);
        user.setDeletedAt(Instant.now());

        sessionRegistry.getAllPrincipals().forEach(principal -> {
            if (principal instanceof UserDetails ud &&
                    ud.getUsername().equals(user.getUsername())) {

                sessionRegistry.getAllSessions(principal, false)
                        .forEach(SessionInformation::expireNow);
            }
        });
    }

    public UserDto adminUpdateRole(Long id, Role role) {
        if (role == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role is required");
        User u = findUserOrThrow(id);
        u.setRole(role);
        return UserDto.from(userRepository.save(u));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    // For PATCH /api/users/me
    public static class UpdateMeRequest {
        public String email;
        public String username;
        public String firstName;
        public String lastName;
        public Gender gender;
        public String imageUrl;
        public String city;
        public LocalDate dateOfBirth;
    }

    // For POST /api/admin/users
    public static class AdminCreateUserRequest {
        public String email;
        public String username;
        public String firstName;
        public String lastName;
        public Gender gender;
        public String imageUrl;
        public String city;
        public LocalDate dateOfBirth;

        public Role role;

        public AuthProvider provider;
        public String providerId;

        public Boolean enabled;
        public Boolean accountNonLocked;
        public Boolean requirePasswordChange;
        public Boolean emailVerified;

        public String verificationToken;
        public String resetToken;

        public String password;
    }

    // For PATCH /api/admin/users/{id}
    public static class AdminPatchUserRequest {
        public String email;
        public String username;
        public String firstName;
        public String lastName;
        public Gender gender;
        public String imageUrl;
        public String city;
        public LocalDate dateOfBirth;

        public AuthProvider provider;
        public String providerId;

        public Boolean enabled;
        public Boolean accountNonLocked;
        public Boolean requirePasswordChange;
        public Boolean emailVerified;

        public String verificationToken;
        public String resetToken;

        public String password;
    }
}
