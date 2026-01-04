package com.quantumhotel.users.dto;

import com.quantumhotel.users.User;

import java.time.LocalDate;

public record UserDto(Long id, String firstName, String lastName, String email, String imageUrl, String role, String gender, String city, LocalDate dateOfBirth, String provider) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
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
