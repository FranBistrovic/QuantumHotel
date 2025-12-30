package com.quantumhotel.controllers;

import com.quantumhotel.services.UserService;
import com.quantumhotel.users.Role;
import com.quantumhotel.users.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {
    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDto> listUsers() {
        return userService.adminListUsers();
    }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) {
        return userService.adminGetUser(id);
    }

    @PostMapping
    public UserDto createUser(@RequestBody UserService.AdminCreateUserRequest body) {
        return userService.adminCreateUser(body);
    }

    @PatchMapping("/{id}")
    public UserDto patchUser(@PathVariable Long id,
                             @RequestBody UserService.AdminPatchUserRequest body) {
        return userService.adminPatchUser(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.adminDeleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public UserDto updateRole(@PathVariable Long id,
                              @RequestBody UpdateRoleRequest body) {
        return userService.adminUpdateRole(id, body.role);
    }

    public static class UpdateRoleRequest {
        public Role role;
    }
}
