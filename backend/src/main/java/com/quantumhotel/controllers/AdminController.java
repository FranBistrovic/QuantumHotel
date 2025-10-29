package com.quantumhotel.controllers;

import com.quantumhotel.services.UserService;
import com.quantumhotel.users.dto.NewUserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @PostMapping("/create-staff")
    public NewUserDto createStaff(@RequestParam String username,
                                  @RequestParam String firstName,
                                  @RequestParam String lastName) {
        return userService.createStaffUser(username, firstName, lastName);
    }

    @PostMapping("/reset-password")
    public NewUserDto resetStaffPassword(@RequestParam Long id) {
        return userService.resetPassword(id);
    }
}
