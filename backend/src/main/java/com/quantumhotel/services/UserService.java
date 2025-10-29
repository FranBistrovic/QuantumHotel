package com.quantumhotel.services;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.dto.NewUserDto;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public NewUserDto createStaffUser(String username, String firstName, String lastName) {
        if (userRepository.findByUsername(username).isPresent())
            throw new RuntimeException("Username already exists: " + username);

        String rawPassword = generateRandomPassword();
        String encoded = passwordEncoder.encode(rawPassword);

        User staff = new User();
        staff.setUsername(username);
        staff.setFirstName(firstName);
        staff.setLastName(lastName);
        staff.setPasswordHash(encoded);
        staff.setRole(Role.STAFF);
        staff.setRequirePasswordChange(true);

        userRepository.save(staff);

        return NewUserDto.from(staff, rawPassword);
    }

    public NewUserDto resetPassword(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            throw new RuntimeException("User not found");

        User user = userOpt.get();
        if (user.getRole() != Role.STAFF)
            throw new RuntimeException("Only STAFF accounts can be reset");

        String newPassword = generateRandomPassword();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setRequirePasswordChange(true);
        userRepository.save(user);

        return NewUserDto.from(user, newPassword);
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
