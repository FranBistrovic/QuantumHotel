package com.quantumhotel.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
                @UniqueConstraint(name = "uk_users_provider_id", columnNames = "provider_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class User extends com.quantumhotel.entity.AbstractEntity {
    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "username", length = 64)
    private String username;

    @JsonIgnore
    @Column(name = "password_hash", length = 100)
    private String passwordHash;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 16)
    private Gender gender;

    @Column(name = "city", length = 32)
    private String city;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "provider_id", length = 128)
    private String providerId;

    private String imageUrl;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean accountNonLocked = true;

    @Column(nullable = false)
    private boolean requirePasswordChange = false;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "reset_token")
    private String resetToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", length = 32, nullable = false)
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
