package com.quantumhotel.users.dto;

import com.quantumhotel.users.User;

public record NewUserDto(String username, String temporaryPassword) {
    public static NewUserDto from(User user, String temporaryPassword) {
        return new NewUserDto(
                user.getUsername(),
                temporaryPassword
        );
    }
}