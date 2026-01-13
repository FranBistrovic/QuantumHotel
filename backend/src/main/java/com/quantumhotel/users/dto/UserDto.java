package com.quantumhotel.users.dto;

import com.quantumhotel.users.User;

import java.time.LocalDate;

public record UserDto(Boolean enabled, Boolean accountNonLocked, Long id, String username, String firstName, String lastName, String email, String imageUrl, String role, String gender, String city, LocalDate dateOfBirth, String provider) {
    public static UserDto from(User user) {
        return new UserDto(
                user.isEnabled(),
                user.isAccountNonLocked(),
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getImageUrl(),
                user.getRole().name(),
                user.getGender() != null ? user.getGender().name() : "",
                user.getCity(),
                user.getDateOfBirth(),
                user.getProvider().name()
        );
    }
}
