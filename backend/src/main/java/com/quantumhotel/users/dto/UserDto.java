package com.quantumhotel.users.dto;

import com.quantumhotel.users.User;

public record UserDto(Long id, String firstName, String lastName, String email, String imageUrl, String role, String gender, String provider) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getImageUrl(),
                user.getRole().name(),
                user.getGender() != null ? user.getGender().name() : "",
                user.getProvider().name()
        );
    }
}
